/* =========================================================
   BeautyOfBeaches — behaviour shared by every page.
   Each page has <body data-page="..."> and only the blocks
   whose elements exist on that page do anything.
   ========================================================= */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const PAGE = document.body.dataset.page || '';

/* ---------- small helpers ---------- */
const ss = {  
get: k => {try {return sessionStorage.getItem(k)} catch (e) {return null} },
  set: (k,
    v) => {      
try {        
sessionStorage.setItem(k,
          v)      
} catch (e) {}  
}
};
function escapeHTML(v) {  
return String(v ?? '').replace(/[&<>"']/g,
    c => ({      
'&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'    
}[c]))
}
function money(n) {  
return '$' + Number(n).toLocaleString('en-US',
    {      
minimumFractionDigits: 2,
      maximumFractionDigits: 2    
})
}
function dateLabel(v) {  
if (!v) return 'Not selected'; let d = new Date(v + 'T12:00:00'); return d.toLocaleDateString(undefined,
    {      
day: 'numeric',
      month: 'short',
      year: 'numeric'    
})
}
function openModal(id) {
  const modal = $(id); if (!modal) return;
  if (id === '#bookingModal') {
    const form = $('#bookingForm'); if (form) {      
const ci = form.elements.checkin,
      co = form.elements.checkout; const iso = d => {        
const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return x.toISOString().slice(0,
          10)      
}; const today = new Date(); const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); const next = new Date(tomorrow); next.setDate(tomorrow.getDate() + 1); if (ci && !ci.value) ci.value = iso(tomorrow); if (co && !co.value) co.value = iso(next); if (ci && co) {        
co.min = iso(tomorrow); ci.addEventListener('change',
          () => {const d = new Date(ci.value + 'T12:00:00'); d.setDate(d.getDate() + 1); const min = iso(d); co.min = min; if (!co.value || co.value <= ci.value) co.value = min},
          {once: true})      
}    
}
  }
  if (id === '#bookingModal' && typeof renderBookingPage === 'function') renderBookingPage();
  modal.scrollTop = 0;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false')
}
function closeModal(id) {$(id).classList.remove('open'); $(id).setAttribute('aria-hidden', 'true')}
function toast(t) {  
let x = $('#toast'); if (!x) return; x.textContent = t; x.classList.add('show'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(() => x.classList.remove('show'),
    4000)
}

/* ---------- navbar (mobile menu) ---------- */
if ($('#hamb') && $('#nav')) {
  $('#hamb').onclick = () => $('#nav').classList.toggle('open');
  $$('#nav a').forEach(a => a.onclick = () => $('#nav').classList.remove('open'));
}

/* ---------- popups: close button, backdrop click, Escape ---------- */
$$('[data-close]').forEach(b => b.onclick = () => {  
const m = b.closest('.modal'); m.classList.remove('open'); m.setAttribute('aria-hidden',
    'true')
});
$$('.modal').forEach(m => m.addEventListener('click',
  e => {    
if (e.target === m) {      
m.classList.remove('open'); m.setAttribute('aria-hidden',
        'true')    
}  
}));
document.addEventListener('keydown',
  e => {    
if (e.key === 'Escape') $$('.modal.open').forEach(m => {      
m.classList.remove('open'); m.setAttribute('aria-hidden',
        'true')    
})  
});

/* ---------- demo sign-in / sign-up (stores sample credentials in this browser only) ---------- */
let authMode = 'login';
function showSignedInWave() {  
const b = $('#loginBtn'); b.innerHTML = '<svg class="wave-account-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 7.2 0M2 13c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 7.2 0M2 18c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 7.2 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'; b.title = 'Signed in'; b.setAttribute('aria-label',
    'Signed in account'); b.classList.add('is-signed-in')
} const signedInSession = sessionStorage.getItem('beautyOfBeachesSignedIn'); if (signedInSession) {try {showSignedInWave()} catch (e) {sessionStorage.removeItem('beautyOfBeachesSignedIn')} }
function authSet(mode) {
  authMode = mode;
  $$('#authModal [data-auth-only]').forEach(el => {el.hidden = el.dataset.authOnly !== mode});
  $('#authName').required = mode === 'signup';
  $('#authTitle').textContent = mode === 'signup' ? 'Create Your Beautifull Beaches Account' : 'Welcome Back to Beautifull Beaches';
  $('#authIntro').textContent = mode === 'signup' ? 'Sign up to save stays and trip plans' : 'Sign in your account';
  $('#authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Login';
  $('#authMsg').textContent = '';
}
if ($('#authModal')) {
  const av = $('#authVideo'), srcs = [av.dataset.src, av.dataset.src2]; let avIdx = 0;
  const avPlay = i => {    
avIdx = i; av.src = srcs[i]; av.load(); const p = av.play(); if (p && p.catch) p.catch(() => {}); $$('#authDots button').forEach((d,
      n) => d.classList.toggle('on',
        n === i))  
};
  av.addEventListener('ended', () => avPlay((avIdx + 1) % srcs.length));
  $$('#authDots button').forEach(b => b.onclick = () => avPlay(+b.dataset.vid));
  new MutationObserver(() => {
    if ($('#authModal').classList.contains('open')) {if (!av.getAttribute('src')) avPlay(avIdx); else av.play && av.play().catch(() => {})}
    else {av.pause(); av.removeAttribute('src'); av.load()}
  }).observe($('#authModal'), {attributes: true, attributeFilter: ['class']});
  $$('#authModal [data-auth-mode]').forEach(b => b.onclick = () => authSet(b.dataset.authMode));
  $$('#authModal [data-eye]').forEach(b => b.onclick = () => {    
const i = b.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label',
      show ? 'Hide password' : 'Show password')  
});
  $$('#authModal [data-social]').forEach(b => b.onclick = () => toast(b.dataset.social + ' sign-in is not connected yet.'));
  $('#authForgot').onclick = () => toast('Password reset by email is not connected yet.');
  $('#loginBtn').onclick = () => {
    try {const r = localStorage.getItem('bobRememberEmail'); if (r) {$('#authForm [name=email]').value = r; $('#authRemember').checked = true} } catch (e) {}
    openModal('#authModal');
  };
  $('#authForm').addEventListener('submit', e => {
    e.preventDefault();
    let f = new FormData(e.target),
      email = String(f.get('email')).trim().toLowerCase(),
      pass = String(f.get('password'));
    const msg = t => {$('#authMsg').textContent = t};
    if (!/^\S+@\S+\.\S+$/.test(email)) {msg('Please enter a valid email address.'); return }
    if (pass.length < 6) {msg('Password must be at least 6 characters.'); return }
    let users = JSON.parse(localStorage.getItem('oceanluxeDemoUsers') || '{}');
    if (authMode === 'signup') {
      if (!String(f.get('name')).trim()) {msg('Please enter your name.'); return }
      if (pass !== String(f.get('confirm'))) {msg('Passwords do not match.'); return }
      if (users[email]) {msg('An account for this email already exists in this browser.'); return }
      users[email] = {name: f.get('name'), password: pass};
      localStorage.setItem('oceanluxeDemoUsers', JSON.stringify(users));
      authSet('login');
      msg('Account created. You can now log in.');
      $('#authForm [name=email]').value = email; $('#authForm [name=password]').value = '';
      toast('Welcome to Beautifull Beaches. Account created.');
    } else {
      if (!users[email] || users[email].password !== pass) {msg('Wrong email or password. Create an account first if you are new.'); return }
      try {        
if (f.get('remember')) localStorage.setItem('bobRememberEmail',
          email); else localStorage.removeItem('bobRememberEmail')      
} catch (err) {}
      msg(`Welcome back, ${users[email].name}.`);
      sessionStorage.setItem('beautifullBeachesSignedIn', JSON.stringify({name: users[email].name, email}));
      showSignedInWave();
      toast(`Welcome back, ${users[email].name}.`);
      setTimeout(() => closeModal('#authModal'), 900);
    }
  });
  authSet('login');
}

/* ---------- LIVE visitor counter ----------
   Real count shared by every visitor (free counterapi.dev, no backend needed).
   - a visitor is counted once per browser session (not on every page click)
   - the number refreshes by itself every 20 seconds, so you can watch it grow
   - if the API can't be reached, the last known number stays on screen        */
const LIVE_COUNTER = {
  ns: 'beautifullbeaches-eproject-2026',
  key: 'guests',
  // free counter services tried in order; the one that answers is remembered
  providers: [
    {up: (ns, k) => `https://api.counterapi.dev/v1/${ns}/${k}/up`, get: (ns, k) => `https://api.counterapi.dev/v1/${ns}/${k}`},
    {up: (ns, k) => `https://abacus.jasoncameron.dev/hit/${ns}/${k}`, get: (ns, k) => `https://abacus.jasoncameron.dev/get/${ns}/${k}`}
  ]
};
(function() {
  const el = $('#visitorCount'); if (!el) return;
  const box = el.closest('.visitors');
  let shown = null;
  const lsGet = k => {try {return localStorage.getItem(k)} catch (e) {return null} };
  const lsSet = (k, v) => {try {localStorage.setItem(k, v)} catch (e) {} };
  const fmt = n => Number(n).toLocaleString('en-US');
  const readCount = d => {const n = d && (d.count ?? d.value ?? d.Count); return Number.isFinite(+n) && n !== null && n !== '' ? +n : null };

  function render(n) {
    if (n === null || n === shown) return;
    const from = shown, to = n; shown = n;
    lsSet('bobGuests', to); ss.set('bobGuests', to);
    if (from === null || Math.abs(to - from) > 50 || matchMedia('(prefers-reduced-motion:reduce)').matches) {el.textContent = fmt(to); return }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 700);
      el.textContent = fmt(Math.round(from + (to - from) * p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    if (box) {box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump')}
  }
  async function fetchNum(u) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 6000);
    try {
      const r = await fetch(u, {cache: 'no-store', signal: ctl.signal});
      if (!r.ok) throw new Error(r.status);
      return readCount(await r.json());
    } catch (e) {return null} finally {clearTimeout(timer)}
  }
  // kind = 'up' (count me + read) or 'get' (just read); tries the remembered service first
  async function ask(kind) {
    const P = LIVE_COUNTER.providers, pref = +lsGet('bobProv') || 0;
    const order = P.map((p, i) => i).sort((x, y) => (x === pref ? -1 : y === pref ? 1 : x - y));
    for (const i of order) {
      const n = await fetchNum(P[i][kind](LIVE_COUNTER.ns, LIVE_COUNTER.key));
      if (n !== null) {lsSet('bobProv', i); return n}
    }
    return null;
  }
  // last resort when no counter service is reachable: guests counted on this device, so a number always shows
  function localCount(first) {
    let n = +lsGet('bobLocalGuests') || 0;
    if (first && !ss.get('bobLocalHit')) {n++; lsSet('bobLocalGuests', n); ss.set('bobLocalHit', '1')}
    if (box) box.title = 'Guests counted on this device (live counter is offline right now)';
    return Math.max(1, n);
  }

  // show the last known number straight away (no flicker between pages)
  const cached = +(ss.get('bobGuests') || lsGet('bobGuests') || NaN);
  if (Number.isFinite(cached)) {shown = cached; el.textContent = fmt(cached)}

  // count this visitor once per session, otherwise just read the current total
  (async function() {
    const first = !ss.get('bobCounted');
    let n = await ask(first ? 'up' : 'get');
    if (n === null && first) n = await ask('get');
    else if (n !== null && first) ss.set('bobCounted', '1');
    if (n === null && shown === null) n = localCount(first);
    render(n);
  })();

  // keep it live: refresh every 20 s while the tab is open and visible
  setInterval(async () => {if (!document.hidden) render(await ask('get'))}, 20000);
  document.addEventListener('visibilitychange', async () => {if (!document.hidden) render(await ask('get'))});
})();

/* ---------- ticker (date / time / REAL live location) ---------- */
let tickerLoc = 'FINDING YOUR LOCATION…';
function tick() {
  const t = $('#tickerText'); if (!t) return;
  const now = new Date();
  t.textContent = `BEAUTIFULLBEACHES  ✦  ${now.toLocaleDateString(undefined,
    {      
weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'    
})}  ✦  ${now.toLocaleTimeString()}  ✦  ${tickerLoc}`;
}
tick(); setInterval(tick, 1000);

/* Real location of the person visiting the site:
   1) IP lookup first  → city shows up instantly, no permission pop-up needed
   2) GPS (browser asks permission) → exact city replaces it if the visitor allows
   Free services, no API key: BigDataCloud (GPS + IP), OpenStreetMap Nominatim and geojs.io as backups. */
(function() {
  const setPlace = (label, how) => {
    if (!label) return;
    tickerLoc = '📍 ' + label.toUpperCase();
    const s = $('#locationStatus'); if (s) s.textContent = '📍 ' + label + (how === 'gps' ? ' · live' : '');
    ss.set('bobPlace', JSON.stringify({label, how}));
    tick();
  };
  const join = (...p) => p.map(x => (x || '').trim()).filter((x, i, a) => x && x !== a[i - 1]).join(', ');
  async function getJSON(u, ms = 8000) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
    try {const r = await fetch(u, {signal: ctl.signal}); if (!r.ok) throw new Error(r.status); return await r.json()}
    finally {clearTimeout(timer)}
  }
  const fromBDC = d => join(d.city || d.locality, d.principalSubdivision, d.countryName);

  async function byIP() {
    try {const l = fromBDC(await getJSON('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en')); if (l) return l} catch (e) {}
    try {const d = await getJSON('https://get.geojs.io/v1/ip/geo.json'); return join(d.city, d.region, d.country)} catch (e) {}
    return '';
  }
  async function byCoords(lat, lng) {
    try {const l = fromBDC(await getJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)); if (l) return l} catch (e) {}
    try {
      const a = (await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lng}`)).address || {};
      return join(a.city || a.town || a.village || a.suburb || a.county, a.state, a.country);
    } catch (e) {}
    return '';
  }
  function gps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async pos => {const l = await byCoords(pos.coords.latitude, pos.coords.longitude); if (l) setPlace(l, 'gps')},
      () => {},                                   // denied / unavailable → IP location stays
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000});
  }

  // same session → show what we already found, then refresh quietly
  let saved = null; try {saved = JSON.parse(ss.get('bobPlace') || 'null')} catch (e) {}
  if (saved && saved.label) setPlace(saved.label, saved.how);
  else byIP().then(l => {if (l) setPlace(l, 'ip'); else {tickerLoc = '📍 LOCATION UNAVAILABLE'; tick()} });

  gps();
  setInterval(async () => {                      // location stays live while the page is open (only if GPS already allowed)
    try {if (navigator.permissions && (await navigator.permissions.query({name: 'geolocation'})).state === 'granted') gps()} catch (e) {}
  }, 5 * 60 * 1000);
})();

/* ---------- date defaults for booking bar + booking form ---------- */
(function() {  
let d = new Date(),
  iso = x => {    
let z = new Date(x.getTime() - x.getTimezoneOffset() * 60000); return z.toISOString().slice(0,
      10)  
},
  tom = new Date(d); tom.setDate(tom.getDate() + 1); let aft = new Date(tom); aft.setDate(aft.getDate() + 2); let ci = $('#checkin'),
    co = $('#checkout'),
    bi = $('#bookingForm [name=checkin]'),
    bo = $('#bookingForm [name=checkout]');[ci,
      co,
      bi,
      bo].forEach(x => {if (x) x.min = iso(d)}); if (ci && !ci.value) ci.value = iso(tom); if (co && !co.value) co.value = iso(aft); if (bi) bi.addEventListener('change',
        () => {if (bo) {let n = new Date(bi.value + 'T12:00:00'); n.setDate(n.getDate() + 1); bo.min = iso(n); if (!bo.value || bo.value <= bi.value) bo.value = iso(n)} }); if (bo && bi) bo.addEventListener('change',
          () => {if (bo.value <= bi.value) {let n = new Date(bi.value + 'T12:00:00'); n.setDate(n.getDate() + 1); bo.value = iso(n)} })
})();

/* ---------- hero slider (home page only) ---------- */
if ($('.hero-slide')) {
  let slide = 0,
    slides = $$('.hero-slide'),
    dots = $$('.hero-dots button'),
    motion = true; function setSlide(n) {      
slide = (n + slides.length) % slides.length; slides.forEach((s,
        i) => {          
s.classList.toggle('active',
            i === slide); let v = s.querySelector('video'); if (i === slide && motion) {              
v.muted = true; v.loop = true; v.playsInline = true; let p = v.play(); if (p && p.catch) p.catch(() => {                
v.addEventListener('canplay',
                  () => v.play().catch(() => {}),
                  {once: true})              
})            
} else v.pause()      
}); dots.forEach((d,
        i) => d.classList.toggle('active',
          i === slide)); $('#slideNumber').textContent = `0${slide + 1} / 03`; $('#heroPlace').textContent = slides[slide].dataset.place    
} $('.slide-arrow.prev').onclick = () => setSlide(slide - 1); $('.slide-arrow.next').onclick = () => setSlide(slide + 1); dots.forEach((d,
      i) => d.onclick = () => setSlide(i)); $('#videoToggle').onclick = () => {motion = !motion; $('#videoToggle').innerHTML = motion ? 'Ⅱ <span>Motion</span>' : '▶ <span>Motion</span>'; if (motion) setSlide(slide); else slides.forEach(s => s.querySelector('video').pause())};
}

/* ---------- saved ("heart") stays survive page changes ---------- */
const saved = new Set((() => {try {return JSON.parse(ss.get('bobSaved') || '[]')} catch (e) {return []} })());

/* ---------- card templates ---------- */
const stayCard = s => `<article class="stay-card"><div class="stay-image"><img loading="lazy" src="${img(s.img,
  700)}" alt="${s.name}"><span class="stay-badge">${s.tag}</span><button class="heart ${saved.has(s.id) ? 'saved' : ''}" data-heart="${s.id}" aria-label="Save stay">${saved.has(s.id) ? '♥' : '♡'}</button><span class="image-rating">★ ${s.rating} <span style="color:#d8dce1">(${s.reviews})</span></span></div><div class="stay-body"><span class="stay-location">⌖ ${s.country} · ${s.zone} zone</span><h3>${s.name}</h3><p class="stay-desc">${s.desc}</p><div class="amenities">${perks.slice(s.id % 2,
    s.id % 2 + 3).map(p => `<span>${p}</span>`).join('')}</div><div class="stay-foot"><div class="price"><strong>$${s.price.toLocaleString()}</strong><small>per night · demo rate</small></div><button class="btn btn-outline" data-book="${s.id}">View & book ↗</button></div></div></article>`;
const journeyCard = j => `<article class="journey-card"><div class="journey-image"><img loading="lazy" src="${img(j.photo,
  900)}" alt="${escapeHTML(j.title)}"><span class="journey-tag">${j.tag}</span><div class="journey-image-bottom"><span>${escapeHTML(j.place)}</span><b>${j.days} days</b></div></div><div class="journey-body"><div class="journey-title-row"><h3>${escapeHTML(j.title)}</h3><span class="journey-duration">${j.days - 1} NIGHTS</span></div><p class="journey-subtitle">${escapeHTML(j.desc)}</p><div class="journey-includes"><div class="journey-include"><i class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6"/></svg></i><span>${escapeHTML(j.stay)}</span></div><div class="journey-include"><i class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 13 5 7h14l2 6v6h-3v-2H6v2H3zM5 13h14M7 16h.01M17 16h.01"/></svg></i><span>${escapeHTML(j.transport)}</span></div><div class="journey-include"><i class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 11h16l-1 9H5zM7 8c-1-1 1-2 0-3M12 8c-1-1 1-2 0-3M17 8c-1-1 1-2 0-3"/></svg></i><span>${escapeHTML(j.meals)}</span></div><div class="journey-include"><i class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 2 2.8 6.2L21 11l-6.2 2.8L12 20l-2.8-6.2L3 11l6.2-2.8zM19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2z"/></svg></i><span>${j.experiences.length} signature experiences</span></div></div><div class="journey-card-bottom"><div class="journey-price"><small>FROM / PERSON</small><strong>${money(j.price)}</strong></div><div class="journey-actions"><button class="journey-details-btn" data-trip-details="${j.id}">Itinerary</button><button class="journey-choose-btn" data-trip-choose="${j.id}">Choose ↗</button></div></div></div></article>`;

