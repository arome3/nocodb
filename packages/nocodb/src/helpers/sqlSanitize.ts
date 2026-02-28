import type { XKnex } from '~/db/CustomKnex';

export function sanitize(v) {
  if (typeof v !== 'string') return v;
  return v?.replace(/([^\\]|^)(\?+)/g, (_, m1, m2) => {
    return `${m1}${m2.split('?').join('\\?')}`;
  });
}

export function unsanitize(v) {
  if (typeof v !== 'string') return v;
  return v?.replace(/\\[?]/g, '?');
}

export function sanitizeAndEscapeDots(alias: string, knex: XKnex) {
  const sanitizedAlias = sanitize(alias);
  // if alias does not contain any dot then return as it is
  if (!knex || !sanitizedAlias.includes('.')) return sanitizedAlias;

  // Split on dots and bind each identifier part individually via Knex's
  // ?? placeholder. This keeps parameterization intact without .toQuery()
  // string interpolation followed by regex replacement.
  const parts = sanitizedAlias.split('.');
  const placeholders = parts.map(() => '??').join('.');
  return knex.raw(placeholders, parts);
}
