/* Shared site footer (brand.html style).
   Include with <script src="/assets/footer.js"></script> just before </body>.
   Optional: data-note="..." adds a small disclaimer line above the copyright. */
(function () {
  // Pages embedded in the homepage iframes don't need their own footer.
  if (window.self !== window.top) return;

  var LINKS = [
    { label: 'Main Site', href: '/' },
    { label: 'Discord', href: 'https://discord.gg/DyHTs5GDkc' },
    { label: 'Twitter/X', href: 'https://x.com/Collectors_Envy' },
    { label: 'Instagram', href: 'https://instagram.com/collectorsenvy' },
    { label: 'Merch', href: 'https://merch.collectorsenvy.com' }
  ];

  var css = '\
.ce-footer{margin-top:6rem;padding:4rem 2rem;border-top:1px solid #222;text-align:center;background:#000;font-family:"Inter",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}\
.ce-footer *{box-sizing:border-box;margin:0;padding:0}\
.ce-footer-links{display:flex;justify-content:center;gap:2rem;margin-bottom:2rem;flex-wrap:wrap}\
.ce-footer-links a{color:#a1a1a1;text-decoration:none;font-size:.9rem;transition:color .2s}\
.ce-footer-links a:hover{color:#fff}\
.ce-footer p{font-size:.8rem;color:#a1a1a1}\
.ce-footer .ce-footer-note{max-width:640px;margin:0 auto 1rem}';

  var s = document.currentScript;
  var note = s && s.getAttribute('data-note');
  var html = '<footer class="ce-footer"><div class="ce-footer-links">' +
    LINKS.map(function (l) {
      var ext = /^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + l.href + '"' + ext + '>' + l.label + '</a>';
    }).join('') + '</div>' +
    (note ? '<p class="ce-footer-note"></p>' : '') +
    '<p>© ' + new Date().getFullYear() + ' Collectors Envy. All rights reserved.</p></footer>';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var holder = document.createElement('div');
  holder.innerHTML = html;
  var el = holder.firstChild;
  if (note) el.querySelector('.ce-footer-note').textContent = note;
  if (s && s.parentNode) s.parentNode.insertBefore(el, s); else document.body.appendChild(el);
})();