/* ---------- pagination buttons (← 1 2 3 →) ---------- */
function buildPagination(el, page, pages, go) {
  el.innerHTML = '';
  if (pages <= 1) return;
  const mk = (label,
    fn,
    cls,
    aria) => {      
const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.setAttribute('aria-label',
        aria); b.onclick = fn; return b  
};
  el.append(mk('←', () => go(Math.max(1, page - 1)), '', 'Previous page'));
  for (let n = 1; n <= pages; n++) {
    if (pages > 7 && n > 2 && n < pages - 1 && Math.abs(n - page) > 1) {
      if (n === 3 || n === pages - 2) {const e = document.createElement('span'); e.textContent = '…'; el.append(e)}
      continue;
    }
    const b = mk(n, () => go(n), n === page ? 'active' : '', 'Page ' + n);
    if (n === page) b.setAttribute('aria-current', 'page');
    el.append(b);
  }
  el.append(mk('→', () => go(Math.min(pages, page + 1)), '', 'Next page'));
}
/* keep ?page=2&zone=North etc. in the address bar so refresh / back / sharing works */
function syncURL(params) {
  const qs = params.toString();
  try {history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''))} catch (e) {}
}
const urlParams = new URLSearchParams(location.search);

/* ---------- booking pop-up: opened from a stay card ---------- */
function bindStayGrid(grid) {
  grid.addEventListener('click', e => {
    let h = e.target.closest('[data-heart]');
    if (h) {
      let id = +h.dataset.heart;
      saved.has(id) ? saved.delete(id) : saved.add(id);
      ss.set('bobSaved', JSON.stringify([...saved]));
      h.classList.toggle('saved', saved.has(id));
      h.textContent = saved.has(id) ? '♥' : '♡';
      return;
    }
    let b = e.target.closest('[data-book]');
    if (b) {
      let s = stays.find(x => x.id === Number(b.dataset.book));
      if (!s) {toast('Sorry, this stay could not be found. Please refresh the page and try again.'); return }
      const bookingForm = $('#bookingForm');
      if (!bookingForm || !$('#bookingModal')) {toast('Booking form is unavailable. Please refresh the page.'); return }
      selectedJourney = null;
      $('#modalTitle').textContent = `Reserve ${s.name}`;
      $('#modalSubtitle').textContent = `${s.country} · from $${s.price.toLocaleString()} per night`;
      bookingForm.elements.stay.value = s.name;
      const msg = $('#bookingMsg'); if (msg) msg.textContent = '';
      openModal('#bookingModal');
    }
  });
}

