import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';

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
