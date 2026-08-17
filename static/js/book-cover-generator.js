/**
 * Programmatic book cover generator for BELTEI Library UI.
 * Produces 2:3 SVG covers styled by category (Dribbble-style, UI-ready).
 */

const COVER_THEMES = {
  cybersecurity: {
    stops: ['#050816', '#0f172a', '#0c4a6e'],
    accent: '#22d3ee',
    accent2: '#3b82f6',
    text: '#f8fafc',
    subtext: '#94a3b8',
    shapes: 'tech',
  },
  finance: {
    stops: ['#042f2e', '#0f766e', '#1e3a5f'],
    accent: '#34d399',
    accent2: '#60a5fa',
    text: '#ecfdf5',
    subtext: '#a7f3d0',
    shapes: 'finance',
  },
  education: {
    stops: ['#eef2ff', '#e0e7ff', '#f8fafc'],
    accent: '#4f46e5',
    accent2: '#818cf8',
    text: '#1e1b4b',
    subtext: '#6366f1',
    shapes: 'education',
  },
  philosophy: {
    stops: ['#1c1917', '#292524', '#44403c'],
    accent: '#d4af37',
    accent2: '#f5d0fe',
    text: '#fafaf9',
    subtext: '#d6d3d1',
    shapes: 'philosophy',
  },
  literature: {
    stops: ['#431407', '#7c2d12', '#1e1b4b'],
    accent: '#fb923c',
    accent2: '#f472b6',
    text: '#fff7ed',
    subtext: '#fed7aa',
    shapes: 'philosophy',
  },
  default: {
    stops: ['#1e3a5f', '#312e81', '#1e293b'],
    accent: '#60a5fa',
    accent2: '#a78bfa',
    text: '#f8fafc',
    subtext: '#cbd5e1',
    shapes: 'default',
  },
};

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveCoverTheme(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('cyber') || key.includes('security') || key.includes('tech')) return COVER_THEMES.cybersecurity;
  if (key.includes('finance') || key.includes('business') || key.includes('economic')) return COVER_THEMES.finance;
  if (key.includes('education') || key.includes('academic') || key.includes('textbook')) return COVER_THEMES.education;
  if (key.includes('philosophy') || key.includes('art') || key.includes('humanities')) return COVER_THEMES.philosophy;
  if (key.includes('literature') || key.includes('novel') || key.includes('fiction')) return COVER_THEMES.literature;
  return COVER_THEMES.default;
}

function wrapCoverTitle(title, maxChars = 16, maxLines = 4) {
  const words = String(title || 'Untitled').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  const joined = lines.join(' ');
  const full = words.join(' ');
  if (full.length > joined.length && lines.length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1 ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
  }

  return lines.length ? lines : ['Untitled'];
}

function coverShapeMarkup(theme) {
  const { accent, accent2, shapes } = theme;

  if (shapes === 'tech') {
    return `
      <g opacity="0.35" stroke="${accent}" stroke-width="1">
        <path d="M0 120 H400 M0 240 H400 M0 360 H400 M0 480 H400"/>
        <path d="M80 0 V600 M160 0 V600 M240 0 V600 M320 0 V600"/>
      </g>
      <circle cx="320" cy="110" r="72" fill="${accent2}" opacity="0.18"/>
      <circle cx="70" cy="500" r="90" fill="${accent}" opacity="0.12"/>
      <path d="M280 420 L330 370 L380 420 L330 470 Z" fill="none" stroke="${accent}" stroke-width="3" opacity="0.7"/>
      <rect x="52" y="52" width="88" height="88" rx="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>
    `;
  }

  if (shapes === 'finance') {
    return `
      <rect x="48" y="420" width="36" height="80" rx="8" fill="${accent}" opacity="0.55"/>
      <rect x="108" y="360" width="36" height="140" rx="8" fill="${accent2}" opacity="0.45"/>
      <rect x="168" y="300" width="36" height="200" rx="8" fill="${accent}" opacity="0.65"/>
      <rect x="228" y="340" width="36" height="160" rx="8" fill="${accent2}" opacity="0.5"/>
      <path d="M72 410 L140 350 L210 280 L300 220" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <circle cx="300" cy="220" r="10" fill="${accent}"/>
    `;
  }

  if (shapes === 'education') {
    return `
      <circle cx="320" cy="96" r="64" fill="${accent2}" opacity="0.16"/>
      <circle cx="88" cy="520" r="84" fill="${accent}" opacity="0.12"/>
      <rect x="58" y="78" width="110" height="14" rx="7" fill="${accent}" opacity="0.25"/>
      <rect x="58" y="108" width="86" height="10" rx="5" fill="${accent2}" opacity="0.2"/>
      <path d="M200 430 L200 510 M160 450 L200 430 L240 450" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
    `;
  }

  if (shapes === 'philosophy') {
    return `
      <circle cx="200" cy="250" r="110" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
      <circle cx="200" cy="250" r="70" fill="none" stroke="${accent2}" stroke-width="1.5" opacity="0.25"/>
      <path d="M60 520 Q200 420 340 520" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
      <path d="M120 120 Q200 40 280 120" fill="none" stroke="${accent2}" stroke-width="1.5" opacity="0.35"/>
    `;
  }

  return `
    <circle cx="330" cy="90" r="70" fill="${accent2}" opacity="0.2"/>
    <circle cx="70" cy="510" r="95" fill="${accent}" opacity="0.15"/>
    <rect x="52" y="460" width="120" height="8" rx="4" fill="${accent}" opacity="0.35"/>
  `;
}

function generateBookCoverSvg(book) {
  const title = book.title || 'Untitled';
  const author = book.author || book.author_name || 'Unknown Author';
  const category = book.category || book.category_name || 'General';
  const theme = resolveCoverTheme(category);
  const uid = `cover-${slugify(`${title}-${author}`)}`.replace(/[^a-z0-9-]/g, '') || 'cover-default';
  const lines = wrapCoverTitle(title);
  const lineHeight = lines.length > 3 ? 34 : 38;
  const titleStartY = 300 - ((lines.length - 1) * lineHeight) / 2;
  const titleLines = lines
    .map((line, index) => {
      const y = titleStartY + index * lineHeight;
      return `<tspan x="200" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" role="img" aria-label="${escapeXml(title)} cover">
  <defs>
    <linearGradient id="${uid}-bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="${theme.stops[0]}"/>
      <stop offset="55%" stop-color="${theme.stops[1]}"/>
      <stop offset="100%" stop-color="${theme.stops[2]}"/>
    </linearGradient>
    <linearGradient id="${uid}-panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${theme.accent2}" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="${uid}-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="400" height="600" rx="24" fill="url(#${uid}-bg)"/>
  ${coverShapeMarkup(theme)}
  <rect x="36" y="36" width="328" height="528" rx="20" fill="url(#${uid}-panel)"/>
  <rect x="36" y="36" width="328" height="528" rx="20" fill="none" stroke="${theme.accent}" stroke-opacity="0.18"/>
  <text x="200" y="92" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="${theme.subtext}">${escapeXml(String(category).toUpperCase())}</text>
  <text x="200" y="${titleStartY}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="${lines.length > 3 ? 28 : 32}" font-weight="800" fill="${theme.text}" filter="url(#${uid}-shadow)">${titleLines}</text>
  <line x1="110" y1="430" x2="290" y2="430" stroke="${theme.accent}" stroke-width="2" opacity="0.55"/>
  <text x="200" y="468" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="500" fill="${theme.subtext}">${escapeXml(author)}</text>
</svg>`;
}

function generateBookCoverDataUrl(book) {
  const svg = generateBookCoverSvg(book);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
