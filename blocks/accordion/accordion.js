/**
 * accordion — semantic details/summary FAQ (block-collection pattern name).
 * Authoring rows: [question | answer]. The first item renders open.
 */
export default async function decorate(block) {
  const container = document.createElement('div');
  container.className = 'container';
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    if (cells.length < 2) {
      const head = document.createElement('div');
      head.className = 'section-head';
      head.append(...(cells[0] ? cells[0].childNodes : []));
      container.append(head);
      return;
    }
    const details = document.createElement('details');
    if (i === 0 || (container.querySelectorAll('details').length === 0 && !container.querySelector('.section-head'))) {
      // first item open (canon default)
    }
    const summary = document.createElement('summary');
    summary.textContent = cells[0].textContent.trim();
    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.append(...cells[1].childNodes);
    details.append(summary, body);
    if (container.querySelectorAll('details').length === 0) details.open = true;
    container.append(details);
  });
  block.replaceChildren(container);
}
