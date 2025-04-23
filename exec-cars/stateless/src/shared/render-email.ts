import Handlebars from 'handlebars';
import mjml2html from 'mjml';

export function renderEmail(
  mjmlTemplate: string,
  placeholderValues: Record<string, any>,
): string {
  const compiled = Handlebars.compile(mjmlTemplate);
  const mjmlWithData = compiled(placeholderValues);

  const { html, errors } = mjml2html(mjmlWithData);

  if (errors.length > 0) {
    console.error('mjml compile errors:', errors);
    throw new Error('failed to render email from mjml');
  }

  return html;
}
