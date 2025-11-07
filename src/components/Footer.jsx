import { NavLink } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">Nobile Design</p>
          <p className="footer-subtitle">
            Mobiliário autoral e curadoria de peças assinadas para projetos residenciais e corporativos de alto padrão.
          </p>
        </div>
        <nav aria-label="Rodapé" className="footer-nav">
          <span>Navegue</span>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/colecoes">Coleções</NavLink>
          <NavLink to="/ambientes">Ambientes</NavLink>
          <NavLink to="/sobre">Sobre</NavLink>
          <NavLink to="/consultoria">Consultoria</NavLink>
        </nav>
        <div className="footer-contact">
          <span>Fale conosco</span>
          <a href="mailto:contato@nobiledesign.com">
            <Mail size={18} /> contato@nobiledesign.com
          </a>
          <a href="tel:+5511999999999">
            <Phone size={18} /> +55 (11) 99999-9999
          </a>
          <p>
            <MapPin size={18} /> Alameda das Artes, 250 - São Paulo/SP
          </p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {year} Nobile Design. Todos os direitos reservados.</p>
        <div className="footer-legal">
          <NavLink to="/politica-de-privacidade">Política de privacidade</NavLink>
          <NavLink to="/termos-de-uso">Termos de uso</NavLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