// Global fallback: every stay booking button opens the same reservation flow, including featured/hero cards.
document.addEventListener('click', e => {
  const b = e.target.closest('[data-book]'); if (!b) return;
  // The stay grid's delegated handler handles its own buttons.
  if (b.closest('#stayGrid, #stayFeatured')) return;
  const s = stays.find(x => x.id === Number(b.dataset.book)); if (!s) return;
  const form = $('#bookingForm'); if (!form || !$('#bookingModal')) return;
  selectedJourney = null; $('#modalTitle').textContent = `Reserve ${s.name}`;
  $('#modalSubtitle').textContent = `${s.country} · from $${s.price.toLocaleString()} per night`;
  form.elements.stay.value = s.name; const msg = $('#bookingMsg'); if (msg) msg.textContent = ''; openModal('#bookingModal');
});

/* =========================================================
   HOME PAGE — 30 featured stays + zone cards + booking bar
   ========================================================= */
if (PAGE === 'home') {
  /* zone cards */
  $('#zoneGrid').innerHTML = places.map((z,
    i) => `<article class="zone-card"><img loading="lazy" src="${img(photoIds[i + 4],
      900)}" alt="${z[0]} zone beach"><div class="zone-info"><small>ZONE 0${i + 1}</small><h3>${z[0]} Coast</h3><p>${z[2]}</p><button data-zone="${z[0]}">Explore collection ↗</button></div></article>`).join('');
  $('#zoneGrid').addEventListener('click', e => {
    let b = e.target.closest('[data-zone]');
    if (b) location.href = 'pages/stays.html?zone=' + encodeURIComponent(b.dataset.zone);
  });
  /* first 10 stays only — the rest live on the Full Stay page */
  const homeStays = stays.slice(0, HOME_PAGE_CARDS);
  $('#stayGrid').innerHTML = homeStays.map(stayCard).join('');
  $('#pageRange').textContent = `1–${homeStays.length}`;
  if ($('#totalCount')) $('#totalCount').textContent = stays.length;
  bindStayGrid($('#stayGrid'));
  focusCarousel($('#stayGrid'), $('#stayCtl'));
  /* booking bar → Full Stay page, carrying destination / dates / guests */
  $('#searchBtn').onclick = () => {
    const p = new URLSearchParams(), zone = $('#destination').value;
    if (zone && zone !== 'All') p.set('zone', zone);
    if ($('#checkin').value) p.set('checkin', $('#checkin').value);
    if ($('#checkout').value) p.set('checkout', $('#checkout').value);
    if ($('#guests').value) p.set('guests', $('#guests').value);
    const qs = p.toString();
    location.href = (PAGE === 'home' ? 'pages/stays.html' : 'stays.html') + (qs ? '?' + qs : '');
  };
}

/* =========================================================
   FULL STAY PAGE — 70 per page, pagination, search / zone / sort
   ========================================================= */
