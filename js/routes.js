/**
 * GEO DESIGNS & RESEARCH — CANONICAL ROUTE REGISTRY
 * 
 * Reusable Website-Wide Routing Rule:
 * Whenever a new page is created:
 * 1. Register its canonical internal route here in CANONICAL_ROUTES.
 * 2. Every existing navigation link, expertise card, CTA, or internal link
 *    explicitly associated with that page must resolve to that canonical route.
 * 3. Services without dedicated pages fall back to their homepage section anchor
 *    (#card-<id> on the homepage, /index.html#card-<id> on subpages).
 */

export const CANONICAL_ROUTES = {
  // Core Corporate Pages
  home: '/index.html',
  about: '/about-1.html',

  // Expertise Service Pages (ordered per Expertise navigation sequence)
  architecture: '/architecture.html', // 1. Architecture & Master Planning (Active Dedicated Page)
  bim: '/bim.html', // 2. BIM Modeling & Auditing (Active Dedicated Page)

  // Future Service Pages (to be activated as new pages are implemented):
  // bridge: '/bridge.html',
  // commerce: '/commerce.html',
  // hydro: '/hydro.html',
  // lab: '/lab.html',
  // mepf: '/mepf.html',
  // pmc: '/pmc.html',
  // structure: '/structure.html',
  // survey: '/survey.html',
  // sustainability: '/sustainability.html'
};

/**
 * Returns the canonical internal route for a given service category.
 * If a dedicated page is registered in CANONICAL_ROUTES, returns its canonical route.
 * Otherwise, falls back to the in-page anchor on index.html.
 * 
 * @param {string} categoryKey - The service key (e.g., 'architecture', 'pmc')
 * @param {boolean} isSubpage - True if current location is not the homepage root
 * @returns {string} - The destination URL
 */
export function getServiceRoute(categoryKey, isSubpage = false) {
  if (CANONICAL_ROUTES[categoryKey]) {
    return CANONICAL_ROUTES[categoryKey];
  }
  return isSubpage ? `/index.html#card-${categoryKey}` : `#card-${categoryKey}`;
}
