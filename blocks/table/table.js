/**
 * table — generic semantic table (pricing matrix, agenda at-a-glance).
 * Authoring rows:
 *   leading single-cell rows with headings = section head;
 *   first multi-cell row = column headers; following rows = body.
 * Variants: pricing (tier matrix with ✓ marks), glance (compact agenda
 *   grid), striped (zebra rows). A lone "✓" cell renders as a check mark.
 */
export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  let headerDone = false;

  rows.forEach((cells) => {
    if (cells.length === 1 && !headerDone && !tbody.children.length && cells[0].querySelector('h1, h2, h3, p')) {
      head.append(...cells[0].childNodes);
      return;
    }
    const tr = document.createElement('tr');
    cells.forEach((cell, i) => {
      const isHeader = !headerDone;
      const el = document.createElement(isHeader || i === 0 ? 'th' : 'td');
      if (isHeader) el.scope = 'col';
      else if (i === 0) el.scope = 'row';
      const text = cell.textContent.trim();
      if (text === '✓') {
        el.className = 'check';
        const mark = document.createElement('span');
        mark.setAttribute('aria-label', 'included');
        mark.textContent = '✓';
        el.append(mark);
      } else {
        el.append(...cell.childNodes);
      }
      tr.append(el);
    });
    if (!headerDone) {
      thead.append(tr);
      headerDone = true;
    } else {
      tbody.append(tr);
    }
  });

  table.append(thead, tbody);
  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);
  const scroller = document.createElement('div');
  scroller.className = 'table-scroller';
  scroller.setAttribute('tabindex', '0');
  scroller.append(table);
  container.append(scroller);
  block.replaceChildren(container);
}