if (PAGE === 'stays') {
  let page = Math.max(1, parseInt(urlParams.get('page'), 10) || 1);
  $('#searchInput').value = urlParams.get('q') || '';
  if (['North',
    'South',
    'East',
    'West'].includes(urlParams.get('zone'))) $('#zoneSelect').value = urlParams.get('zone');
  if (['low', 'high', 'rating'].includes(urlParams.get('sort'))) $('#sortSelect').value = urlParams.get('sort');
  const grid = $('#stayGrid');
  function renderStays(scroll) {
    let q = ($('#searchInput').value || '').trim().toLowerCase(),
      zone = $('#zoneSelect').value,
      sort = $('#sortSelect').value;
    let filtered = stays.filter(s => `${s.name} ${s.country} ${s.zone}`.toLowerCase().includes(q) && (zone === 'All' || s.zone === zone));
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    let pages = Math.max(1, Math.ceil(filtered.length / FULL_PER_PAGE));
    page = Math.min(Math.max(1, page), pages);
    let current = filtered.slice((page - 1) * FULL_PER_PAGE, page * FULL_PER_PAGE);
    $('#resultsCount').textContent = `${filtered.length} curated ${filtered.length === 1 ? 'escape' : 'escapes'}`;
    $('#pageRange').textContent = filtered.length ? `${(page - 1) * FULL_PER_PAGE + 1}–${Math.min(page * FULL_PER_PAGE,
      filtered.length)}` : '0';
    $('#totalCount').textContent = filtered.length;
    grid.innerHTML = current.map(stayCard).join('') || '<p class="muted">No stays match those filters. Try another destination.</p>';
    buildPagination($('#pagination'), page, pages, n => {page = n; renderStays(true)});
    const p = new URLSearchParams();
    if (page > 1) p.set('page', page);
    if (zone !== 'All') p.set('zone', zone);
    if (q) p.set('q', $('#searchInput').value.trim());
    if (sort !== 'featured') p.set('sort', sort);
    ['checkin', 'checkout', 'guests'].forEach(k => {if (urlParams.get(k)) p.set(k, urlParams.get(k))});
    syncURL(p);
    if (scroll) $('#stays').scrollIntoView({behavior: 'smooth'});
  }
  $('#searchInput').addEventListener('input', () => {page = 1; renderStays()});
  $('#zoneSelect').addEventListener('change', () => {page = 1; renderStays()});
  $('#sortSelect').addEventListener('change', () => {page = 1; renderStays()});
  bindStayGrid(grid);
  renderStays();
  /* top row: 10 stays as a focus carousel (the normal list below is unchanged) */
  const fg = $('#stayFeatured');
  if (fg) {fg.innerHTML = stays.slice(0, HOME_PAGE_CARDS).map(stayCard).join(''); bindStayGrid(fg); focusCarousel(fg, $('#stayFeatCtl'))}
  /* dates / guests picked on the home booking bar pre-fill the reservation pop-up */
  (function() {
    const ci = urlParams.get('checkin'), co = urlParams.get('checkout'), g = parseInt(urlParams.get('guests'), 10);
    const bi = $('#bookingForm [name=checkin]'),
      bo = $('#bookingForm [name=checkout]'),
      bg = $('#bookingForm [name=guests]');
    if (ci && co && co > ci && bi && bo) {bi.value = ci; bo.value = co}
    if (g > 0 && g < 100 && bg) bg.value = g;
  })();
}

/* =========================================================
   TRIPS PAGE (30 packages)  &  ALL TRIPS PAGE (70 per page)
   ========================================================= */
let selectedJourney = null, journeyFilter = 'All';
function showJourney(j) {  
selectedJourney = j; $('#tripDetailContent').innerHTML = `<div class="trip-detail-hero"><img src="${img(j.photo,
    1200)}" alt="${escapeHTML(j.title)}"><div><p>${escapeHTML(j.place)} · ${j.days} DAYS / ${j.days - 1} NIGHTS</p><h2>${escapeHTML(j.title)}</h2></div></div><p class="trip-detail-intro">${escapeHTML(j.desc)} This sample itinerary is designed to make the important details clear before you choose your trip.</p><div class="trip-detail-columns"><div><h3>Included in your plan</h3><ul><li>${escapeHTML(j.stay)}</li><li>${escapeHTML(j.transport)}</li><li>${escapeHTML(j.meals)}</li>${j.experiences.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></div><div><h3>Your itinerary</h3><ul>${j.itinerary.map(x => `<li><b>${escapeHTML(x[0])}:</b> ${escapeHTML(x[1])}</li>`).join('')}</ul></div></div><div class="trip-detail-price"><div><small>ILLUSTRATIVE DEMO RATE / PERSON</small><strong>${money(j.price)}</strong><small>Final rate depends on dates, guest count and availability.</small></div><button class="btn btn-gold" id="chooseJourneyFromDetails">Choose this journey ↗</button></div>`; openModal('#tripDetailModal'); $('#chooseJourneyFromDetails').onclick = () => chooseJourney(j)
}
function chooseJourney(j) {selectedJourney = j; closeModal('#tripDetailModal'); $('#modalTitle').textContent = 'Reserve: ' + j.title; $('#modalSubtitle').textContent = `${j.days} days · ${j.place} · sample package rate ${money(j.price)} per person`; $('#bookingForm [name=stay]').value = j.title; const exp = $('#bookingForm [name=experience]'); exp.value = j.kind === 'Romantic' ? 'Romantic escape' : j.kind === 'Family' ? 'Family getaway' : j.kind === 'Adventure' ? 'Adventure & explore' : 'Relax & unwind'; $('#bookingForm [name=guests]').value = 2; openModal('#bookingModal')}
if (PAGE === 'trips' || PAGE === 'all-trips') {
  const full = PAGE === 'all-trips', root = $('#journeyGrid');
  let tripPage = Math.max(1, parseInt(urlParams.get('page'), 10) || 1);
  if (full && ['Romantic',
    'Family',
    'Adventure',
    'Slow living'].includes(urlParams.get('kind'))) journeyFilter = urlParams.get('kind');
  $$('[data-trip-filter]').forEach(x => x.classList.toggle('active', x.dataset.tripFilter === journeyFilter));
  function renderTrips(scroll) {
    const items = journeys.filter(j => journeyFilter === 'All' || j.kind === journeyFilter);
    let from = 0, current;
    if (full) {
      const pages = Math.max(1, Math.ceil(items.length / FULL_PER_PAGE));
      tripPage = Math.min(Math.max(1, tripPage), pages);
      from = (tripPage - 1) * FULL_PER_PAGE;
      current = items.slice(from, from + FULL_PER_PAGE);
      buildPagination($('#pagination'), tripPage, pages, n => {tripPage = n; renderTrips(true)});
      const p = new URLSearchParams();
      if (tripPage > 1) p.set('page', tripPage);
      if (journeyFilter !== 'All') p.set('kind', journeyFilter);
      syncURL(p);
    } else {
      current = items.slice(0, HOME_CARDS);
      const link = $('#fullTripsLink');
      if (link) link.href = 'all-trips.html' + (journeyFilter === 'All' ? '' : '?kind=' + encodeURIComponent(journeyFilter));
    }
    root.innerHTML = current.map(journeyCard).join('') || '<p class="muted">No journeys match this filter.</p>';
    if (!full) focusCarousel(root, $('#tripCtl'));
    if ($('#tripsCount')) $('#tripsCount').textContent = `${items.length} curated ${items.length === 1 ? 'journey' : 'journeys'}`;
    $('#tripRange').textContent = current.length ? `${from + 1}–${from + current.length}` : '0';
    $('#tripTotal').textContent = items.length;
    if (scroll) $('#journeys').scrollIntoView({behavior: 'smooth'});
  }
  $$('[data-trip-filter]').forEach(b => b.addEventListener('click', () => {
    journeyFilter = b.dataset.tripFilter; tripPage = 1;
    $$('[data-trip-filter]').forEach(x => x.classList.toggle('active', x === b));
    renderTrips();
  }));
  root.addEventListener('click', e => {
    let d = e.target.closest('[data-trip-details]'), c = e.target.closest('[data-trip-choose]');
    if (d) showJourney(journeys.find(j => j.id === d.dataset.tripDetails));
    if (c) chooseJourney(journeys.find(j => j.id === c.dataset.tripChoose));
  });
  renderTrips();
}

/* =========================================================
   BOOKING FLOW — full pages: details → review → receipt (demo only)
   Step 1 = #bookingModal, step 2 = #reviewModal, step 3 = #receiptModal
   ========================================================= */
const TAX_RATE = .12, SERVICE_RATE = .05;
const PROMO_CODES = {BEACH10: .10}; // demo promo codes → share of the subtotal taken off. Edit or add codes here.
const pct = n => Math.round(n * 100);
const round2 = n => Math.round(n * 100) / 100;
const nightsBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const clampGuests = v => Math.max(1, Math.min(99, parseInt(v, 10) || 1));
const sentenceCase = t => t.charAt(0) + t.slice(1).toLowerCase();

