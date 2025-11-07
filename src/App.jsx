import { Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { CatalogLayout } from "@/layouts/CatalogLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Collections from "@/pages/Collections";
import Portfolio from "@/pages/Portfolio";
import Consulting from "@/pages/Consulting";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import ProductsPage from "@/pages/ProductsPage";
import ProductsCategoryPage from "@/pages/ProductsCategoryPage";
import ProductDetailPage from "@/pages/ProductDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/colecoes" element={<Collections />} />
        <Route path="/ambientes" element={<Portfolio />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/consultoria" element={<Consulting />} />
        <Route element={<CatalogLayout />}>
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produtos/:categoryId" element={<ProductsCategoryPage />} />
          <Route path="/produto/:productId" element={<ProductDetailPage />} />
        </Route>
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
      </Route>
    </Routes>
  );
}

export default App;
