# NocoDB Review Rules

## Scan Configuration
**Scan_include:** packages/nocodb/src/**/*.ts
**Scan_exclude:** packages/nocodb/src/**/*.spec.ts, packages/nocodb/src/**/*.test.ts

## No raw SQL interpolation
**Severity:** CRITICAL
**Scope:** packages/nocodb/src/db/**/*.ts
**Description:** Never interpolate variables into SQL strings using template literals or string concatenation. Always use Knex parameterized queries (knex.raw('?', [value]) for values, knex.raw('??', [identifier]) for column/table names). The sanitize() helper only escapes Knex placeholder characters — it does NOT prevent SQL injection.

## Validate filter operator inputs
**Severity:** HIGH
**Scope:** packages/nocodb/src/db/conditionV2.ts, packages/nocodb/src/db/field-handler/**/*.ts
**Description:** All filter values from user input must be parameterized. Regex patterns, LIKE wildcards, and JSON paths must never be interpolated directly into SQL. Use Knex's built-in parameterization for all user-supplied values.

## Sort direction allowlist
**Severity:** MEDIUM
**Scope:** packages/nocodb/src/db/sortV2.ts
**Description:** Sort directions must be validated against an allowlist ('asc', 'desc') before passing to query builders. Sort field names must come from verified column metadata, never from raw user input.

## No .toQuery() in string interpolation
**Severity:** HIGH
**Scope:** packages/nocodb/src/db/**/*.ts
**Description:** Never use knex.raw().toQuery() results inside template literal interpolation (e.g. knex.raw(`FUNC(${qb.toQuery()})`)). This breaks parameterization. Instead, use Knex's nested builder pattern: knex.raw('FUNC(?)', [subQueryBuilder]).
