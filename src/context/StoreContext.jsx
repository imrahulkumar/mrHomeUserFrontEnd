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
    const root = document.documentElement.style;
    if (settings.theme?.primaryColor) root.setProperty('--gold', settings.theme.primaryColor);
    if (settings.theme?.primaryDark) root.setProperty('--gold-dark', settings.theme.primaryDark);
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
