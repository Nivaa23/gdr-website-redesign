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
  bridge: '/bridge.html', // 3. Bridge Engineering (Active Dedicated Page)
  commerce: '/commerce.html', // 4. Commerce & Contract Management (Active Dedicated Page)
  hydro: '/hydro.html', // 5. Hydro & Highway DPR (Active Dedicated Page)
  lab: '/lab.html', // 6. Laboratory & Material Testing (Active Dedicated Page)
  pmc: '/pmc.html', // 7. Project Management Consultancy (PMC) (Active Dedicated Page)
  structure: '/structure.html', // 8. Structural Engineering (Active Dedicated Page)
  mepf: '/mepf.html', // 9. MEPF Engineering (Active Dedicated Page)
  survey: '/survey.html', // 10. Survey & Geomatics (Active Dedicated Page)
  sustainability: '/sustainability.html', // 11. Environmentally Sustainable Solutions (Active Dedicated Page)
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
