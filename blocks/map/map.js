/**
 * map — venue map embed (canon map-embed). Authoring: a single row whose
 * cell holds one link — the Google Maps embed URL; the link text becomes
 * the iframe title.
 */
export default async function decorate(block) {
  const a = block.querySelector('a');
  const container = document.createElement('div');
  container.className = 'container';
  if (a) {
    const iframe = document.createElement('iframe');
    iframe.src = a.href;
    iframe.title = a.textContent.trim() || 'Map';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    container.append(iframe);
  }
  block.replaceChildren(container);
}
