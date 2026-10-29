// Builds every SVG in assets/ (light + dark) and README.md.
// Run from the repo root: node scripts/build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const SITE = 'https://hafisfox.io';
const themes = {
  dark:  { bg:'#0a0a0a', card:'#141414', fg:'#f6f6f6', muted:'#8a8a8a', line:'#ffffff1f', line2:'#ffffff38', accent:'#b7f4db', ink:'#0b120e' },
  light: { bg:'#f3f2ee', card:'#ffffff', fg:'#0d0d0d', muted:'#6f6f6f', line:'#0000001a', line2:'#00000033', accent:'#1f8f63', ink:'#ffffff' },
};
const sans = "'Inter Tight','Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
const serif = "'Instrument Serif','Iowan Old Style',Georgia,'Times New Roman',serif";
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// rough advance width for Helvetica-ish text, used to size pills and chips
const textW = (s, size) => [...s].reduce((w, c) => w + (/[A-Z]/.test(c) ? .66 : /[il.,'|·]/.test(c) ? .26 : c === ' ' ? .28 : .53), 0) * size;

const EASE = 'cubic-bezier(.16,1,.3,1)';
const baseStyle = `
    .fade{opacity:0;animation:fade .9s ease forwards}
    .rise{opacity:0;transform:translateY(18px);animation:rise 1s ${EASE} forwards}
    @keyframes fade{to{opacity:1}}
    @keyframes rise{to{opacity:1;transform:none}}`;
const reduced = (extra = '') => `@media (prefers-reduced-motion:reduce){*{animation:none!important}.fade{opacity:1}.rise{opacity:1;transform:none}${extra}}`;
const frame = (w, h, t, body, { title, style = '', fill = t.bg, stroke = t.line } = {}) =>
`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${esc(title)}</title>
  <style>${baseStyle}${style}
    ${reduced()}
  </style>
  <rect width="${w}" height="${h}" rx="20" fill="${fill}"/>
  <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="19.5" fill="none" stroke="${stroke}"/>
${body}
</svg>
`;

// ---------- hero ----------
function hero(t) {
  const lines = [
    ['From Workflows', 'sans', 190, 185],
    ['to Systems', 'serif', 520, 282],
    ['operations that run', 'sans', 220, 379],
    ['themselves', 'serif', 540, 476],
  ];
  const text = lines.map(([s, f, x, y], i) => {
    const sf = f === 'serif';
    return `  <text x="${x}" y="${y}" class="rise" style="animation-delay:${i * .12}s" font-family="${sf ? serif : sans}" font-style="${sf ? 'italic' : 'normal'}" font-weight="${sf ? 400 : 300}" font-size="${sf ? 104 : 96}" letter-spacing="${sf ? -1 : -4.5}" fill="${i === 3 ? t.accent : t.fg}">${s}</text>`;
  }).join('\n');
  const nodes = ['inbox', 'sheets', 'calls', 'DMs', 'system'].map((n, i, a) => {
    const last = i === a.length - 1, x = 80 + i * 260;
    return `  <g class="fade" style="animation-delay:${1.2 + i * .12}s">
    <circle cx="${x}" cy="552" r="${last ? 7 : 4}" fill="${last ? t.accent : t.bg}" stroke="${last ? t.accent : t.muted}" stroke-width="1.5"/>
    <text x="${x}" y="582" text-anchor="middle" font-family="${last ? serif : sans}" font-style="${last ? 'italic' : 'normal'}" font-size="${last ? 20 : 15}" fill="${last ? t.accent : t.muted}">${n}</text>
  </g>`;
  }).join('\n');
  return frame(1200, 620, t, `  <g class="fade" style="animation-delay:.9s" font-family="${sans}" font-size="15" letter-spacing=".4" fill="${t.muted}">
    <text x="48" y="58">HAFIS JAVAD</text>
    <text x="600" y="58" text-anchor="middle">APPLIED AI &amp; AUTOMATION</text>
    <text x="1152" y="58" text-anchor="end">BANGKOK · HAFISFOX.IO</text>
  </g>
  <line x1="48" y1="80" x2="1152" y2="80" stroke="${t.line}"/>
${text}
  <line x1="80" y1="552" x2="1120" y2="552" stroke="${t.line}" stroke-width="1.5"/>
  <line class="track" x1="80" y1="552" x2="1120" y2="552" stroke="${t.accent}" stroke-width="1.5" stroke-opacity=".55"/>
  <circle class="pulse" r="4" fill="${t.accent}"/>
${nodes}`, {
    title: 'Hafis Javad. From workflows to systems: operations that run themselves.',
    style: `
    .track{stroke-dasharray:1040;stroke-dashoffset:1040;animation:draw 1.6s cubic-bezier(.76,0,.24,1) 1.1s forwards}
    .pulse{offset-path:path('M80 552 H1120');opacity:0;animation:move 3.2s cubic-bezier(.76,0,.24,1) 2.6s infinite}
    @keyframes draw{to{stroke-dashoffset:0}}
    @keyframes move{0%{offset-distance:0%;opacity:0}10%,85%{opacity:1}100%{offset-distance:100%;opacity:0}}
    @media (prefers-reduced-motion:reduce){.track{stroke-dashoffset:0}.pulse{display:none}}`,
  });
}

// ---------- nav pills ----------
const pills = [
  ['site', 'hafisfox.io', SITE, true],
  ['services', 'Services', `${SITE}/services`],
  ['work', 'Work', `${SITE}/work`],
  ['pricing', 'Pricing', `${SITE}/pricing`],
  ['about', 'About', `${SITE}/about`],
  ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/hafisjavad'],
  ['email', 'Email', 'mailto:hafisjavad@gmail.com'],
];
function pill(t, label, filled) {
  const size = 17, h = 46, w = Math.round(textW(label, size) + (filled ? 72 : 52));
  const fg = filled ? t.ink : t.fg;
  const arrow = filled ? `<path d="M${w - 34} ${h / 2 + 4} l8 -8 m-6 0 h6 v6" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${esc(label)}</title>
  <rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="${h / 2}" fill="${filled ? t.accent : 'none'}" stroke="${filled ? t.accent : t.line2}" stroke-width="1.5"/>
  <text x="${filled ? 26 : w / 2}" y="${h / 2 + 6}" ${filled ? '' : 'text-anchor="middle"'} font-family="${sans}" font-size="${size}" font-weight="${filled ? 500 : 400}" fill="${fg}">${esc(label)}</text>
  ${arrow}
</svg>
`;
}

// ---------- intro ----------
function intro(t) {
  const facts = [['Role', 'Co-Founder & CTO, LokaX AI'], ['Base', 'Bangkok, working worldwide'], ['Model', 'One builder, start to finish']];
  return frame(1200, 400, t, `  <text x="56" y="76" class="fade" font-family="${sans}" font-size="15" letter-spacing=".5" fill="${t.muted}">HI, I'M HAFIS</text>
  <circle cx="1136" cy="70" r="6" fill="${t.accent}" class="blink"/>
  <g font-weight="300" letter-spacing="-1.6" font-family="${sans}" font-size="52" fill="${t.fg}">
    <text x="56" y="156" class="rise">I turn inboxes, spreadsheets and handoffs</text>
    <text x="56" y="220" class="rise" style="animation-delay:.12s">into <tspan font-family="${serif}" font-style="italic" font-weight="400" letter-spacing="-.5" font-size="58" fill="${t.accent}">systems that run themselves.</tspan></text>
  </g>
  <line x1="56" y1="282" x2="1144" y2="282" stroke="${t.line}"/>
${facts.map(([k, v], i) => `  <g class="fade" style="animation-delay:${.5 + i * .12}s">
    <text x="${56 + i * 370}" y="322" font-family="${sans}" font-size="14" letter-spacing=".5" fill="${t.muted}">${k.toUpperCase()}</text>
    <text x="${56 + i * 370}" y="356" font-family="${sans}" font-size="21" fill="${t.fg}">${esc(v)}</text>
  </g>`).join('\n')}`, {
    title: "Hi, I'm Hafis. I turn inboxes, spreadsheets and handoffs into systems that run themselves. Co-Founder & CTO at LokaX AI, based in Bangkok.",
    style: `
    .blink{animation:blink 2.4s ease-in-out infinite}
    @keyframes blink{50%{opacity:.25}}`,
  });
}

// ---------- capability cards ----------
const icons = {
  // 64x64 line icons, drawn at the card's top-left
  agents: `<circle cx="32" cy="32" r="9"/><circle cx="10" cy="12" r="5"/><circle cx="54" cy="12" r="5"/><circle cx="32" cy="58" r="5"/><path d="M14 16l11 10M50 16L39 26M32 41v12"/>`,
  automation: `<path d="M52 26a21 21 0 0 0-38-6M12 38a21 21 0 0 0 38 6"/><path d="M14 8v12h12M50 56V44H38"/>`,
  operations: `<path d="M32 6l26 13-26 13L6 19z"/><path d="M6 32l26 13 26-13M6 45l26 13 26-13"/>`,
  product: `<rect x="5" y="9" width="54" height="46" rx="6"/><path d="M5 21h54M13 15h.01M19 15h.01M25 15h.01M15 31h18M15 39h30M15 47h22"/>`,
  integrations: `<path d="M26 38l12-12"/><path d="M29 17l6-6a11 11 0 0 1 16 16l-6 6M35 47l-6 6a11 11 0 0 1-16-16l6-6"/>`,
  dashboards: `<path d="M6 58h52"/><rect x="10" y="34" width="9" height="18" rx="2"/><rect x="27" y="22" width="9" height="30" rx="2"/><rect x="44" y="8" width="9" height="44" rx="2"/>`,
};
const capabilities = [
  ['agents', 'ai-agents', 'AI Agents', ['Agents that gather the context, draft', 'the work and hand it to the right person.']],
  ['automation', 'automation', 'Automation', ['Intake, messages, documents and reports', 'that move on their own, with alerts.']],
  ['operations', 'operations', 'Operations Systems', ['One place for what comes in,', 'who decides and what happens next.']],
  ['product', 'product', 'Product & SaaS', ['Portals, CRMs and SaaS products,', 'from first version to production.']],
  ['integrations', 'integrations', 'Integrations & APIs', ['Webhooks, APIs and data pipelines', 'with retries and an audit trail.']],
  ['dashboards', 'dashboards', 'Dashboards', ['Live views built around the decisions', 'you make every week.']],
];
function capCard(t, [icon, , title, desc], i) {
  return frame(600, 300, t, `  <text x="40" y="58" font-family="${sans}" font-size="15" letter-spacing=".5" fill="${t.muted}">0${i + 1}</text>
  <g transform="translate(496 34)" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">${icons[icon]}</g>
  <text x="40" y="186" class="rise" font-family="${sans}" font-size="38" font-weight="400" letter-spacing="-1.2" fill="${t.fg}">${esc(title)}</text>
  <g font-family="${sans}" font-size="19" fill="${t.muted}" class="fade" style="animation-delay:.25s">
    <text x="40" y="226">${esc(desc[0])}</text>
    <text x="40" y="252">${esc(desc[1])}</text>
  </g>
  <path d="M543 255l14-14m-10 0h10v10" fill="none" stroke="${t.fg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`, {
    title: `${title}: ${desc.join(' ')}`,
    fill: t.card,
    style: `
    .icon{transform-box:fill-box;transform-origin:center;animation:breathe 4s ease-in-out ${i * .4}s infinite}
    @keyframes breathe{50%{opacity:.55}}`,
  });
}

// ---------- process ----------
function processStrip(t) {
  const steps = [
    ['Map', ['the real handoffs', 'before any code']],
    ['Build', ['on the tools', 'you already use']],
    ['Ship', ['in weeks,', 'at a fixed price']],
    ['Run', ['monitoring, fixes', 'and a monthly report']],
  ];
  const col = (i) => 56 + i * 280;
  return frame(1200, 330, t, `  <text x="56" y="76" font-family="${sans}" font-size="15" letter-spacing=".5" fill="${t.muted}">HOW I WORK</text>
  <line x1="${col(0) + 8}" y1="132" x2="${col(3) + 8}" y2="132" stroke="${t.line2}" stroke-width="1.5"/>
  <line class="flow" x1="${col(0) + 8}" y1="132" x2="${col(3) + 8}" y2="132" stroke="${t.accent}" stroke-width="1.5"/>
${steps.map(([verb, sub], i) => `  <g class="rise" style="animation-delay:${i * .14}s">
    <circle cx="${col(i) + 8}" cy="132" r="8" fill="${i === 3 ? t.accent : t.bg}" stroke="${t.accent}" stroke-width="1.5"/>
    <text x="${col(i)}" y="204" font-family="${serif}" font-style="italic" font-size="60" fill="${t.fg}">${verb}</text>
    <text x="${col(i)}" y="250" font-family="${sans}" font-size="19" fill="${t.muted}">${esc(sub[0])}</text>
    <text x="${col(i)}" y="276" font-family="${sans}" font-size="19" fill="${t.muted}">${esc(sub[1])}</text>
  </g>`).join('\n')}`, {
    title: 'How I work: Map the real handoffs. Build on the tools you already use. Ship in weeks at a fixed price. Run it with monitoring, fixes and a monthly report.',
    style: `
    .flow{stroke-dasharray:60 900;animation:flow 3.6s cubic-bezier(.76,0,.24,1) infinite}
    @keyframes flow{from{stroke-dashoffset:60}to{stroke-dashoffset:-900}}`,
  });
}

// ---------- toolbox marquee ----------
function toolbox(t) {
  const rows = [
    ['TypeScript', 'Next.js', 'React', 'Node.js', 'Supabase', 'Postgres', 'Neon', 'Vercel', 'Google Cloud'],
    ['n8n', 'OpenAI', 'Claude', 'WhatsApp API', 'Webhooks', 'REST APIs', 'Twilio', 'Google Workspace', 'PayPal'],
  ];
  const size = 18, gap = 14;
  const rowSvg = (items, y, dir) => {
    let x = 0;
    const chips = [];
    for (const label of items) {
      const w = Math.round(textW(label, size) + 44);
      chips.push(`<g transform="translate(${x} 0)"><rect x=".75" y=".75" width="${w - 1.5}" height="46.5" rx="23.25" fill="none" stroke="${t.line2}" stroke-width="1.5"/><circle cx="20" cy="24" r="3.5" fill="${t.accent}"/><text x="32" y="30" font-family="${sans}" font-size="${size}" fill="${t.fg}">${esc(label)}</text></g>`);
      x += w + gap;
    }
    const span = x; // one full set; draw it twice for a seamless loop
    return `  <g transform="translate(0 ${y})"><g class="m${dir}" style="--d:-${span}px">${chips.join('')}<g transform="translate(${span} 0)">${chips.join('')}</g></g></g>`;
  };
  return frame(1200, 250, t, `  <text x="56" y="62" font-family="${sans}" font-size="15" letter-spacing=".5" fill="${t.muted}">TOOLBOX</text>
  <defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="m"><rect width="1200" height="250" fill="url(#f)"/></mask></defs>
  <g mask="url(#m)">
${rowSvg(rows[0], 92, 'l')}
${rowSvg(rows[1], 160, 'r')}
  </g>`, {
    title: `Toolbox: ${rows.flat().join(', ')}`,
    style: `
    .ml{animation:ml 38s linear infinite}
    .mr{animation:mr 42s linear infinite}
    @keyframes ml{from{transform:translateX(0)}to{transform:translateX(var(--d))}}
    @keyframes mr{from{transform:translateX(var(--d))}to{transform:translateX(0)}}`,
  });
}

// ---------- call to action ----------
function cta(t) {
  const ink = t.ink;
  const label = 'See fixed prices', size = 20, pw = Math.round(textW(label, size) + 84);
  return frame(1200, 360, t, `  <text x="64" y="84" font-family="${sans}" font-size="15" letter-spacing=".5" fill="${ink}" opacity=".7">WORK WITH ME</text>
  <text x="64" y="172" class="rise" font-family="${sans}" font-weight="300" font-size="60" letter-spacing="-2.4" fill="${ink}">Got a workflow eating your week?</text>
  <text x="64" y="244" class="rise" style="animation-delay:.12s" font-family="${serif}" font-style="italic" font-size="66" fill="${ink}">Let's make it run itself.</text>
  <g transform="translate(${1136 - pw} 266)" class="fade" style="animation-delay:.4s">
    <rect width="${pw}" height="56" rx="28" fill="${ink}"/>
    <text x="30" y="35" font-family="${sans}" font-size="${size}" font-weight="500" fill="${t.accent}">${label}</text>
    <path d="M${pw - 44} 36l10-10m-8 0h8v8" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nudge"/>
  </g>`, {
    title: "Got a workflow eating your week? Let's make it run itself. See fixed prices at hafisfox.io/pricing.",
    fill: t.accent, stroke: t.accent,
    style: `
    .nudge{animation:nudge 2.2s ${EASE} infinite}
    @keyframes nudge{50%{transform:translate(3px,-3px)}}`,
  });
}

// ---------- write ----------
mkdirSync('assets', { recursive: true });
const out = (name, fn) => { for (const [k, t] of Object.entries(themes)) writeFileSync(`assets/${name}-${k}.svg`, fn(t)); };
out('hero', hero);
out('intro', intro);
out('process', processStrip);
out('toolbox', toolbox);
out('cta', cta);
pills.forEach(([id, label, , filled]) => out(`pill-${id}`, (t) => pill(t, label, filled)));
capabilities.forEach((c, i) => out(`cap-${c[0]}`, (t) => capCard(t, c, i)));

// README: every image swaps with the viewer's GitHub theme
const pic = (name, alt, attrs = 'width="100%"') =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg" /><source media="(prefers-color-scheme: light)" srcset="assets/${name}-light.svg" /><img src="assets/${name}-dark.svg" alt="${alt}" ${attrs} /></picture>`;
const link = (href, inner) => `<a href="${href}">${inner}</a>`;

const capRows = [];
for (let i = 0; i < capabilities.length; i += 2) {
  capRows.push(`<p>\n${capabilities.slice(i, i + 2).map(([icon, slug, title, desc]) =>
    `  ${link(`${SITE}/services#${slug}`, pic(`cap-${icon}`, `${title}: ${desc.join(' ')}`, 'width="49%"'))}`).join('\n')}\n</p>`);
}

const readme = `<!--
Profile README for github.com/hafisfox, styled after hafisfox.io.
Generated by scripts/build.mjs, which also draws every SVG in assets/. Edit the script, not this file.
-->

${link(SITE, pic('hero', 'Hafis Javad. From workflows to systems: operations that run themselves.'))}

<p align="center">
${pills.map(([id, label, href]) => `  ${link(href, pic(`pill-${id}`, label, 'height="40"'))}`).join('\n')}
</p>

${link(`${SITE}/about`, pic('intro', "Hi, I'm Hafis. I turn inboxes, spreadsheets and handoffs into systems that run themselves. Co-Founder & CTO at LokaX AI, based in Bangkok."))}

<br />

${capRows.join('\n\n')}

${pic('process', 'How I work: Map the real handoffs. Build on the tools you already use. Ship in weeks at a fixed price. Run it with monitoring, fixes and a monthly report.')}

${pic('toolbox', 'Toolbox: TypeScript, Next.js, React, Node.js, Supabase, Postgres, Neon, Vercel, Google Cloud, n8n, OpenAI, Claude, WhatsApp API, Webhooks, REST APIs, Twilio, Google Workspace, PayPal')}

${link(`${SITE}/pricing`, pic('cta', "Got a workflow eating your week? Let's make it run itself. See fixed prices."))}

<p align="center"><sub>Applied AI and automation, built by the person you actually talk to · <a href="${SITE}">hafisfox.io</a></sub></p>
`;
writeFileSync('README.md', readme);
console.log('built', readme.length, 'bytes of README');
