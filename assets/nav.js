/* Shared site navigation (brand.html style).
   Add a page by editing LINKS below; include with <script src="/assets/nav.js"></script> at the top of <body>. */
(function () {
  // Pages embedded in the homepage iframes don't need their own nav.
  if (window.self !== window.top) return;

  var LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events.html' },
    { label: 'Auctions', href: '/auction.html' },
    { label: 'Museum', href: '/museum.html' },
    { label: 'Proxy', href: '/proxy.html' },
    { label: 'Brand', href: '/brand.html' },
    { label: 'Files', href: 'https://drive.google.com/drive/u/0/folders/1iInTxulTKqZtXiK5bDEzIN_nMcN5tRb9' },
    { label: 'Archives', href: 'https://archive.collectorsenvy.com/public/collections/1' },
  ];
  var DISCORD = 'https://discord.gg/DyHTs5GDkc';

  var path = location.pathname.replace(/\/index\.html$/, '/');
  if (path.length > 1) path = path.replace(/\/$/, '');
  function isActive(l) {
    var hrefs = [l.href].concat((l.children || []).map(function (c) { return c.href; }));
    return hrefs.indexOf(path) !== -1;
  }

  var css = '\
.ce-nav{position:sticky;top:0;z-index:90;background:rgba(0,0,0,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid #222;font-family:"Inter",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;text-align:left}\
.ce-nav *{box-sizing:border-box;margin:0;padding:0}\
.ce-nav-inner{max-width:1400px;margin:0 auto;height:60px;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem}\
.ce-nav-logo{font-weight:800;font-size:1.2rem;text-transform:uppercase;letter-spacing:-1px;color:#fff;text-decoration:none;white-space:nowrap}\
.ce-nav-menu{display:flex;align-items:center;gap:.25rem;list-style:none}\
.ce-nav-menu>li{position:relative}\
.ce-nav-menu a{display:block;color:#a1a1a1;text-decoration:none;font-size:.85rem;font-weight:600;padding:8px 12px;border-radius:6px;transition:color .2s,background .2s}\
.ce-nav-menu a:hover,.ce-nav-menu a:focus-visible{color:#fff;background:#111}\
.ce-nav-menu a[aria-current="page"]{color:#fff}\
.ce-nav-menu a[aria-current="page"]{position:relative}\
.ce-nav-menu a[aria-current="page"]::after{content:"";position:absolute;left:12px;right:12px;bottom:2px;height:2px;background:#00ff88;border-radius:2px}\
.ce-nav-sub{display:none;position:absolute;top:100%;left:0;min-width:170px;background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:6px;list-style:none}\
.ce-nav-menu li:hover>.ce-nav-sub,.ce-nav-menu li:focus-within>.ce-nav-sub{display:block}\
.ce-nav-sub a{white-space:nowrap}\
.ce-nav-cta{background:#fff!important;color:#000!important;margin-left:.5rem}\
.ce-nav-cta:hover{opacity:.9;background:#fff!important}\
.ce-nav-toggle{display:none;background:none;border:1px solid #222;border-radius:6px;width:40px;height:40px;cursor:pointer;align-items:center;justify-content:center;color:#fff}\
.ce-nav-toggle svg{width:20px;height:20px}\
@media (max-width:860px){\
.ce-nav-inner{padding:0 1rem}\
.ce-nav-toggle{display:inline-flex}\
.ce-nav-menu{display:none;position:absolute;top:60px;left:0;right:0;flex-direction:column;align-items:stretch;gap:0;background:#000;border-bottom:1px solid #222;padding:.5rem 1rem 1rem;max-height:calc(100vh - 60px);overflow-y:auto}\
.ce-nav.open .ce-nav-menu{display:flex}\
.ce-nav-menu a{padding:12px;font-size:.95rem}\
.ce-nav-menu a[aria-current="page"]::after{display:none}\
.ce-nav-menu a[aria-current="page"]{background:#111}\
.ce-nav-sub{display:block;position:static;border:none;background:none;padding:0 0 0 12px;min-width:0}\
.ce-nav-cta{margin:.5rem 0 0;text-align:center}\
}';

  function item(l) {
    var cur = isActive(l) ? ' aria-current="page"' : '';
    var sub = '';
    if (l.children) {
      sub = '<ul class="ce-nav-sub">' + l.children.map(function (c) {
        return '<li><a href="' + c.href + '"' + (c.href === path ? ' aria-current="page"' : '') + '>' + c.label + '</a></li>';
      }).join('') + '</ul>';
      // Parent of a dropdown only highlights; the children are the destinations.
      return '<li><a href="' + l.href + '"' + cur + '>' + l.label + '</a>' + sub + '</li>';
    }
    return '<li><a href="' + l.href + '"' + cur + '>' + l.label + '</a></li>';
  }

  var html = '<nav class="ce-nav" aria-label="Main"><div class="ce-nav-inner">' +
    '<a href="/" class="ce-nav-logo">Collectors Envy</a>' +
    '<button class="ce-nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>' +
    '<ul class="ce-nav-menu">' + LINKS.map(item).join('') +
    '<li><a class="ce-nav-cta" href="' + DISCORD + '" target="_blank" rel="noopener">Join Discord</a></li></ul>' +
    '</div></nav>';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var s = document.currentScript;
  var holder = document.createElement('div');
  holder.innerHTML = html;
  var nav = holder.firstChild;
  if (s && s.parentNode) s.parentNode.insertBefore(nav, s); else document.body.insertBefore(nav, document.body.firstChild);

  var btn = nav.querySelector('.ce-nav-toggle');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ce-nav-menu a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
})();
