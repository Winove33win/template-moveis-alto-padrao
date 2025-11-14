import { Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { CatalogLayout } from "@/layouts/CatalogLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Portfolio from "@/pages/Portfolio";
import Consulting from "@/pages/Consulting";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import ProductsPage from "@/pages/ProductsPage";
import ProductsCategoryPage from "@/pages/ProductsCategoryPage";
import ProductDetailPage from "@/pages/ProductDetailPage";

import AdminProducts from "@/pages/admin/AdminProducts";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCategoryForm from "@/pages/admin/AdminCategoryForm";
import AdminProductForm from "@/pages/admin/AdminProductForm";


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
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

      <Route path="/admin/produtos" element={<AdminProducts />} />
      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="catalogo" element={<AdminDashboard />} />
          <Route path="catalogo/categorias/nova" element={<AdminCategoryForm />} />
          <Route path="catalogo/categorias/:categoryId" element={<AdminCategoryForm />} />
          <Route path="catalogo/produtos/novo" element={<AdminProductForm />} />
          <Route path="catalogo/produtos/:productId" element={<AdminProductForm />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
