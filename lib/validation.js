import defaults from '../data/content.json';

const MAX_DEPTH = 12;
const MAX_STRING = 12000;
const COLOR_KEYS = new Set(['primary', 'dark', 'background']);

function sanitizeExtra(value, path, depth = 0) {
  if (depth > MAX_DEPTH) throw new Error(`${path} is nested too deeply.`);
  if (typeof value === 'string') return cleanString(value, path);
  if (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
  if (Array.isArray(value)) {
    if (value.length > 200) throw new Error(`${path} has too many items.`);
    return value.map((item, index) => sanitizeExtra(item, `${path}[${index}]`, depth + 1));
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key) || key.length > 80) throw new Error(`${path} contains an invalid field.`);
      out[key] = sanitizeExtra(item, `${path}.${key}`, depth + 1);
    }
    return out;
  }
  throw new Error(`${path} has an unsupported value.`);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value, path) {
  if (value.length > MAX_STRING) throw new Error(`${path} is too long.`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) throw new Error(`${path} contains invalid control characters.`);
  return value.trim();
}

function validateNode(value, template, path, depth = 0) {
  if (depth > MAX_DEPTH) throw new Error(`${path} is nested too deeply.`);
  if (typeof template === 'string') {
    if (typeof value !== 'string') throw new Error(`${path} must be text.`);
    const result = cleanString(value, path);
    const key = path.split('.').pop();
    if ((COLOR_KEYS.has(key) || path.endsWith('.theme.text')) && result && !/^#[0-9a-f]{6}$/i.test(result)) throw new Error(`${path} must be a six-digit hex color.`);
    return result;
  }
  if (typeof template === 'boolean') {
    if (typeof value !== 'boolean') throw new Error(`${path} must be true or false.`);
    return value;
  }
  if (typeof template === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${path} must be a valid number.`);
    return value;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 200) throw new Error(`${path} must be a list of up to 200 items.`);
    const sample = template[0] === undefined && path.endsWith('.testimonials.items') ? defaults._templates?.testimonials : template[0];
    if (sample === undefined) {
      if (value.some((item) => typeof item !== 'string' || item.length > 500)) throw new Error(`${path} must contain short text items.`);
      return value.map((item) => cleanString(item, path));
    }
    const legacyTestimonials = path.endsWith('.testimonials.items') && isPlainObject(sample);
    return value.map((item, index) => {
      // Older CMS versions (and manually restored backups) may contain testimonial
      // strings or primitive values. Migrate them to the current object schema
      // instead of rejecting the entire website save.
      let normalizedItem = item;
      if (legacyTestimonials && !isPlainObject(item)) {
        const text = item == null ? '' : String(item);
        normalizedItem = { name: '', role: '', text };
      }
      return validateNode(normalizedItem, sample, `${path}[${index}]`, depth + 1);
    });
  }
  if (isPlainObject(template)) {
    if (!isPlainObject(value)) throw new Error(`${path} must be an object.`);
    const result = {};
    for (const [key, childTemplate] of Object.entries(template)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) result[key] = validateNode(value[key], childTemplate, `${path}.${key}`, depth + 1);
      else result[key] = childTemplate;
    }
    // Preserve additional known CMS fields to avoid destructive updates, but validate their shape and size.
    for (const [key, child] of Object.entries(value)) {
      if (Object.prototype.hasOwnProperty.call(template, key)) continue;
      if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key.length > 80) throw new Error(`${path} contains an invalid field.`);
      result[key] = sanitizeExtra(child, `${path}.${key}`, depth + 1);
    }
    return result;
  }
  throw new Error(`${path} has an unsupported schema type.`);
}

export function validateContent(input) {
  if (!isPlainObject(input)) throw new Error('Content must be a JSON object.');
  // Backstop: never publish a payload that is missing core sections (it would silently be filled with defaults).
  for (const key of ['settings', 'hero', 'nav', 'services', 'contact']) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) throw new Error(`Content is missing the "${key}" section. Reload the admin page and try again.`);
  }
  const json = JSON.stringify(input);
  if (json.length > 900_000) throw new Error('Content is too large.');
  return validateNode(input, defaults, 'content');
}

export function deepMerge(base, incoming) {
  if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : base;
  if (isPlainObject(base)) {
    const out = { ...base };
    if (isPlainObject(incoming)) {
      for (const [key, value] of Object.entries(incoming)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        out[key] = key in base ? deepMerge(base[key], value) : value;
      }
    }
    return out;
  }
  return incoming === undefined ? base : incoming;
}

// Older versions stored testimonials as plain text; convert them to {name, role, text} objects.
export function normalizeLegacy(content) {
  const t = content && content.testimonials;
  if (!t || !Array.isArray(t.items) || !t.items.some((i) => typeof i === 'string')) return content;
  return { ...content, testimonials: { ...t, items: t.items.map((i) => (typeof i === 'string' ? { name: '', role: '', text: i } : i)) } };
}
