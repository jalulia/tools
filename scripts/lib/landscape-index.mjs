/** The landscape experiment's editorial index. It never changes tool metadata. */
const ART = Object.freeze({
  'desktop-bo': 'bo.svg',
  'ki-tokyo-lounge': 'ki.svg',
  'ki-landscapes': 'ki-atelier.svg',
  'yoshi-dossier': 'yoshi.svg',
  'yoshi-hill-run': 'yoshi-hill-run.svg',
  yoshios: 'yoshios-crt.svg',
  library: 'library.svg',
  meshviz: 'meshviz.svg',
  gallery: 'gallery.svg',
});

const GROUPS = Object.freeze({
  'ki-tokyo-lounge': {
    title: 'Ki',
    children: [{ name: 'ki-landscapes', title: 'Landscape Atelier' }],
  },
  'yoshi-dossier': {
    title: 'Yoshi',
    children: [
      { name: 'yoshi-hill-run', title: 'Hill Run' },
      { name: 'yoshios', title: 'YoshiOS' },
    ],
  },
});

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const segment = value => encodeURIComponent(String(value)).replace(/[!'()*]/g,
  character => '%' + character.charCodeAt(0).toString(16).toUpperCase());

function dateMarkup(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return '';
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase();
  const year = date.getUTCFullYear();
  const label = `${month} ${date.getUTCDate()}${year === new Date().getUTCFullYear() ? '' : ' ' + year}`;
  return `<time class="date" datetime="${escape(value)}">${escape(label)}</time>`;
}

function artMarkup(tool, small = false) {
  const asset = ART[tool.name];
  const className = `project-art${small ? ' project-art--small' : ''}`;
  if (asset) return `<span class="${className}" aria-hidden="true"><img src="icons/${asset}" width="80" height="80" alt="" decoding="async"></span>`;
  const words = String(tool.meta.title || tool.name).trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map(word => Array.from(word)[0] || '').join('').toUpperCase();
  return `<span class="${className} project-monogram" aria-hidden="true">${escape(initials)}</span>`;
}

function childMarkup(tool, title) {
  return `          <li class="project-child" data-tool="${escape(tool.name)}"><a class="project-child-link" href="../${segment(tool.name)}/">${artMarkup(tool, true)}<span class="child-name">${escape(title || tool.meta.title || tool.name)}</span>${dateMarkup(tool.lastTouched)}</a></li>`;
}

function projectMarkup(tool, children = []) {
  const group = GROUPS[tool.name];
  const title = group?.title || tool.meta.title || tool.name;
  const description = tool.meta.description ? `<span class="desc">${escape(tool.meta.description)}</span>` : '';
  const descendants = children.length ? `\n        <ul class="project-children" aria-label="${escape(title)} tools">\n${children.map(child => childMarkup(child.tool, child.title)).join('\n')}\n        </ul>` : '';
  // Download actions remain separate anchors, never nested inside the project link.
  const download = tool.meta.skill ? `\n        <a class="project-download" href="../${segment(tool.name)}/${segment(tool.meta.skill)}" download>Download ${escape(tool.meta.skillLabel || 'skill')}<span class="sr-only"> for ${escape(title)}</span></a>` : '';
  return `      <li class="project-row${children.length ? ' project-row--group' : ''}" data-tool="${escape(tool.name)}" data-status="${escape(tool.meta.status || 'active')}">\n        <a class="tool-link project-link" href="../${segment(tool.name)}/">${artMarkup(tool)}<span class="tool-body"><span class="name">${escape(title)}</span>${description}${dateMarkup(tool.lastTouched)}</span></a>${descendants}${download}\n      </li>`;
}

/**
 * Returns <li> elements for the separate test index.
 * Input records: { name, meta: { title, description, hidden, ... }, lastTouched }.
 * A child is nested only when its visible parent is present. Every other visible
 * tool survives, including future tools; Paper receipt is intentionally omitted
 * from this experiment's navigation because it belongs within the Library.
 */
export function renderLandscapeRows(tools) {
  const visible = tools.filter(tool => tool && typeof tool.name === 'string' &&
    tool.name && !tool.meta?.hidden && tool.name !== 'paper-receipt')
    .map(tool => ({ ...tool, meta: tool.meta || {} }));
  const byName = new Map(visible.map(tool => [tool.name, tool]));
  const nested = new Set();
  for (const [parent, group] of Object.entries(GROUPS)) {
    if (byName.has(parent)) for (const child of group.children) {
      if (byName.has(child.name)) nested.add(child.name);
    }
  }
  const topLevel = visible.filter(tool => !nested.has(tool.name));
  const first = ['desktop-bo', 'ki-tokyo-lounge', 'yoshi-dossier', 'library', 'meshviz'];
  const order = new Map(first.map((name, index) => [name, index]));
  // Future projects retain their incoming order, before the standing Gallery.
  topLevel.sort((a, b) => (order.get(a.name) ?? (a.name === 'gallery' ? 100 : 50)) -
    (order.get(b.name) ?? (b.name === 'gallery' ? 100 : 50)));
  return topLevel.map(tool => {
    const children = (GROUPS[tool.name]?.children || []).filter(child => byName.has(child.name))
      .map(child => ({ ...child, tool: byName.get(child.name) }));
    return projectMarkup(tool, children);
  }).join('\n');
}
