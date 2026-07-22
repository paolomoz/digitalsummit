/**
 * tabs — accessible tab set (canon tabs vocabulary; JS-driven).
 * Authoring rows:
 *   leading single-cell rows with headings = section head;
 *   tab rows: [tab label | panel content].
 * Variants: pastel (band ground), carded (panel content wrapped in ds-card),
 *   guide (h4-led groups inside a panel collapse into accordion items —
 *   the before-you-go tabs-of-accordions pattern).
 */
let tabsetCount = 0;

/** groups h4 + following siblings into <details> accordion items */
function foldPanelAccordions(panel) {
  const nodes = [...panel.childNodes];
  if (!nodes.some((n) => n.nodeType === 1 && n.tagName === 'H4')) return;
  panel.textContent = '';
  let details = null;
  let intro = null;
  nodes.forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'H4') {
      details = document.createElement('details');
      details.className = 'accordion-item';
      const summary = document.createElement('summary');
      summary.append(...n.childNodes);
      details.append(summary);
      panel.append(details);
    } else if (details) {
      details.append(n);
    } else {
      if (!intro) {
        intro = document.createElement('div');
        intro.className = 'panel-intro';
        panel.append(intro);
      }
      intro.append(n);
    }
  });
  const first = panel.querySelector('details');
  if (first) first.open = true;
}

export default async function decorate(block) {
  tabsetCount += 1;
  const setId = `tabs-${tabsetCount}`;
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const tablist = document.createElement('ul');
  tablist.setAttribute('role', 'tablist');
  const panels = [];

  let tabIndex = 0;
  rows.forEach((cells) => {
    if (cells.length === 1) {
      head.append(...cells[0].childNodes);
      return;
    }
    tabIndex += 1;
    const i = tabIndex;
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    const btn = document.createElement('button');
    btn.setAttribute('role', 'tab');
    btn.id = `${setId}-tab-${i}`;
    btn.setAttribute('aria-controls', `${setId}-panel-${i}`);
    btn.setAttribute('aria-selected', i === 1 ? 'true' : 'false');
    btn.append(...cells[0].childNodes);
    li.append(btn);
    tablist.append(li);

    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.id = `${setId}-panel-${i}`;
    panel.setAttribute('aria-labelledby', `${setId}-tab-${i}`);
    if (i !== 1) panel.hidden = true;
    if (block.classList.contains('carded')) {
      const card = document.createElement('div');
      card.className = 'ds-card';
      card.append(...cells[1].childNodes);
      panel.append(card);
    } else {
      panel.append(...cells[1].childNodes);
    }
    if (block.classList.contains('guide')) foldPanelAccordions(panel);
    panels.push(panel);
  });

  tablist.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', () => {
      tablist.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    });
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);
  container.append(tablist, ...panels);
  block.replaceChildren(container);
}
