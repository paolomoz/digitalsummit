/**
 * agenda — day-tabbed session timetable (canon timetable discipline).
 * Authoring rows (single cell unless noted):
 *   leading rows with h2 = section head;
 *   day rows: text starting "Day N" (+ optional <em>date</em>) open a new day;
 *   session rows: [session title link | speaker links (empty = break)].
 */
export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const days = [];

  rows.forEach((cells) => {
    const text = cells[0] ? cells[0].textContent.trim() : '';
    if (cells.length === 1 && /^Day \d/i.test(text)) {
      const em = cells[0].querySelector('em');
      days.push({
        label: em ? text.replace(em.textContent, '').trim() : text,
        meta: em ? em.textContent.trim() : '',
        sessions: [],
      });
      return;
    }
    if (cells.length === 1 && !days.length) {
      head.append(...cells[0].childNodes);
      return;
    }
    if (!days.length) return;
    const titleLink = cells[0] ? cells[0].querySelector('a') : null;
    const speakerLinks = cells[1] ? [...cells[1].querySelectorAll('a')] : [];
    days[days.length - 1].sessions.push({
      title: titleLink || document.createTextNode(text),
      speakers: speakerLinks,
      isBreak: speakerLinks.length === 0,
    });
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);

  const tablist = document.createElement('ul');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Agenda days');
  const panels = [];

  days.forEach((day, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    const btn = document.createElement('button');
    btn.setAttribute('role', 'tab');
    btn.id = `agenda-tab-${i + 1}`;
    btn.setAttribute('aria-controls', `agenda-day-${i + 1}`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.textContent = day.label;
    if (day.meta) {
      const meta = document.createElement('span');
      meta.className = 'day-meta';
      meta.textContent = day.meta;
      btn.append(' ', meta);
    }
    li.append(btn);
    tablist.append(li);

    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.id = `agenda-day-${i + 1}`;
    panel.setAttribute('aria-labelledby', `agenda-tab-${i + 1}`);
    if (i !== 0) panel.hidden = true;

    const table = document.createElement('table');
    table.className = 'timetable';
    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = `${day.label} agenda`;
    table.append(caption);
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Time', 'Session', 'Category'].forEach((label) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headRow.append(th);
    });
    thead.append(headRow);
    table.append(thead);
    const tbody = document.createElement('tbody');
    day.sessions.forEach((s) => {
      const tr = document.createElement('tr');
      tr.dataset.kind = s.isBreak ? 'break' : 'session';
      const tdTime = document.createElement('td');
      tdTime.className = 'session-time';
      const td = document.createElement('td');
      const title = document.createElement('p');
      title.className = 'session-title';
      title.append(s.title);
      td.append(title);
      if (s.speakers.length) {
        const sp = document.createElement('p');
        sp.className = 'session-speaker';
        s.speakers.forEach((a, j) => {
          if (j) sp.append(' · ');
          sp.append(a);
        });
        td.append(sp);
      }
      const tdCat = document.createElement('td');
      tdCat.className = 'session-category';
      tr.append(tdTime, td, tdCat);
      tbody.append(tr);
    });
    table.append(tbody);
    panel.append(table);
    panels.push(panel);
  });

  tablist.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', () => {
      tablist.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    });
  });

  container.append(tablist, ...panels);
  block.replaceChildren(container);
}
