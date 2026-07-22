/**
 * hero — hub/city split hero (canon hero-split).
 * Authoring rows (single cell each, order tolerant — decoded by querying):
 *   eyebrow text | <h1> headline | optional short venue line | lede |
 *   CTA paragraphs (<em><a>/<strong><a>) | image.
 * Variants: marquetry-tl (confetti decoration).
 */
export default async function decorate(block) {
  const pic = block.querySelector('picture, img');
  const heading = block.querySelector('h1, h2');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const ctaPs = ps.filter((p) => p.querySelector('a'));
  const textPs = ps.filter((p) => !p.querySelector('a'));
  const before = [];
  const after = [];
  textPs.forEach((p) => {
    const precedes = heading
      // eslint-disable-next-line no-bitwise
      && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING);
    if (precedes) before.push(p);
    else after.push(p);
  });

  const container = document.createElement('div');
  container.className = 'container';
  const copy = document.createElement('div');
  copy.className = 'hero-copy';

  if (before.length) {
    const eyebrow = before[0];
    eyebrow.className = 't-eyebrow';
    copy.append(eyebrow);
  }
  if (heading) copy.append(heading);
  if (after.length > 1) {
    const venue = after[0];
    venue.className = 'venue-line';
    copy.append(venue);
    const lede = after[1];
    lede.className = 't-lede';
    copy.append(lede);
  } else if (after.length === 1) {
    const lede = after[0];
    lede.className = 't-lede';
    copy.append(lede);
  }
  if (ctaPs.length) {
    const row = document.createElement('div');
    row.className = 'cta-row';
    ctaPs.forEach((p) => {
      p.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
      row.append(p);
    });
    copy.append(row);
  }
  container.append(copy);

  if (pic) {
    const media = document.createElement('div');
    media.className = 'hero-media';
    const wrapper = pic.tagName === 'PICTURE' ? pic : pic.closest('picture') || pic;
    media.append(wrapper);
    // LCP: eager-load the hero image (#100)
    const img = media.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    }
    container.append(media);
  }

  block.replaceChildren(container);
}
