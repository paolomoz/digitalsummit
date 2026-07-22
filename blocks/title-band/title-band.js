/**
 * title-band — event/page title over a gradient or photo band (canon
 * event-title-band). Variants: (default indigo-cyan) | purple-magenta |
 * dark | photo (first row holds the background image).
 * Authoring rows (single cell): optional image | <h1> | optional lede |
 * optional extra lines (venue address etc., links stay plain).
 */
export default async function decorate(block) {
  const pic = block.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img && img.src) {
      block.style.backgroundImage = `url('${img.src}')`;
      block.classList.add('has-photo');
    }
    const row = pic.closest('.title-band > div');
    if (row) row.remove();
  }

  const container = document.createElement('div');
  container.className = 'container';
  const heading = block.querySelector('h1, h2');
  if (heading) container.append(heading);
  const ps = [...block.querySelectorAll('p')].filter((p) => p.textContent.trim());
  ps.forEach((p, i) => {
    if (i === 0) p.className = 't-lede';
    container.append(p);
  });
  block.replaceChildren(container);
}
