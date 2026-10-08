const SHEET_ID = '1FjMe4dHVOQyttLN0ZSTUtaXKXBD03h2Qf6-GyF_7hoE';
const VISION_TAB = 'Vision';
const RING_FIRST_YEAR = 2024;
const RING_MAX = 6050;
const VISION_MAX_EP = 999;

const MODE = document.body.dataset.mode; // 'rings' or 'vision'

// --- Helpers ---
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') inQuotes = false;
            else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            rows.push(row); row = [];
        } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
}

const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));

async function fetchTab(name) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
}

// A context is { members: Map(key -> {name, have:Set, want:Set}), byNumber: Map(n -> {have:[names], want:[names]}) }
function newContext() { return { members: new Map(), byNumber: new Map() }; }

function addEntry(ctx, name, haveNums, wantNums) {
    const key = name.toLowerCase();
    let m = ctx.members.get(key);
    if (!m) { m = { name, have: new Set(), want: new Set() }; ctx.members.set(key, m); }
    haveNums.forEach(n => m.have.add(n));
    wantNums.forEach(n => m.want.add(n));
}

function finishContext(ctx) {
    ctx.members.forEach(m => {
        m.have.forEach(n => slot(ctx, n).have.push(m.name));
        m.want.forEach(n => slot(ctx, n).want.push(m.name));
    });
    return ctx;
}

function slot(ctx, n) {
    let s = ctx.byNumber.get(n);
    if (!s) { s = { have: [], want: [] }; ctx.byNumber.set(n, s); }
    return s;
}

function parseNums(str, max) {
    const out = [];
    (str || '').split(/[,\s]+/).forEach(t => {
        if (/^\d{1,4}$/.test(t)) {
            const n = parseInt(t, 10);
            if (n >= 1 && n <= max) out.push(n);
        }
    });
    return out;
}

// --- Data loading ---
const state = {
    tab: MODE,
    filter: 'all',
    rings: {},        // year -> context
    ringYears: [],
    vision: {},       // season -> context
    visionSeasons: [],
    period: { rings: null, vision: null }
};

async function loadRings() {
    const thisYear = new Date().getFullYear();
    let baseline = null;
    for (let y = RING_FIRST_YEAR; y <= thisYear + 1; y++) {
        let text;
        try { text = await fetchTab(String(y)); } catch (e) { continue; }
        // Google returns the first tab when a tab name doesn't exist; skip those duplicates
        if (baseline === null) baseline = text;
        else if (text === baseline) continue;

        const rows = parseCSV(text);
        rows.shift(); // header
        const ctx = newContext();
        rows.forEach(r => {
            const name = (r[0] || '').trim();
            if (!name) return;
            addEntry(ctx, name, parseNums(r[1], RING_MAX), parseNums(r[2], RING_MAX));
        });
        state.rings[y] = finishContext(ctx);
        state.ringYears.push(y);
    }
    state.period.rings = state.ringYears[state.ringYears.length - 1] || null;
}

async function loadVision() {
    const rows = parseCSV(await fetchTab(VISION_TAB));
    rows.shift();
    const bySeason = new Map();
    rows.forEach(r => {
        const name = (r[0] || '').trim();
        const season = (r[1] || '').trim();
        if (!name || !season) return;
        if (!bySeason.has(season)) bySeason.set(season, newContext());
        addEntry(bySeason.get(season), name, parseNums(r[2], VISION_MAX_EP), parseNums(r[3], VISION_MAX_EP));
    });
    const seasons = [...bySeason.keys()].sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b));
    seasons.forEach(s => { state.vision[s] = finishContext(bySeason.get(s)); });
    state.visionSeasons = seasons;
    state.period.vision = seasons[0] || null;
}

// --- Per-tab config ---
const pad4 = n => String(n).padStart(4, '0');

const TABS = {
    rings: {
        noun: 'ring', plural: 'rings',
        fmt: pad4,
        periods: () => state.ringYears,
        periodLabel: y => String(y),
        ctx: () => state.rings[state.period.rings],
        max: ctx => RING_MAX,
        total: RING_MAX,
        placeholder: 'Who has #1234? Type a ring number or a member name',
        heading: p => `${p} Championship Rings`
    },
    vision: {
        noun: 'episode', plural: 'episodes',
        fmt: n => 'Ep ' + n,
        periods: () => state.visionSeasons,
        periodLabel: s => 'Season ' + s,
        ctx: () => state.vision[state.period.vision],
        max: ctx => Math.max(10, ...ctx.byNumber.keys()),
        total: null,
        placeholder: 'Who has episode 7? Type an episode number or a member name',
        heading: p => `Season ${p} Vision Episodes`
    }
};

const cfg = () => TABS[state.tab];
const stateOf = s => !s ? 's-none' : (s.have.length && s.want.length ? 's-match' : s.have.length ? 's-have' : s.want.length ? 's-want' : 's-none');

// --- Rendering ---
const el = id => document.getElementById(id);

