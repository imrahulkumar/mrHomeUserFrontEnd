import { BASE_URL } from '../api/client';

/** Home-screen icon rendered by the API from the store logo (see the backend's pwa.controller). */
export const appIconUrl = (size, version) => `${BASE_URL}/pwa/icon/${size}.png?app=store${version ? `&v=${version}` : ''}`;

function setHeadLink(rel, href) {
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Points the install manifest and iPhone home-screen icon at the API, so an installed app uses the
 * current site name and logo instead of the built-in icons. Without a logo the built-in icons stay.
 */
export function applyAppIdentity(settings) {
  setHeadLink('manifest', `${BASE_URL}/pwa/manifest.webmanifest?app=store&origin=${encodeURIComponent(window.location.origin)}`);
  document.head.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', settings.siteName);
  if (settings.logo) {
    const version = Date.parse(settings.updatedAt) || '';
    setHeadLink('apple-touch-icon', appIconUrl(180, version));
  }
}
