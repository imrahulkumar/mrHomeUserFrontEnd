import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings, categories } = useStore();
  const { contact = {}, social = {} } = settings;
  const socials = [
    ['Instagram', social.instagram],
    ['Facebook', social.facebook],
    ['YouTube', social.youtube],
  ].filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>{settings.siteName}</h3>
          {contact.address && <p className="muted">{contact.address}</p>}
        </div>
        <div>
          <h4>Shop</h4>
          {categories.map((c) => (
            <Link key={c._id} to={`/shop/${c.slug}`}>{c.name}</Link>
          ))}
        </div>
        {(contact.email || contact.phone || contact.whatsapp) && (
          <div>
            <h4>Contact</h4>
            {contact.phone && <a href={`tel:${contact.phone}`}>📞 {contact.phone}</a>}
            {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
            {contact.email && <a href={`mailto:${contact.email}`}>✉️ {contact.email}</a>}
          </div>
        )}
        {socials.length > 0 && (
          <div>
            <h4>Follow us</h4>
            {socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </div>
        )}
      </div>
      <p className="footer-bottom">
        © {new Date().getFullYear()} {settings.siteName}
        {settings.footerText && ` · ${settings.footerText}`}
      </p>
    </footer>
  );
}