const BK_ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  waves: '<path d="M2 8q2.5-3 5 0t5 0 5 0 5 0M2 15q2.5-3 5 0t5 0 5 0 5 0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'
};
const bkIcon = n => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${BK_ICONS[n]}</svg>`;
const STAY_FEATURES = [['wifi',
  'High-speed Wi-Fi'],
['sun',
  'Daily housekeeping'],
['waves',
  'Direct beach access'],
['clock',
  '24-hour concierge'],
['leaf',
  'Spa-style bathroom'],
['coffee',
  'Welcome refreshments'],
['plane',
  'Airport transfers on request'],
['pin',
  'Local experiences desk'],
['key',
  'Private check-in']];

let bookingCtx = null, bookingPromo = null, bookingEditing = false, pendingBooking = null, confirmedBooking = null;

/* what is being booked: a stay card or a journey package */
function getBookingContext() {
  const name = $('#bookingForm').elements.stay.value, n = photoIds.length;
  if (selectedJourney && selectedJourney.title === name) {
    const j = selectedJourney, i = Math.max(0, photoIds.indexOf(j.photo));
    return {      
kind: 'journey', title: j.title, place: j.place, rate: j.price,
      desc: `${j.desc} ${j.days} days and ${j.days - 1} nights, planned so the important details are clear before you book.`,
      gallery: [j.photo, photoIds[(i + 3) % n], photoIds[(i + 7) % n]],
      pills: [sentenceCase(j.tag), `${j.days} days / ${j.days - 1} nights`, `${j.kind} escape`],
      checks: [j.stay, j.transport, j.meals],
      features: [['key', j.stay], ['plane', j.transport], ['coffee', j.meals], ...j.experiences.map(x => ['star', x])]    
};
  }
  const s = stays.find(x => x.name === name);
  if (s) {
    const i = Math.max(0, photoIds.indexOf(s.img)), own = perks.slice(s.id % 2, s.id % 2 + 3);
    return {      
kind: 'stay', title: s.name, place: `${s.country} · ${s.zone} zone`, rate: s.price,
      desc: `${s.desc} Set in ${s.country}, rated ${s.rating} by ${s.reviews} guests.`,
      gallery: [s.img, photoIds[(i + 4) % n], photoIds[(i + 8) % n]],
      pills: [sentenceCase(s.tag), `★ ${s.rating} (${s.reviews} reviews)`, `${s.zone} zone`],
      checks: [...own, 'Free Wi-Fi', 'Daily housekeeping', 'Beach access'],
      features: STAY_FEATURES    
};
  }
  return {    
kind: 'stay', title: name || 'BeautyOfBeaches Private Escape', place: 'Private beach escape', rate: 425,
    desc: 'A private beach escape, arranged around your dates.',
    gallery: [photoIds[0], photoIds[3], photoIds[7]], pills: ['Private escape'],
    checks: ['Ocean view',
      'Spa access',
      'Breakfast',
      'Free Wi-Fi',
      'Daily housekeeping',
      'Beach access'],
    features: STAY_FEATURES  
};
}

function bookingPrice(c, checkin, checkout, guests, promo) {
  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const units = c.kind === 'journey' ? guests : Math.max(nights, 0);
  const subtotal = round2(c.rate * units), discount = promo ? round2(subtotal * promo.rate) : 0, taxable = subtotal - discount;
  const tax = round2(taxable * TAX_RATE), service = round2(taxable * SERVICE_RATE);
  return {    
kind: c.kind,
    rate: c.rate,
    nights,
    guests,
    subtotal,
    discount,
    code: promo ? promo.code : null,
    tax,
    service,
    total: round2(taxable + tax + service),
    valid: nights >= 1 && guests >= 1  
};
}

/* <dl> rows for the price breakdown (short on step 1, full on step 2) */
function priceRows(d, detailed) {
  const j = d.kind === 'journey',
    row = (k,
      v,
      cls) => `<div${cls ? ` class="${cls}"` : ''}><dt>${k}</dt><dd>${v}</dd></div>`,
    ok = d.valid;
  let h = row(j ? 'Per person' : 'Per night',
    money(d.rate)) + row(j ? 'Guests' : 'Nights',
      j ? d.guests : (d.nights > 0 ? d.nights : '—'));
  if (detailed) h += row(j ? 'Package subtotal' : 'Stay subtotal', ok ? money(d.subtotal) : '—');
  if (d.discount) h += row(`Code ${escapeHTML(d.code)}`, '−' + money(d.discount), 'is-saving');
  h += detailed
    ? row(`Taxes (${pct(TAX_RATE)}%)`,
      ok ? money(d.tax) : '—') + row(`Service fee (${pct(SERVICE_RATE)}%)`,
        ok ? money(d.service) : '—')
    : row('Taxes & fees', ok ? money(round2(d.tax + d.service)) : '—');
  return h + row('Estimated total', ok ? money(d.total) : '—', 'is-total');
}

function paintHeroes(c) {
  const pills = c.pills.map(t => `<span>${escapeHTML(t)}</span>`).join('');
  $$('[data-bk-hero]').forEach(h => {
    h.innerHTML = `<img class="bk-hero-img" src="${img(c.gallery[0],
      1500)}" alt="${escapeHTML(c.title)}"><div class="bk-pills">${pills}</div><div class="bk-thumbs" role="group" aria-label="Photos">${c.gallery.map((g,
        i) => `<button type="button" class="${i ? '' : 'is-on'}" data-g="${i}" aria-label="Show photo ${i + 1}"><img src="${img(g,
          260)}" alt=""></button>`).join('')}</div>`;
    h.querySelector('.bk-thumbs').onclick = e => {
      const b = e.target.closest('[data-g]'); if (!b) return;
      h.querySelector('.bk-hero-img').src = img(c.gallery[+b.dataset.g], 1500);
      h.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('is-on', x === b));
    };
  });
}

function setPromoMsg(t,
  ok) {const m = $('#bkPromoMsg'); m.textContent = t || ''; m.className = 'bk-promo-msg' + (t ? (ok ? ' is-ok' : ' is-bad') : '')}

function updateBookingSummary() {
  if (!bookingCtx) return;
  const f = $('#bookingForm'), g = clampGuests(f.elements.guests.value);
  $('#bkPrice').innerHTML = priceRows(bookingPrice(bookingCtx,
    f.elements.checkin.value,
    f.elements.checkout.value,
    g,
    bookingPromo),
    false);
}

/* fills step 1 (and the photo/title shared by steps 2 + 3) each time the booking page opens */
function renderBookingPage() {
  if (!$('#bookingForm')) return;
  const c = bookingCtx = getBookingContext(), j = c.kind === 'journey';
  if (!bookingEditing) {bookingPromo = null; $('#bkPromo').value = ''; setPromoMsg('')}
  bookingEditing = false;
  $$('[data-bk-title]').forEach(x => x.textContent = c.title);
  $$('[data-bk-place]').forEach(x => x.textContent = c.place);
  $('#bkDesc').textContent = c.desc;
  $('#bkPanelTitle').textContent = j ? 'Reserve this journey' : 'Reserve this stay';
  $('#bkLblIn').textContent = j ? 'Trip starts' : 'Check in';
  $('#bkLblOut').textContent = j ? 'Trip ends' : 'Check out';
  $('#bkSummaryTitle').textContent = j ? 'Journey summary' : 'Stay summary';
  $('#bkFeatTitle').textContent = j ? 'What’s included' : 'Stay features';
  $('#bkChecks').className = 'bk-checks' + (j ? ' is-wide' : '');
  $('#bkChecks').innerHTML = c.checks.map(t => `<li>${bkIcon('check')}<span>${escapeHTML(t)}</span></li>`).join('');
  $('#bkFeats').innerHTML = c.features.map(([i,
    t]) => `<li>${bkIcon(i)}<span>${escapeHTML(t)}</span></li>`).join('');
  const rules = j
    ? [['clock',
      'Your itinerary starts on the date you choose'],
    ['card',
      'No payment is taken — this is a demo reservation'],
    ['key',
      'Rates are per person for the full itinerary'],
    ['shield',
      `Estimated total includes ${pct(TAX_RATE)}% taxes and a ${pct(SERVICE_RATE)}% service fee`]]
    : [['clock',
      'Check-in from 3:00 PM'],
    ['clock',
      'Check-out by 11:00 AM'],
    ['card',
      'No payment is taken — this is a demo reservation'],
    ['shield',
      `Estimated total includes ${pct(TAX_RATE)}% taxes and a ${pct(SERVICE_RATE)}% service fee`]];
  $('#bkRules').innerHTML = rules.map(([i, t]) => `<li>${bkIcon(i)}<span>${escapeHTML(t)}</span></li>`).join('');
  $('#bookingMsg').textContent = '';
  paintHeroes(c);
  updateBookingSummary();
}

/* =========================================================
   BOOKING CONFIRMATION EMAIL (EmailJS — works without a backend)
   Fill the 3 IDs below from your EmailJS dashboard (see email/emailjs-template.html).
   ========================================================= */
const EMAILJS = {
  serviceId: 'service_25x2yac',      // EmailJS → Email Services → Service ID
  templateId: 'template_2bf6t18',    // EmailJS → Email Templates → Template ID
  publicKey: '7fpfHsNgmhMm2Xjzg',      // EmailJS → Account → General → Public Key
  notifyEmail: 'zakariyamalik12121@gmail.com' // booking confirmation goes to this address
};
async function sendBookingEmail(b) {
  const st = $('#emailStatus'), say = t => {if (st) st.textContent = t};
  if (b.emailSent) return;
  if ([EMAILJS.serviceId, EMAILJS.templateId, EMAILJS.publicKey].some(v => !v || String(v).startsWith('YOUR_'))) {
    say('Booking confirmed. Email is not set up yet — add your EmailJS IDs in js/app.js.');
    console.warn('EmailJS IDs are not filled in js/app.js, so no confirmation email was sent.'); return;
  }
  const c = b.ctx || {}, plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const params = {
    to_email: EMAILJS.notifyEmail, guest_name: b.name, guest_email: b.email, reply_to: b.email,
    reference: b.ref,
    stay_name: b.stay,
    booking_type: b.kind === 'journey' ? 'Journey package' : 'Stay',
    place: c.place || '',
    experience: b.experience, check_in: dateLabel(b.checkin), check_out: dateLabel(b.checkout),
    nights: plural(b.nights, 'night'), guests: b.guests, rate: money(b.rate), subtotal: money(b.subtotal),
    discount: b.discount ? `−${money(b.discount)} (${b.code})` : '—',
    tax: money(b.tax),
    service: money(b.service),
    total: money(b.total),
    issued_at: b.created.toLocaleString(), payment_status: 'Not charged (demo reservation)',
    hero_image: c.gallery ? img(c.gallery[0], 900) : '', year: String(new Date().getFullYear())
  };
  say('Sending your confirmation email…');
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send',
      {        
method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({          
service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: params        
})      
});
    if (!r.ok) throw new Error(await r.text() || r.status);
    b.emailSent = true; say(`Confirmation email sent to ${EMAILJS.notifyEmail}.`);
  } catch (err) {
    console.error('EmailJS error:', err);
    say('Booking confirmed, but the confirmation email could not be sent (' + String(err.message || err).slice(0,
      100) + ').');
  }
}

if ($('#bookingForm')) {
  const form = $('#bookingForm');

  /* live price while dates / guests change */
  ['checkin',
    'checkout',
    'guests'].forEach(n => ['input',
      'change'].forEach(ev => form.elements[n].addEventListener(ev,
        () => {          
$('#bookingMsg').textContent = ''; setTimeout(updateBookingSummary,
            0)        
})));
  $$('[data-guest-step]').forEach(b => b.addEventListener('click', () => {
    const i = form.elements.guests;
    i.value = clampGuests((parseInt(i.value, 10) || 1) + Number(b.dataset.guestStep));
    i.dispatchEvent(new Event('input', {bubbles: true}));
  }));

  /* promo code */
  const applyPromo = () => {
    const code = $('#bkPromo').value.trim().toUpperCase();
    if (!code) {bookingPromo = null; setPromoMsg('')}
    else if (PROMO_CODES[code]) {      
bookingPromo = {        
code,
        rate: PROMO_CODES[code]      
}; setPromoMsg(`${code} applied — ${pct(PROMO_CODES[code])}% off your subtotal.`,
        true)    
}
    else {bookingPromo = null; setPromoMsg('That code isn’t valid. Check the spelling and try again.', false)}
    updateBookingSummary();
  };
  $('#bkApply').addEventListener('click', applyPromo);
  $('#bkPromo').addEventListener('keydown', e => {if (e.key === 'Enter') {e.preventDefault(); applyPromo()} });

  /* step 1 → step 2 */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form),
      checkin = String(f.get('checkin')),
      checkout = String(f.get('checkout')),
      msg = $('#bookingMsg');
    if (!checkin || !checkout || checkout <= checkin) {msg.textContent = 'Please choose a check-out date after your check-in date.'; return }
    const nights = nightsBetween(checkin, checkout);
    if (nights < 1) {msg.textContent = 'Stay must be at least one night.'; return }
    const c = bookingCtx || getBookingContext(),
      guestCount = clampGuests(f.get('guests')),
      p = bookingPrice(c,
        checkin,
        checkout,
        guestCount,
        bookingPromo);
    pendingBooking = {      
ctx: c,
      kind: c.kind,
      name: String(f.get('name')).trim(),
      email: String(f.get('email')).trim(),
      stay: c.title,
      checkin,
      checkout,
      nights,
      guestCount,
      guests: guestCount + ' guest' + (guestCount === 1 ? '' : 's'),
      experience: String(f.get('experience')),
      rate: c.rate,
      subtotal: p.subtotal,
      discount: p.discount,
      code: p.code,
      tax: p.tax,
      service: p.service,
      total: p.total,
      valid: true    
};
    const b = pendingBooking;
    $('#reviewDetails').innerHTML = [['Lead guest',
      b.name],
    ['Email',
      b.email],
    ['Check-in',
      dateLabel(checkin)],
    ['Check-out',
      dateLabel(checkout)],
    ['Duration / guests', `${nights} night${nights === 1 ? '' : 's'} · ${b.guests}`], ['Experience', b.experience]]
      .map(([k,
        v]) => `<div class="review-row"><span>${k}</span><strong>${escapeHTML(v)}</strong></div>`).join('');
    $('#reviewPrice').innerHTML = priceRows({...b, guests: b.guestCount}, true);
    closeModal('#bookingModal'); openModal('#reviewModal');
  });

  /* step 2: edit / confirm */
  $$('[data-edit-booking]').forEach(b => b.onclick = () => {closeModal('#reviewModal'); bookingEditing = true; openModal('#bookingModal')});
  $('#confirmBooking').onclick = () => {
    if (!pendingBooking) return;
    confirmedBooking = {      
...pendingBooking,
      ref: 'OL-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + Math.random().toString(36).slice(2,
        5).toUpperCase(),
      created: new Date()    
};
    const b = confirmedBooking,
      row = (k,
        v,
        cls) => `<div class="review-row${cls ? ' ' + cls : ''}"><span>${k}</span><strong${cls ? ' class="receipt-total"' : ''}>${v}</strong></div>`;
    $('#receiptDetails').innerHTML = `<div class="receipt-title"><div><h3>Booking receipt</h3><p>Issued ${b.created.toLocaleString()}</p><p class="receipt-ref">REFERENCE: ${b.ref}</p></div><span class="receipt-stamp">CONFIRMED</span></div>`
      + `<p><b>GUEST</b><br>${escapeHTML(b.name)}<br>${escapeHTML(b.email)}</p><p><b>PROPERTY / EXPERIENCE</b><br>${escapeHTML(b.stay)}<br>${escapeHTML(b.experience)}</p>`
      + row('Check-in',
        dateLabel(b.checkin)) + row('Check-out',
          dateLabel(b.checkout)) + row('Duration',
            `${b.nights} night${b.nights === 1 ? '' : 's'}`) + row('Guests',
              escapeHTML(b.guests))
      + row(b.kind === 'journey' ? 'Package rate × guests' : 'Accommodation', money(b.subtotal))
      + (b.discount ? row(`Promo code ${escapeHTML(b.code)}`, '−' + money(b.discount)) : '')
      + row('Estimated taxes',
        money(b.tax)) + row('Service fee',
          money(b.service)) + row('Estimated total',
            money(b.total),
            'total')
      + '<p><b>Payment status:</b> Not charged (demo reservation)<br><b>Reservation status:</b> Confirmed</p>';
    $('#receiptSide').innerHTML = `<div><dt>Reference</dt><dd>${b.ref}</dd></div><div><dt>Payment</dt><dd>Not charged</dd></div><div class="is-total"><dt>Estimated total</dt><dd>${money(b.total)}</dd></div>`;
    try {
      let list = JSON.parse(sessionStorage.getItem('oceanluxeDemoBookings') || '[]'); if (!Array.isArray(list)) list = [];
      const {ctx,
        ...plain} = b; list.push(plain); sessionStorage.setItem('oceanluxeDemoBookings',
          JSON.stringify(list));
    } catch (storageError) {/* Receipt must still display if browser storage is blocked. */}
    closeModal('#reviewModal'); closeModal('#bookingModal'); openModal('#receiptModal');
    sendBookingEmail(b);
    toast(`Demo receipt ${b.ref} generated.`);
  };
  $('#printReceipt').onclick = () => window.print();
}

/* =========================================================
   GALLERY PAGE
   ========================================================= */
if ($('#galleryGrid')) {
  const galleryIds = [photoIds[0], photoIds[2], photoIds[3], photoIds[4], photoIds[7], photoIds[8]];
  $('#galleryGrid').innerHTML = galleryIds.map((id,
    i) => `<a class="gallery-item" href="stays.html" aria-label="Explore coastal stay ${i + 1}"><img loading="lazy" src="${img(id,
      850)}" alt="Luxury beach escape ${i + 1}"></a>`).join('');
}

