/* Optional "show prices in" selector. Pages call CE_CUR.fmt(priceText) and re-render on the
   "cecurrency" event. Rates are approximate: fetched once a day from a free public rates feed,
   with built-in fallbacks if it can't be reached. */
(function () {
  var SYMBOL = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  var FALLBACK = { USD: 1, EUR: 0.92, GBP: 0.78, CAD: 1.37, AUD: 1.52 };
  var rates = FALLBACK, cur = 'USD';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (SYMBOL[get('ce-cur')]) cur = get('ce-cur');

  function fire() { try { window.dispatchEvent(new Event('cecurrency')); } catch (e) {} }
  function loadRates() {
    try {
      var c = JSON.parse(get('ce-fx') || 'null');
      if (c && c.rates && Date.now() - c.t < 864e5) { rates = c.rates; return; }
    } catch (e) {}
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    fetch('https://open.er-api.com/v6/latest/USD', ctl ? { signal: ctl.signal } : {})
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.rates) return;
        var r = {};
        Object.keys(SYMBOL).forEach(function (k) { r[k] = Number(j.rates[k]) > 0 ? Number(j.rates[k]) : FALLBACK[k]; });
        rates = r; put('ce-fx', JSON.stringify({ t: Date.now(), rates: r }));
        if (cur !== 'USD') fire();
      }).catch(function () {}).then(function () { clearTimeout(timer); });
  }

  var re = /\$\s?([\d,]+(?:\.\d+)?)/g;
  window.CE_CUR = {
    fmt: function (text) {
      var s = text == null ? '' : String(text);
      if (cur === 'USD' || !/\$\s?[\d]/.test(s)) return s;
      var conv = s.replace(re, function (m, n) {
        var v = parseFloat(n.replace(/,/g, '')) * rates[cur];
        return SYMBOL[cur] + Math.round(v).toLocaleString('en-US');
      });
      return s + ' (≈ ' + conv + ')';
    }
  };

  function mount() {
    var anchor = document.getElementById('gq') || document.getElementById('q');
    if (!anchor || !anchor.parentNode) return;
    var box = document.createElement('label');
    box.style.cssText = 'display:flex;align-items:center;gap:.5rem;color:#a1a1a1;font:600 .85rem Inter,sans-serif;margin:-.5rem 0 1rem';
    box.appendChild(document.createTextNode('Show prices in'));
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', 'Currency');
    sel.style.cssText = 'background:#000;color:#fff;border:1px solid #222;border-radius:8px;padding:.35rem .5rem;font:inherit';
    Object.keys(SYMBOL).forEach(function (k) {
      var o = document.createElement('option'); o.value = k; o.textContent = k; if (k === cur) o.selected = true; sel.appendChild(o);
    });
    sel.addEventListener('change', function () { cur = sel.value; put('ce-cur', cur); fire(); });
    box.appendChild(sel);
    var note = document.createElement('span');
    note.style.cssText = 'font-weight:400';
    note.textContent = 'Converted amounts are approximate.';
    box.appendChild(note);
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
  }
  loadRates();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