function render() {
    const c = cfg();
    const periods = c.periods();
    const ctx = c.ctx();

    el('lookup-input').placeholder = c.placeholder;

    el('period-pills').innerHTML = periods.map(p =>
        `<button class="pill${String(p) === String(state.period[state.tab]) ? ' active' : ''}" data-period="${esc(p)}">${esc(c.periodLabel(p))}</button>`).join('');

    const filters = [['all', 'All'], ['owned', 'Owned'], ['wanted', 'Wanted'], ['match', 'Trade Matches'], ['unclaimed', 'Unclaimed']];
    el('filter-pills').innerHTML = filters.map(([k, label]) =>
        `<button class="pill${state.filter === k ? ' active' : ''}" data-filter="${k}">${label}</button>`).join('');

    if (!ctx) {
        el('stats').innerHTML = '';
        el('matches').innerHTML = '';
        el('grid-wrap').innerHTML = `<div class="empty-state">No ${c.plural} tracked yet</div>`;
        return;
    }

    const max = c.max(ctx);
    let owned = 0, wanted = 0, matches = [];
    ctx.byNumber.forEach((s, n) => {
        if (s.have.length) owned++;
        if (s.want.length) wanted++;
        if (s.have.length && s.want.length) matches.push(n);
    });
    matches.sort((a, b) => a - b);

    el('stats').innerHTML =
        `<span><b>${ctx.members.size}</b>members</span>` +
        `<span><b>${owned}</b>${c.plural} owned${c.total ? ` of ${c.total}` : ''}</span>` +
        `<span><b>${wanted}</b>${c.plural} wanted</span>` +
        `<span><b>${matches.length}</b>trade matches</span>`;

    el('matches').innerHTML = matches.length
        ? `<details class="matches"><summary>Trades waiting <span>(${matches.length})</span></summary><div class="match-list">` +
          matches.map(n => {
              const s = ctx.byNumber.get(n);
              return `<button type="button" class="match-item" data-num="${n}"><span class="num">${esc(c.fmt(n))}</span>` +
                     `<span class="who">Has: ${esc(s.have.join(', '))}</span><span class="who">Wants: ${esc(s.want.join(', '))}</span></button>`;
          }).join('') + '</div></details>'
        : '';

    const parts = [];
    for (let n = 1; n <= max; n++) {
        const s = ctx.byNumber.get(n);
        const st = stateOf(s);
        const label = c.fmt(n);
        const title = s ? `${label}: ${s.have.length} own, ${s.want.length} want` : `${label}: unclaimed`;
        if (state.tab === 'rings') {
            parts.push(`<button type="button" class="tile ${st}" data-num="${n}" title="${title}">${label}</button>`);
        } else {
            parts.push(`<button type="button" class="tile ${st}" data-num="${n}" title="${title}">${n}<small>${s ? s.have.length : 0} own &middot; ${s ? s.want.length : 0} want</small></button>`);
        }
    }
    el('grid-wrap').innerHTML = `<div class="grid ${state.tab === 'rings' ? 'rings' : 'episodes'}" id="grid" data-filter="${state.filter}">${parts.join('')}</div>`;
}

// --- Detail sheet ---
function openSheet(html) {
    el('sheet-body').innerHTML = html;
    el('sheet').classList.add('open');
}

function closeSheet() { el('sheet').classList.remove('open'); }

const numChip = (n, cls) => `<button type="button" class="chip ${cls}" data-num="${n}">${esc(cfg().fmt(n))}</button>`;
const nameChip = (name, cls) => `<button type="button" class="chip ${cls || ''}" data-member="${esc(name)}">${esc(name)}</button>`;

function showNumber(n) {
    const c = cfg();
    const ctx = c.ctx();
    if (!ctx) return;
    const s = ctx.byNumber.get(n) || { have: [], want: [] };
    const period = state.period[state.tab];
    let body = `<h3 id="sheet-title">${esc(c.fmt(n))}</h3><p class="sub">${esc(c.heading(period))}</p>`;
    body += `<h4>Owned by (${s.have.length})</h4>` + (s.have.length ? `<div class="chips">${s.have.map(x => nameChip(x, 'have')).join('')}</div>` : '<span class="none-text">Nobody has tracked this one yet</span>');
    body += `<h4>Wanted by (${s.want.length})</h4>` + (s.want.length ? `<div class="chips">${s.want.map(x => nameChip(x, 'want')).join('')}</div>` : '<span class="none-text">Nobody is looking for this one</span>');
    if (s.have.length && s.want.length) body += `<h4>Trade match</h4><span class="none-text">Someone has it and someone wants it. Reach out in Discord to trade.</span>`;
    openSheet(body);

    const tile = el('grid') && el('grid').querySelector(`.tile[data-num="${n}"]`);
    if (tile && tile.offsetParent !== null) {
        tile.scrollIntoView({ block: 'center', behavior: 'smooth' });
        tile.classList.remove('flash');
        void tile.offsetWidth;
        tile.classList.add('flash');
    }
}

