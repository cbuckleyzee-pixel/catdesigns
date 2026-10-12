/* dc-lite: tiny standalone runtime for the portfolio pages.
   Reads the <x-dc> markup + the <script type="text/x-dc"> component on each page,
   resolves {{ bindings }}, wires event handlers, and re-renders on setState. */
(function () {
  'use strict';
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; this.__dc = null; }
    setState(s) {
      Object.assign(this.state, typeof s === 'function' ? s(this.state) : s);
      if (this.__dc) this.__dc.schedule();
    }
    forceUpdate() { if (this.__dc) this.__dc.schedule(); }
    renderVals() { return {}; }
  }
  window.DCLogic = DCLogic;

  const BIND = /\{\{\s*([\w.$]+)\s*\}\}/g;
  const lookup = (vals, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), vals);
  const fill = (tpl, vals) => tpl.replace(BIND, (_, p) => { const v = lookup(vals, p); return v == null || v === false ? '' : String(v); });

  function mount(root) {
    const scriptEl = document.querySelector('script[data-dc-script]');
    if (!scriptEl) return;
    // helmet -> head
    root.querySelectorAll('helmet').forEach((h) => {
      Array.from(h.children).forEach((c) => document.head.appendChild(c));
      h.remove();
    });
    const props = {};
    try {
      const d = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      Object.keys(d).forEach((k) => { if (k[0] !== '$' && d[k] && 'default' in d[k]) props[k] = d[k].default; });
    } catch (e) {}
    const Component = new Function('DCLogic', scriptEl.textContent + '\n;return Component;')(DCLogic);
    const logic = new Component(props);

    // collect bindings
    const attrB = [], textB = [], evB = [];
    const walk = (el) => {
      Array.from(el.attributes).forEach((a) => {
        if (a.value.indexOf('{{') < 0) return;
        if (/^on/i.test(a.name)) {
          const m = /\{\{\s*([\w.$]+)\s*\}\}/.exec(a.value);
          if (m) evB.push({ el, ev: a.name.slice(2).toLowerCase(), key: m[1] });
          el.removeAttribute(a.name);
        } else attrB.push({ el, name: a.name, tpl: a.value });
      });
      Array.from(el.childNodes).forEach((n) => {
        if (n.nodeType === 3 && n.nodeValue.indexOf('{{') >= 0) textB.push({ n, tpl: n.nodeValue });
        else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
    let latest = {};
    evB.forEach((b) => {
      const opts = b.ev === 'wheel' || b.ev.indexOf('touch') === 0 ? { passive: false } : false;
      b.el.addEventListener(b.ev, (e) => { const f = lookup(latest, b.key); if (typeof f === 'function') return f.call(logic, e); }, opts);
    });
    const last = new Map();
    const render = () => {
      latest = logic.renderVals() || {};
      attrB.forEach((b) => { const v = fill(b.tpl, latest); if (last.get(b) !== v) { last.set(b, v); b.el.setAttribute(b.name, v); } });
      textB.forEach((b) => { const v = fill(b.tpl, latest); if (last.get(b) !== v) { last.set(b, v); b.n.nodeValue = v; } });
    };
    let queued = false;
    const ctl = { schedule() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; render(); }); } };
    logic.__dc = ctl;
    render();
    if (typeof logic.componentDidMount === 'function') logic.componentDidMount();
    render();
    window.addEventListener('pagehide', () => { try { logic.componentWillUnmount && logic.componentWillUnmount(); } catch (e) {} });
  }
  const go = () => { const r = document.querySelector('x-dc'); if (r) mount(r); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
