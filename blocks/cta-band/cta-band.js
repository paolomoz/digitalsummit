/**
 * cta-band — join-us / partner CTA band (canon cta-band).
 * Authoring rows (single cell): optional background image | <h2> headline
 * (an <em> inside renders as the gold year) | optional lede | CTA paragraphs.
 * Variants: (default photo w/ gradient scrim when an image row is authored) |
 * dark (gradient-band-dark ground).
 */
export default async function decorate(block) {
  const pic = block.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img && img.src) {
      block.style.backgroundImage = `url('${img.src}')`;
      block.classList.add('has-photo');
    }
    const row = pic.closest('.cta-band > div');
    if (row) row.remove();
  }

  const container = document.createElement('div');
  container.className = 'container';
  const heading = block.querySelector('h1, h2, h3');
  if (heading) {
    const year = heading.querySelector('em');
    if (year) {
      const span = document.createElement('span');
      span.className = 'year';
      span.textContent = year.textContent;
      year.replaceWith(span);
    }
    container.append(heading);
  }
  const ps = [...block.querySelectorAll('p')].filter((p) => p.textContent.trim());
  const ctas = ps.filter((p) => p.querySelector('a'));
  const texts = ps.filter((p) => !p.querySelector('a'));
  texts.forEach((p) => {
    p.className = 't-lede';
    container.append(p);
  });
  if (ctas.length) {
    const row = document.createElement('div');
    row.className = 'cta-row';
    ctas.forEach((p) => {
      p.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
      row.append(p);
    });
    container.append(row);
  }
  block.replaceChildren(container);
}