/* =========================================================
   FORMS (front-end demo only) + BEACH GUIDE
   ========================================================= */
if ($('#feedbackForm')) $('#feedbackForm').addEventListener('submit',
  e => {e.preventDefault(); $('#feedbackMsg').textContent = 'Thank you — your enquiry has been recorded on this page only.'; e.target.reset(); toast('Thanks for getting in touch with BeautyOfBeaches.')});
const queryForm = $('#queryForm'); if (queryForm) queryForm.addEventListener('submit',
  e => {e.preventDefault(); $('#queryMsg').textContent = 'Your demo query has been recorded on this page only; no email was sent.'; e.target.reset(); toast('Thank you for your query.')});
const guideBtn = $('#downloadGuide'); if (guideBtn) guideBtn.addEventListener('click',
  () => {    
const w = window.open('',
      '_blank'); if (!w) {toast('Please allow pop-ups to print the beach guide.'); return } w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>BeautyOfBeaches Beach Guide</title><style>body{font:16px Arial,sans-serif;line-height:1.65;max-width:800px;margin:40px auto;padding:0 24px;color:#17212a}h1,h2{color:#17415a}h1{border-bottom:3px solid #bd914c;padding-bottom:12px}li{margin:8px 0}.note{background:#f4f0e7;padding:14px}</style></head><body><h1>BeautyOfBeaches — Beach Guide</h1><p><b>Project overview:</b> Explore famous beaches by zone: North, South, East and West.</p><h2>North Zone</h2><p>Explore northern coastlines, scenic coves and cliffside beaches. Check local access and seasonal weather before travel.</p><h2>South Zone</h2><p>Discover warm-water shores, palm-lined beaches and island destinations. Respect local customs and marine conservation rules.</p><h2>West Zone</h2><p>Explore sunset-facing coastlines, beach towns and coastal walking routes. Check tides and local safety notices.</p><h2>East Zone</h2><p>Discover lagoons, coral-rich waters and coastal culture. Avoid touching coral and follow protected-area rules.</p><h2>Travel checklist</h2><ul><li>Check official destination and entry requirements.</li><li>Confirm current transport, weather and accommodation information.</li><li>Follow beach safety signs and leave no litter.</li></ul><p class="note"><b>Educational demo:</b> Destination details, transport and prices must be independently verified. Use the browser Print command and choose “Save as PDF” to create a PDF copy.</p><script>setTimeout(()=>window.print(),400)<\/script></body></html>`); w.document.close()  
});


/* ---------- login button: soft light pulse on click ---------- */
(function () {
  const lb = document.getElementById('loginBtn');
  if (!lb) return;
  lb.addEventListener('click', () => {
    lb.classList.remove('lb-pulse');
    void lb.offsetWidth;
    lb.classList.add('lb-pulse');
  });
  lb.addEventListener('animationend', (e) => {
    if (e.target === lb && e.animationName === 'lbPulse') lb.classList.remove('lb-pulse');
  });
})();


/* ---------- home: guest reviews — black pearl focus carousel (centre card big, auto-slide + arrows + dots + swipe) ---------- */
(function () {
  const stage = document.getElementById('reviewTrack');
  if (!stage) return;
  const REVIEWS = [
    ['Ayesha Khan', 'Karachi', 'Maldives', 'Waking up to the sound of waves was unreal. The villa, the staff, the sunsets, everything felt effortless.'],
    ['Daniel Brooks', 'London', 'Seychelles', 'Easily the smoothest booking I have made. The private beach was spotless and the team anticipated every need.'],
    ['Sara Ahmed', 'Lahore', 'Bali', 'We planned a family getaway and the curated trip was perfect. Kids and grandparents were equally happy.'],
    ['Marco Rossi', 'Milan', 'Amalfi Coast', 'Turquoise water, quiet mornings and superb food. We extended our stay by three days without a second thought.'],
    ['Hira Malik', 'Islamabad', 'Maldives', 'Our honeymoon was magical. The candlelit dinner on the sand is something we will never forget.'],
    ['James Carter', 'Sydney', 'Phuket', 'Great value for a luxury escape. The resort recommendations matched exactly what we were looking for.'],
    ['Fatima Noor', 'Dubai', 'Mauritius', 'Peaceful, private and beautifully designed. The sunset sail was the highlight of our entire year.'],
    ['Liam Chen', 'Singapore', 'Fiji', 'Responsive support, honest descriptions and a stay that looked even better than the photos.'],
    ['Zainab Ali', 'Karachi', 'Seychelles', 'I travelled solo and felt completely safe and welcome. The hidden cove excursion was breathtaking.'],
    ['Oliver Smith', 'Toronto', 'Bali', 'From airport transfer to checkout, every detail was handled. Already planning our return trip.']
  ];
  const n = REVIEWS.length;
  const stars = k => '\u2605'.repeat(k) + '\u2606'.repeat(5 - k);
  stage.innerHTML = REVIEWS.map((r, i) => {
    const k = i % 4 === 3 ? 4 : 5;
    return `<article class="rv-card" aria-label="Review by ${escapeHTML(r[0])}"><div class="rv-in">
      <div class="rv-top"><span class="rv-stars" role="img" aria-label="${k} out of 5 stars">${stars(k)}</span><span class="rv-tag">${escapeHTML(r[2])}</span></div>
      <p class="rv-q">${escapeHTML(r[3])}</p>
      <div class="rv-foot"><span class="rv-avatar" aria-hidden="true">${escapeHTML(r[0].charAt(0))}</span><span><b>${escapeHTML(r[0])}</b><small>${escapeHTML(r[1])}</small></span></div>
    </div></article>`;
  }).join('');

  const cards = [...stage.children];
  const dotsEl = document.getElementById('rvDots');
  if (dotsEl) dotsEl.innerHTML = REVIEWS.map((r, i) => `<button type="button" aria-label="Show review ${i + 1}"></button>`).join('');
  const dots = dotsEl ? [...dotsEl.children] : [];
  let a = 0, timer = null;

  function render() {
    cards.forEach((c, i) => {
      let d = ((i - a) % n + n) % n;
      if (d > n / 2) d -= n;
      c.style.setProperty('--o', Math.max(-3, Math.min(3, d)));
      c.dataset.p = Math.abs(d) <= 2 ? d : 'hide';
      c.setAttribute('aria-hidden', d !== 0);
    });
    dots.forEach((b, i) => b.setAttribute('aria-current', i === a));
  }
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
    timer = setInterval(() => go(a + 1), 4200);
  };
  function go(k) { a = ((k % n) + n) % n; render(); start(); }

  document.getElementById('rvPrev').addEventListener('click', () => go(a - 1));
  document.getElementById('rvNext').addEventListener('click', () => go(a + 1));
  if (dotsEl) dotsEl.addEventListener('click', e => { const i = dots.indexOf(e.target.closest('button')); if (i > -1) go(i); });

  let sx = null, moved = false;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; });
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { moved = true; go(a + (dx < 0 ? 1 : -1)); }
  });
  stage.addEventListener('click', e => {
    if (moved) { moved = false; return; }
    const c = e.target.closest('.rv-card');
    if (c && c.dataset.p !== '0' && c.dataset.p !== 'hide') go(cards.indexOf(c));
  });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(a + 1);
    if (e.key === 'ArrowLeft') go(a - 1);
  });
  const sec = document.getElementById('reviews') || stage;
  ['mouseenter', 'focusin'].forEach(ev => sec.addEventListener(ev, stop));
  ['mouseleave', 'focusout'].forEach(ev => sec.addEventListener(ev, start));
  document.addEventListener('visibilitychange', start);
  render(); start();
})();


