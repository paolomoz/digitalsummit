/**
 * promo-bar — indigo promotion strip with optional deadline countdown.
 * Authoring: row 1, one cell: message text + CTA link.
 *            row 2 (optional), two cells: "deadline" | YYYY-MM-DD.
 * Lifecycle: past the deadline the whole bar removes itself (the promotion
 * is over); before it, a live countdown is appended.
 */
function renderCountdown(el, deadline, section) {
  const tick = () => {
    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) {
      if (section) section.remove();
      return false;
    }
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    el.textContent = d > 0 ? `${d}d ${h}h ${m}m left` : `${h}h ${m}m left`;
    return true;
  };
  if (tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 30000);
  }
}

export default async function decorate(block) {
  let deadline = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2 && /^deadline$/i.test(cells[0].textContent.trim())) {
      const parsed = new Date(`${cells[1].textContent.trim()}T23:59:59`);
      if (!Number.isNaN(parsed.getTime())) deadline = parsed;
      row.remove();
    }
  });

  const section = block.closest('.section') || block;
  if (deadline && deadline.getTime() <= Date.now()) {
    // promotion over — drop the bar entirely (lifecycle rule)
    section.remove();
    return;
  }

  const cell = block.querySelector(':scope > div > div');
  const bar = document.createElement('p');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Promotion');
  if (cell) {
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'P') bar.append(...n.childNodes, ' ');
      else bar.append(n);
    });
  }
  if (deadline) {
    const count = document.createElement('span');
    count.className = 'countdown';
    bar.append(' ', count);
    renderCountdown(count, deadline, section);
  }
  block.replaceChildren(bar);
}
