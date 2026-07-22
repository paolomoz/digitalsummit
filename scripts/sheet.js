/**
 * sheet.js — shared helpers for sheet-driven blocks (dynamic phase).
 *
 * Authoring contract: a block opts into sheet mode with a config row whose
 * first cell contains ONLY a link to a *.json sheet (DA / query-index style:
 * `{ data: [...] }`). An optional second cell in the same row scopes the data
 * (e.g. a city slug). All other rows keep their static meaning (section head,
 * CTA rows), so static and sheet-driven authoring co-exist.
 */

const cache = new Map();

/**
 * Fetches a sheet (query-index style JSON) and returns its data rows.
 * @param {string} url sheet URL (same-origin path preferred)
 * @returns {Promise<Array<Object>>} rows (empty array on failure)
 */
export async function fetchSheet(url) {
  const key = new URL(url, window.location.href).pathname;
  if (!cache.has(key)) {
    cache.set(key, fetch(`${key}${key.includes('?') ? '&' : '?'}limit=2000`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []));
  }
  return cache.get(key);
}

/**
 * Detects and consumes a sheet-config row on a block.
 * @param {Element} block
 * @returns {null|{url: string, scope: string}} config, or null (static block)
 */
export function readSheetConfig(block) {
  let config = null;
  [...block.children].forEach((row) => {
    if (config) return;
    const cells = [...row.children];
    const a = cells[0] && cells[0].querySelector('a[href*=".json"]');
    if (a && cells[0].textContent.trim() === a.textContent.trim()) {
      const scope = cells[1] ? cells[1].textContent.trim().toLowerCase() : '';
      row.remove();
      config = { url: a.getAttribute('href'), scope };
    }
  });
  return config;
}

/**
 * Creates an optimized <picture> for an external (Swoogo CDN) or local image.
 * External images get plain <img loading=lazy>; local paths could be routed
 * through createOptimizedPicture by callers if needed.
 * @param {string} src
 * @param {string} alt
 * @param {number} [width]
 * @param {number} [height]
 * @returns {HTMLImageElement}
 */
export function sheetImg(src, alt, width, height) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = 'lazy';
  if (width) img.width = width;
  if (height) img.height = height;
  return img;
}
