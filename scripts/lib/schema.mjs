// A small JSON Schema validator — the subset learn/manifest.schema.json uses.
//
// Why hand-written rather than ajv: build-site.mjs runs in CI with no install
// step, and adding a root package.json to this repo would flip every static
// tool into the "built" branch of the deploy script (build-site.mjs:186) and
// demand a dist/. So the guard has to have no dependencies. The subset below
// is exactly what the schema needs and nothing more; anything it does not
// understand is reported rather than silently passed.
//
// Supported: $ref (local, #/$defs/... and #/properties/...), type, const, enum,
// required, additionalProperties, properties, items, oneOf, pattern, minItems,
// maxItems, minimum, maximum, and null via type/oneOf.

const KNOWN = new Set([
  '$schema', '$id', 'title', 'description', 'default', 'examples',
  '$ref', 'type', 'const', 'enum', 'required', 'additionalProperties',
  'properties', 'items', 'oneOf', 'pattern', 'minItems', 'maxItems',
  'minimum', 'maximum', 'propertyNames', '$defs', 'format'
]);

export function validate(schema, data, root = schema, path = '$') {
  const errors = [];
  check(schema, data, root, path, errors);
  return errors;
}

function deref(schema, root) {
  let seen = 0;
  while (schema && schema.$ref) {
    if (++seen > 20) throw new Error('$ref loop at ' + schema.$ref);
    const parts = schema.$ref.replace(/^#\//, '').split('/');
    let node = root;
    for (const p of parts) node = node && node[decodeURIComponent(p)];
    if (!node) throw new Error('unresolvable $ref ' + schema.$ref);
    schema = node;
  }
  return schema;
}

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}

function typeMatches(want, v) {
  const t = typeOf(v);
  if (want === 'number') return t === 'number' || t === 'integer';
  if (want === 'integer') return t === 'integer';
  return t === want;
}

function check(schema, data, root, path, errors) {
  schema = deref(schema, root);
  if (!schema || typeof schema !== 'object') return;

  for (const k of Object.keys(schema)) {
    if (!KNOWN.has(k)) errors.push(`${path}: schema uses unsupported keyword "${k}"`);
  }

  if (schema.const !== undefined && data !== schema.const) {
    errors.push(`${path}: must be ${JSON.stringify(schema.const)}, got ${JSON.stringify(data)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path}: must be one of ${schema.enum.join(' | ')}, got ${JSON.stringify(data)}`);
    return;
  }
  if (schema.type) {
    const want = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!want.some((w) => typeMatches(w, data))) {
      errors.push(`${path}: must be ${want.join(' or ')}, got ${typeOf(data)}`);
      return;
    }
  }
  if (schema.oneOf) {
    const tries = schema.oneOf.map((s) => validate(s, data, root, path));
    const ok = tries.filter((t) => t.length === 0).length;
    if (ok !== 1) {
      errors.push(`${path}: matched ${ok} of ${schema.oneOf.length} alternatives` +
        (ok === 0 ? ` — ${tries.map((t) => t[0]).filter(Boolean).join(' | ')}` : ''));
      return;
    }
  }
  if (typeof data === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: ${JSON.stringify(data)} does not match /${schema.pattern}/`);
    }
  }
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && data > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
  }
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${path}: needs at least ${schema.minItems} item(s), has ${data.length}`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push(`${path}: allows at most ${schema.maxItems} item(s), has ${data.length}`);
    }
    if (schema.items) data.forEach((v, i) => check(schema.items, v, root, `${path}[${i}]`, errors));
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of schema.required || []) {
      if (!(key in data)) errors.push(`${path}: missing required property "${key}"`);
    }
    const props = schema.properties || {};
    for (const [key, value] of Object.entries(data)) {
      if (props[key]) check(props[key], value, root, `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) {
        errors.push(`${path}: unknown property "${key}"`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        check(schema.additionalProperties, value, root, `${path}.${key}`, errors);
      }
    }
  }
}
