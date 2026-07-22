/**
 * agenda — day-tabbed session timetable (canon timetable discipline).
 * Authoring rows (single cell unless noted):
 *   leading rows with h2 = section head;
 *   day rows: text starting "Day N" (+ optional <em>date</em>) open a new day;
 *   session rows: [session title link | speaker links (empty = break)
 *     | optional time | optional category];
 *   OR sheet mode: a row with a single link to agenda.json (+ optional city
 *   cell) pulls the full timetable — day, time, category — from the sheet.
 */
import { fetchSheet, readSheetConfig } from '../../scripts/sheet.js';

function daysFromSheet(rows) {
  const days = [];
  rows.forEach((r) => {
    let day = days.find((d) => d.meta === (r.day || ''));
    if (!day) {
      day = { label: `Day ${days.length + 1}`, meta: r.day || '', sessions: [] };
      days.push(day);
    }
    let title;
    if (r.href) {
      title = document.createElement('a');
      title.href = r.href;
      title.textContent = r.title;
    } else {
      title = document.createTextNode(r.title || '');
    }
    const speakers = (r.speakers || '').split(';').map((s) => s.trim()).filter(Boolean)
      .map((entry) => {
        const [name, href] = entry.split('|').map((x) => x.trim());
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = name;
          return a;
        }
        return document.createTextNode(name);
      });
    day.sessions.push({
      title,
      speakers,
      time: r.time || '',
      category: r.category || '',
      isBreak: speakers.length === 0,
    });
  });
  return days;
}

export default async function decorate(block) {
  const sheet = readSheetConfig(block);
  let sheetDays = null;
  if (sheet) {
    const data = await fetchSheet(sheet.url);
    const rows = sheet.scope ? data.filter((r) => (r.city || '').toLowerCase() === sheet.scope) : data;
    sheetDays = daysFromSheet(rows);
  }
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
      time: cells[2] ? cells[2].textContent.trim() : '',
      category: cells[3] ? cells[3].textContent.trim() : '',
      isBreak: speakerLinks.length === 0,
    });
  });
  if (sheetDays && sheetDays.length) days.push(...sheetDays);

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
      if (s.time) tdTime.textContent = s.time;
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
      if (s.category) tdCat.textContent = s.category;
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
