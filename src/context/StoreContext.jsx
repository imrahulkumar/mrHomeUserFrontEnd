import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';
import { getFont, loadFonts } from '../utils/fonts';

const StoreContext = createContext(null);

/** Loads site settings and the category tree once, and applies the theme colours. */
export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    Promise.all([api.getSettings(), api.getCategories()])
      .then(([s, c]) => {
        setSettings(s);
        setCategories(c);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!settings) return;
    document.title = settings.siteName;
    const { preset = 'classic', customColors, primaryColor, primaryDark } = settings.theme ?? {};
    document.documentElement.dataset.theme = preset;
    // Custom colours override the preset's accent; otherwise let the [data-theme] block decide.
    const root = document.documentElement.style;
    const apply = (name, value) => (customColors && value ? root.setProperty(name, value) : root.removeProperty(name));
    apply('--gold', primaryColor);
    apply('--gold-dark', primaryDark);

    // Layout, typography and motion choices become html[data-*] attributes that index.css styles.
    const { appearance = {}, header = {}, animation = {} } = settings;
    const html = document.documentElement;
    Object.assign(html.dataset, {
      fontSize: appearance.fontSize ?? 'medium',
      buttons: appearance.buttonShape ?? 'theme',
      cards: appearance.cardStyle ?? 'theme',
      header: header.style ?? 'classic',
      sticky: String(header.sticky ?? true),
      menu: header.menuStyle ?? 'underline',
      menuAlign: header.menuAlign ?? 'left',
      menuCase: header.menuUppercase ? 'upper' : 'normal',
      pageAnim: animation.pageTransition ?? 'fade',
      reveal: String(animation.scrollReveal ?? true),
      hover: animation.cardHover ?? 'lift',
      speed: animation.speed ?? 'normal',
    });
    const cols = appearance.productColumns;
    if (cols) {
      html.dataset.cols = '';
      root.setProperty('--cols', cols);
    } else {
      delete html.dataset.cols;
      root.removeProperty('--cols');
    }
    loadFonts([appearance.headingFont, appearance.bodyFont]);
    for (const [name, id] of [['--font-heading', appearance.headingFont], ['--font-body', appearance.bodyFont]]) {
      const font = getFont(id);
      if (font) root.setProperty(name, font.family);
      else root.removeProperty(name);
    }
  }, [settings]);

  if (error) {
    return (
      <div className="boot-state">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={load}>Try again</button>
      </div>
    );
  }
  if (!settings) return <div className="boot-state"><span className="spinner" /></div>;

  return <StoreContext.Provider value={{ settings, categories }}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
