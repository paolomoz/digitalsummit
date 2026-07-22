/**
 * newsletter — in-page email capture band (never an entry modal — audit F-003).
 * Authoring rows (single cell): <h2> headline | fine-print paragraph |
 *   optional config row: "form-id" | HubSpot form GUID.
 * The band embeds the HubSpot form (portal 49747268) lazily: the embed
 * script loads when the band scrolls near the viewport. Until (or if ever)
 * HubSpot renders, a block-owned form shows so the band never looks broken;
 * its submit posts straight to the HubSpot Forms API.
 */
const HS_PORTAL = '49747268';
const HS_NEWSLETTER_FORM = '044a44ed-e002-413f-923a-443b03266e5f';
const HS_EMBED_SRC = `https://js.hsforms.net/forms/embed/developer/${HS_PORTAL}.js`;

let embedLoading = null;
function loadHsEmbed() {
  if (!embedLoading) {
    embedLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = HS_EMBED_SRC;
      s.defer = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.append(s);
    });
  }
  return embedLoading;
}

let fieldCount = 0;

export default async function decorate(block) {
  let formId = HS_NEWSLETTER_FORM;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2 && /^form-id$/i.test(cells[0].textContent.trim())) {
      formId = cells[1].textContent.trim() || formId;
      row.remove();
    }
  });

  const heading = block.querySelector('h1, h2, h3');
  const finePrint = [...block.querySelectorAll('p')].find((p) => p.textContent.trim() && !p.contains(heading));

  const container = document.createElement('div');
  container.className = 'container';
  if (heading) {
    const head = document.createElement('div');
    head.className = 'section-head';
    head.append(heading);
    container.append(head);
  }

  // HubSpot embed target
  const frame = document.createElement('div');
  frame.className = 'hs-form-frame';
  frame.dataset.region = 'na1';
  frame.dataset.formId = formId;
  frame.dataset.portalId = HS_PORTAL;

  // block-owned fallback form (visible until HubSpot renders)
  fieldCount += 1;
  const fieldId = `newsletter-email-${fieldCount}`;
  const form = document.createElement('form');
  form.className = 'newsletter-fallback';
  const label = document.createElement('label');
  label.className = 'field-label';
  label.setAttribute('for', fieldId);
  label.textContent = 'Work email';
  const input = document.createElement('input');
  input.type = 'email';
  input.id = fieldId;
  input.name = 'email';
  input.autocomplete = 'email';
  input.required = true;
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button secondary';
  button.textContent = 'Sign Me Up';
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('aria-live', 'polite');
  form.append(label, input, button);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // direct HubSpot Forms API submission (works even if the embed is blocked)
    try {
      const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HS_PORTAL}/${formId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fields: [{ objectTypeId: '0-1', name: 'email', value: input.value }],
          context: { pageUri: window.location.href, pageName: document.title },
        }),
      });
      status.textContent = res.ok ? 'Thanks — you are on the list.' : 'Something went wrong. Please try again.';
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again.';
    }
  });

  container.append(frame, form, status);

  if (finePrint) {
    finePrint.className = 'fine-print';
    finePrint.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
    container.append(finePrint);
  }
  block.replaceChildren(container);

  // lazy-load the HubSpot embed when the band nears the viewport
  const io = new IntersectionObserver(async (entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    io.disconnect();
    await loadHsEmbed();
    // hide the fallback once HubSpot has rendered its form
    const check = setInterval(() => {
      if (frame.querySelector('iframe, form')) {
        form.remove();
        clearInterval(check);
      }
    }, 500);
    setTimeout(() => clearInterval(check), 15000);
  }, { rootMargin: '400px' });
  io.observe(block);
}
