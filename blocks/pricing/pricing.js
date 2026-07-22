/**
 * pricing — rate cards + what's-included checklist (canon pricing surfaces).
 * Authoring rows:
 *   rate rows: [tier | amount | note | CTA paragraph] (4 cells);
 *   single-cell row with a heading = "What's Included" subhead;
 *   single-cell text rows = included items (trailing <strong>VIP</strong>
 *     renders as a tier badge);
 *   single-cell row starting "Please Note" = fine print.
 */
export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const rates = document.createElement('div');
  rates.className = 'pricing-rates';
  const included = document.createElement('div');
  included.className = 'pricing-included';
  const tbody = document.createElement('tbody');
  let finePrint = null;

  rows.forEach((cells) => {
    if (cells.length >= 3) {
      const [tierCell, amountCell, noteCell, ctaCell] = cells;
      const card = document.createElement('div');
      card.className = 'ds-card pricing-rate';
      const badge = document.createElement('span');
      badge.className = 'ds-badge';
      badge.textContent = tierCell.textContent.trim();
      const amount = document.createElement('p');
      amount.className = 'rate-amount';
      amount.textContent = amountCell.textContent.trim();
      const note = document.createElement('p');
      note.className = 'fine-print';
      note.textContent = noteCell ? noteCell.textContent.trim() : '';
      card.append(badge, amount, note);
      if (ctaCell && ctaCell.querySelector('a')) {
        const row = document.createElement('div');
        row.className = 'cta-row';
        [...ctaCell.querySelectorAll('p')].forEach((p) => row.append(p));
        if (!row.childNodes.length) row.append(...ctaCell.childNodes);
        card.append(row);
      }
      rates.append(card);
      return;
    }
    const cell = cells[0];
    if (!cell) return;
    const heading = cell.querySelector('h1, h2, h3');
    if (heading) {
      included.append(heading);
      return;
    }
    const text = cell.textContent.trim();
    if (!text) return;
    if (/^please note/i.test(text)) {
      finePrint = document.createElement('p');
      finePrint.className = 'fine-print';
      finePrint.textContent = text;
      return;
    }
    const tr = document.createElement('tr');
    const tdIcon = document.createElement('td');
    const check = document.createElement('img');
    check.src = '/img/check.svg';
    check.alt = '';
    check.className = 'check';
    check.width = 27;
    check.height = 25;
    check.setAttribute('aria-hidden', 'true');
    tdIcon.append(check);
    const tdText = document.createElement('td');
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'P') tdText.append(...n.childNodes);
      else tdText.append(n);
    });
    tdText.querySelectorAll('strong').forEach((s) => {
      if (s.textContent.trim().length <= 12) {
        const b = document.createElement('span');
        b.className = 'ds-badge';
        b.textContent = s.textContent.trim();
        s.replaceWith(b);
      }
    });
    tr.append(tdIcon, tdText);
    tbody.append(tr);
  });

  const table = document.createElement('table');
  table.className = 'timetable';
  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = 'What is included with a Digital Summit pass';
  table.append(caption, tbody);
  included.append(table);
  if (finePrint) included.append(finePrint);

  const container = document.createElement('div');
  container.className = 'container';
  container.append(rates, included);
  block.replaceChildren(container);
}