/* ---------- shine: a soft light sweep every 4 s on cards, forms, buttons and icons (all pages) ---------- */
(function () {
  const SEL = ['.stay-card', '.journey-card', '.info-cards article', '.guide-download', '.social-links a', '.bookingbar',
    '.full-link', '#searchBtn', '.gallery-item', '.ag-card', '.bk-main', '.bk-panel'].join(',');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const fx = e.target.querySelector(':scope > .shine-fx');
    if (fx) fx.classList.toggle('on', e.isIntersecting);
  }), {rootMargin: '80px'}) : null;
  let k = 0;
  function arm(node) {
    if (node.nodeType !== 1) return;
    const list = node.matches(SEL) ? [node] : [];
    node.querySelectorAll(SEL).forEach(h => list.push(h));
    list.forEach(h => {
      if (h.querySelector(':scope > .shine-fx')) return;
      if (getComputedStyle(h).position === 'static') h.style.position = 'relative';
      const fx = document.createElement('span');
      fx.className = 'shine-fx'; fx.setAttribute('aria-hidden', 'true');
      fx.style.setProperty('--sd', ((k++ % 6) * 0.25) + 's');
      h.appendChild(fx);
      io ? io.observe(h) : fx.classList.add('on');
    });
  }
  arm(document.body);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(arm))).observe(document.body, {childList: true, subtree: true});
})();


