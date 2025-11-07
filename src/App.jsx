import { Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/servicos" element={<Services />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
      </Route>
    </Routes>
  );
}

export default App;
