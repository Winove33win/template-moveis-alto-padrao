import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { QuoteModalContext } from "@/context/QuoteModalContext";

const navItems = [
  { label: "Início", to: "/" },
  { label: "Sobre", to: "/sobre" },
  { label: "Serviços", to: "/servicos" },
  { label: "Contato", to: "/contato" },
];

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function MainLayout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    const SCROLL_ENTER_THRESHOLD = 64;
    const SCROLL_EXIT_THRESHOLD = 16;

    // Apply hysteresis so the header doesn't flicker when hovering near the top.
    const listener = () => {
      setScrolled((previous) => {
        if (previous) {
          return window.scrollY > SCROLL_EXIT_THRESHOLD;
        }
        return window.scrollY >= SCROLL_ENTER_THRESHOLD;
      });
    };
    window.addEventListener("scroll", listener, { passive: true });
    listener();
    return () => window.removeEventListener("scroll", listener);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const contextValue = useMemo(
    () => ({
      isOpen: isQuoteOpen,
      open: () => setIsQuoteOpen(true),
      close: () => setIsQuoteOpen(false),
    }),
    [isQuoteOpen]
  );

  return (
    <QuoteModalContext.Provider value={contextValue}>
      <div className="app-shell">
        <header className={`app-header ${scrolled ? "app-header--compact" : ""}`}>
          <div className="container app-header__inner">
            <NavLink to="/" className="brand">
              LogiPro
            </NavLink>
            <nav className="nav-desktop" aria-label="Principal">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "is-active" : "")}> 
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="header-actions">
              <button type="button" className="btn btn-outline" onClick={() => setIsQuoteOpen(true)}>
                Solicitar cotação
              </button>
              <button
                type="button"
                className="nav-trigger"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.nav
                className="mobile-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
              >
                <div className="mobile-drawer__header">
                  <span>Menu</span>
                  <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                    <X size={22} />
                  </button>
                </div>
                <div className="mobile-drawer__links">
                  {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "is-active" : "")}> 
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setIsQuoteOpen(true)}>
                  Solicitar cotação
                </button>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
        <ScrollToTopButton />
        <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
      </div>
    </QuoteModalContext.Provider>
  );
}

export default MainLayout;
