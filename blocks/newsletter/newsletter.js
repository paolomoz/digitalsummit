/**
 * newsletter — in-page email capture band (never an entry modal — audit F-003).
 * Authoring rows (single cell): <h2> headline | fine-print paragraph.
 * The form markup is block-owned; the HubSpot handler attaches in the
 * dynamic phase (portal 49747268).
 */
export default async function decorate(block) {
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

  const form = document.createElement('form');
  const label = document.createElement('label');
  label.className = 'field-label';
  label.setAttribute('for', 'newsletter-email');
  label.textContent = 'Work email';
  const input = document.createElement('input');
  input.type = 'email';
  input.id = 'newsletter-email';
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Thanks — you are on the list.';
  });
  container.append(form, status);

  if (finePrint) {
    finePrint.className = 'fine-print';
    finePrint.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
    container.append(finePrint);
  }
  block.replaceChildren(container);
}