function showMember(key) {
    const c = cfg();
    const ctx = c.ctx();
    const m = ctx && ctx.members.get(key.toLowerCase());
    if (!m) return;
    const period = state.period[state.tab];
    const sorted = set => [...set].sort((a, b) => a - b);

    const partners = [];
    ctx.members.forEach(o => {
        if (o === m) return;
        const theyHave = sorted([...m.want].filter(n => o.have.has(n)));
        const iHave = sorted([...m.have].filter(n => o.want.has(n)));
        if (theyHave.length || iHave.length) partners.push({ o, theyHave, iHave });
    });
    partners.sort((a, b) => (Math.min(b.theyHave.length, b.iHave.length) - Math.min(a.theyHave.length, a.iHave.length)) ||
                            (b.theyHave.length + b.iHave.length - a.theyHave.length - a.iHave.length));

    let body = `<h3 id="sheet-title">${esc(m.name)}</h3><p class="sub">${esc(c.heading(period))}</p>`;
    body += `<h4>Owns (${m.have.size})</h4>` + (m.have.size ? `<div class="chips">${sorted(m.have).map(n => numChip(n, 'have')).join('')}</div>` : '<span class="none-text">Nothing tracked</span>');
    body += `<h4>Wants (${m.want.size})</h4>` + (m.want.size ? `<div class="chips">${sorted(m.want).map(n => numChip(n, 'want')).join('')}</div>` : '<span class="none-text">Nothing tracked</span>');
    body += `<h4>Possible trades (${partners.length})</h4>`;
    if (partners.length) {
        body += partners.slice(0, 15).map(p =>
            `<div class="partner"><b data-member="${esc(p.o.name)}">${esc(p.o.name)}</b>${p.theyHave.length && p.iHave.length ? '<span class="mutual">Mutual swap</span>' : ''}` +
            (p.theyHave.length ? `<div>Has what ${esc(m.name)} wants: ${esc(p.theyHave.map(c.fmt).join(', '))}</div>` : '') +
            (p.iHave.length ? `<div>Wants what ${esc(m.name)} has: ${esc(p.iHave.map(c.fmt).join(', '))}</div>` : '') + '</div>').join('');
        if (partners.length > 15) body += `<p class="none-text">...and ${partners.length - 15} more</p>`;
    } else {
        body += '<span class="none-text">No overlaps yet</span>';
    }
    openSheet(body);
}

function lookup(query) {
    const c = cfg();
    const ctx = c.ctx();
    const q = query.trim();
    if (!q || !ctx) return;

    if (/^#?\d+$/.test(q)) {
        const n = parseInt(q.replace('#', ''), 10);
        const limit = state.tab === 'rings' ? RING_MAX : VISION_MAX_EP;
        if (n < 1 || n > limit) {
            openSheet(`<h3 id="sheet-title">Not found</h3><p class="sub">${esc(c.noun)} numbers run from 1 to ${limit}.</p>`);
            return;
        }
        showNumber(n);
        return;
    }

    const needle = q.toLowerCase();
    const found = [...ctx.members.values()].filter(m => m.name.toLowerCase().includes(needle));
    const exact = found.find(m => m.name.toLowerCase() === needle);
    if (exact || found.length === 1) { showMember((exact || found[0]).name); return; }
    if (!found.length) {
        openSheet(`<h3 id="sheet-title">No member found</h3><p class="sub">Nobody matching "${esc(q)}" in ${esc(c.heading(state.period[state.tab]))}.</p>`);
        return;
    }
    openSheet(`<h3 id="sheet-title">${found.length} members match</h3><p class="sub">Pick one</p><div class="chips">${found.slice(0, 30).map(m => nameChip(m.name)).join('')}</div>`);
}

// --- Events ---
el('period-pills').addEventListener('click', e => {
    const b = e.target.closest('[data-period]');
    if (!b) return;
    state.period[state.tab] = b.dataset.period;
    closeSheet();
    render();
});

el('filter-pills').addEventListener('click', e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    state.filter = b.dataset.filter;
    const grid = el('grid');
    if (grid) grid.dataset.filter = state.filter;
    el('filter-pills').querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p === b));
});

el('lookup-form').addEventListener('submit', e => { e.preventDefault(); lookup(el('lookup-input').value); });

document.addEventListener('click', e => {
    const num = e.target.closest('[data-num]');
    if (num) { showNumber(parseInt(num.dataset.num, 10)); return; }
    const mem = e.target.closest('[data-member]');
    if (mem) showMember(mem.dataset.member);
});

el('sheet-close').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

// --- Init ---
async function init() {
    const loading = el('loading');
    const results = await Promise.allSettled([MODE === 'rings' ? loadRings() : loadVision()]);
    if (results[0].status === 'rejected' || (!state.ringYears.length && !state.visionSeasons.length)) {
        console.error(results);
        loading.innerText = 'ERROR LOADING MATCHMAKING';
        return;
    }
    loading.style.display = 'none';
    el('app').hidden = false;
    el('app').classList.remove('hidden');
    render();
}

init();