/* ---------- focus carousel: centre card big, tilted smaller neighbours, auto-slide (same feel as the reviews) ---------- */
function focusCarousel(stage, ctl) {
  if (!stage) return;
  if (stage._fc) stage._fc();                       // tear down a previous run (trip filters re-render the cards)
  const cards = [...stage.children].filter(c => c.matches('.stay-card, .journey-card')), n = cards.length;
  const host = stage.parentElement;
  if (n < 2) { stage.classList.remove('fc-stage'); stage.style.height = ''; if (ctl) ctl.hidden = true; return; }
  if (ctl) ctl.hidden = false;
  const ac = new AbortController(), opt = {signal: ac.signal};
  stage.classList.add('fc-stage'); stage.tabIndex = 0; host.classList.add('fc-host');
  cards.forEach(c => c.classList.add('fc-card'));
  const dotsEl = ctl && ctl.querySelector('.fc-dots'), many = n > 12;
  if (dotsEl) dotsEl.innerHTML = many ? '<span class="fc-count"></span>' : cards.map((c, i) => `<button type="button" aria-label="Show card ${i + 1}"></button>`).join('');
  const dots = dotsEl && !many ? [...dotsEl.children] : [], countEl = dotsEl && many ? dotsEl.firstChild : null;
  let a = 0, timer = null, moved = false, sx = null;

  function size() {                       // every card gets the height of the tallest one
    stage.style.setProperty('--fc-bleed', (parseFloat(getComputedStyle(host).paddingLeft) || 0) + 'px');
    cards.forEach(c => { c.style.height = ''; });
    const h = Math.max(...cards.map(c => c.offsetHeight));
    cards.forEach(c => { c.style.height = h + 'px'; });
    stage.style.height = Math.round(h * 1.1 + 70) + 'px';
  }
  function render() {
    cards.forEach((c, i) => {
      let d = ((i - a) % n + n) % n;
      if (d > n / 2) d -= n;
      c.style.setProperty('--o', Math.max(-3, Math.min(3, d)));
      c.dataset.p = Math.abs(d) <= 2 ? d : 'hide';
      c.setAttribute('aria-hidden', d !== 0);
      c.querySelectorAll('button,a').forEach(b => { b.tabIndex = d === 0 ? 0 : -1; });
    });
    dots.forEach((b, i) => b.setAttribute('aria-current', i === a));
    if (countEl) countEl.textContent = String(a + 1).padStart(2, '0') + ' / ' + n;
  }
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
    timer = setInterval(() => go(a + 1), 4200);
  };
  function go(k) { a = ((k % n) + n) % n; render(); start(); }
  stage._fc = () => { ac.abort(); stop(); };

  if (ctl) {
    ctl.querySelector('[data-fc="prev"]').addEventListener('click', () => go(a - 1), opt);
    ctl.querySelector('[data-fc="next"]').addEventListener('click', () => go(a + 1), opt);
    if (dotsEl) dotsEl.addEventListener('click', e => { const i = dots.indexOf(e.target.closest('button')); if (i > -1) go(i); }, opt);
  }
  stage.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; }, opt);
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { moved = true; go(a + (dx < 0 ? 1 : -1)); }
  }, opt);
  // capture phase: a click on a side card brings it to the front instead of opening it
  stage.addEventListener('click', e => {
    if (moved) { moved = false; e.stopPropagation(); e.preventDefault(); return; }
    const c = e.target.closest('.fc-card');
    if (c && c.dataset.p !== '0') { e.stopPropagation(); e.preventDefault(); if (c.dataset.p !== 'hide') go(cards.indexOf(c)); }
  }, {signal: ac.signal, capture: true});
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(a + 1);
    if (e.key === 'ArrowLeft') go(a - 1);
  }, opt);
  [stage, ctl].filter(Boolean).forEach(el => {
    ['mouseenter', 'focusin'].forEach(ev => el.addEventListener(ev, stop, opt));
    ['mouseleave', 'focusout'].forEach(ev => el.addEventListener(ev, start, opt));
  });
  document.addEventListener('visibilitychange', start, opt);
  window.addEventListener('resize', size, opt);
  window.addEventListener('load', size, opt);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!ac.signal.aborted) size(); });
  size(); render(); start();
}


/* ---------- booking flow: the 3 steps sit in one row (front-big carousel look); the next step comes forward by itself ---------- */
(function () {
  const IDS = ['#bookingModal', '#reviewModal', '#receiptModal'];
  const mods = IDS.map(i => $(i));
  if (mods.some(m => !m)) return;
  const LABELS = ['Your details', 'Review', 'Receipt'];
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const brand = mods[0].querySelector('.bk-brand');
  const flow = document.createElement('div');
  flow.id = 'bookFlow'; flow.className = 'bk-flow'; flow.setAttribute('aria-hidden', 'true');
  flow.innerHTML = '<div class="bk-flowbar"><span class="bk-flowbrand"></span><ol class="bk-steps" aria-label="Booking steps">'
    + LABELS.map((t, i) => `<li><b>${i + 1}</b><span>${t}</span></li>`).join('')
    + '</ol><button type="button" class="bk-back" data-close>Close \u00d7</button></div><div class="bk-flowstage"></div>';
  if (brand) flow.querySelector('.bk-flowbrand').appendChild(brand.cloneNode(true));
  const stage = flow.querySelector('.bk-flowstage');
  document.body.appendChild(flow);
  mods.forEach((m, i) => { m.dataset.label = (i + 1) + ' \u00b7 ' + LABELS[i]; stage.appendChild(m); });
  const lis = [...flow.querySelectorAll('.bk-steps li')];
  let hideTimer = null, step = -1;

  function setStep(s) {
    const changed = s !== step; step = s;
    mods.forEach((m, i) => {
      const d = i - s;
      m.style.setProperty('--o', d); m.dataset.p = d;
      m.setAttribute('aria-hidden', d !== 0); m.inert = d !== 0;
      if (d === 0 && changed) { const sh = m.querySelector('.bk-sheet'); if (sh) sh.scrollTop = 0; }
    });
    lis.forEach((li, i) => {
      li.classList.toggle('is-done', i < s); li.classList.toggle('is-active', i === s);
      li.querySelector('b').innerHTML = i < s ? CHECK : String(i + 1);
      if (i === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }
  function show(i) {
    clearTimeout(hideTimer);
    flow.classList.add('open'); flow.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('bk-lock');
    setStep(i);
  }
  function hide() {
    flow.classList.remove('open'); flow.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('bk-lock');
    step = -1;
    mods.forEach(m => { m.classList.remove('open'); m.removeAttribute('data-p'); m.inert = false; });
  }
  const _open = openModal, _close = closeModal;
  // opening a step brings its card to the front; closing one only hides the flow if no other step opens right after
  openModal = function (id) { const i = IDS.indexOf(id); _open(id); if (i > -1) show(i); };
  closeModal = function (id) { const i = IDS.indexOf(id); _close(id); if (i > -1) { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 0); } };

  flow.addEventListener('click', e => {
    if (!e.target.closest('[data-close]')) return;
    e.stopPropagation(); e.preventDefault();
    IDS.forEach(id => _close(id)); hide();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && flow.classList.contains('open')) { IDS.forEach(id => _close(id)); hide(); }
  });
})();


/* ---------- "Not just a stay" video: starts when it scrolls into view, pauses when it leaves (saves data and battery) ---------- */
(function () {
  const v = $('.planner-video');
  if (!v) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;   // poster only
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), {threshold: .2}).observe(v);
})();
