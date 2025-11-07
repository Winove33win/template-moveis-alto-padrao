import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { QuoteModalContext } from "@/context/QuoteModalContext";
import { buildProductCategoryPath, navItems, productCategories } from "@/data/navigation";

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
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const productsButtonRef = useRef(null);
  const productsMenuRef = useRef(null);

  useEffect(() => {
    const SCROLL_ENTER_THRESHOLD = 64;
    const SCROLL_EXIT_THRESHOLD = 16;

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
    setIsProductsMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    if (!isProductsMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        productsMenuRef.current?.contains(event.target) ||
        productsButtonRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsProductsMenuOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProductsMenuOpen(false);
        productsButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProductsMenuOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      setIsMobileProductsOpen(false);
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (isProductsMenuOpen && document.activeElement === productsButtonRef.current) {
      const firstLink = productsMenuRef.current?.querySelector("a");
      firstLink?.focus();
    }
  }, [isProductsMenuOpen]);

  const contextValue = useMemo(
    () => ({
      isOpen: isQuoteOpen,
      open: () => setIsQuoteOpen(true),
      close: () => setIsQuoteOpen(false),
    }),
    [isQuoteOpen]
  );

  const handleProductsBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsProductsMenuOpen(false);
    }
  };

  const handleProductsButtonKeyDown = (event) => {
    if (event.key === "ArrowDown" && !isProductsMenuOpen) {
      event.preventDefault();
      setIsProductsMenuOpen(true);
    }
  };

  const handleMobileLinkClick = () => {
    setMobileOpen(false);
    setIsMobileProductsOpen(false);
  };

  return (
    <QuoteModalContext.Provider value={contextValue}>
      <div className="app-shell">
        <header className={`app-header ${scrolled ? "app-header--compact" : ""}`}>
          <div className="container app-header__inner">
            <NavLink to="/" className="brand" aria-label="Nobile Design Home">
              Nobile Design
            </NavLink>
            <nav className="nav-desktop" aria-label="Principal">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "is-active" : "")}>
                  {item.label}
                </NavLink>
              ))}
              <div
                className="nav-desktop__group"
                onBlur={handleProductsBlur}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsProductsMenuOpen(false);
                    productsButtonRef.current?.focus();
                  }
                }}
              >
                <button
                  type="button"
                  className="nav-desktop__button"
                  aria-haspopup="true"
                  aria-expanded={isProductsMenuOpen}
                  aria-controls="desktop-products-menu"
                  onClick={() => setIsProductsMenuOpen((previous) => !previous)}
                  onKeyDown={handleProductsButtonKeyDown}
                  ref={productsButtonRef}
                >
                  Produtos
                  <ChevronDown className="nav-desktop__button-icon" size={16} aria-hidden="true" />
                </button>
                <ul
                  id="desktop-products-menu"
                  className={`nav-desktop__menu ${isProductsMenuOpen ? "is-visible" : ""}`}
                  ref={productsMenuRef}
                  aria-label="Categorias de produtos"
                >
                  {productCategories.map((category) => (
                    <li key={category.slug}>
                      <NavLink
                        to={buildProductCategoryPath(category.slug)}
                        onClick={() => setIsProductsMenuOpen(false)}
                        className={({ isActive }) => (isActive ? "is-active" : "")}
                      >
                        {category.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
            <div className="header-actions">
              <button type="button" className="btn btn-outline" onClick={() => setIsQuoteOpen(true)}>
                Solicitar consultoria
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
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => (isActive ? "is-active" : "")}
                      onClick={handleMobileLinkClick}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <div className={`mobile-accordion ${isMobileProductsOpen ? "is-open" : ""}`}>
                    <button
                      type="button"
                      className="mobile-accordion__trigger"
                      aria-expanded={isMobileProductsOpen}
                      aria-controls="mobile-products-menu"
                      onClick={() => setIsMobileProductsOpen((previous) => !previous)}
                    >
                      <span>Produtos</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    <div
                      id="mobile-products-menu"
                      className="mobile-accordion__panel"
                      aria-label="Categorias de produtos"
                    >
                      {productCategories.map((category) => (
                        <NavLink
                          key={category.slug}
                          to={buildProductCategoryPath(category.slug)}
                          onClick={handleMobileLinkClick}
                          className={({ isActive }) => (isActive ? "is-active" : "")}
                        >
                          {category.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setMobileOpen(false);
                    setIsQuoteOpen(true);
                  }}
                >
                  Solicitar consultoria
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
