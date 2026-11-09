/* ==========================================================================
   GreenCorner – plant-list.js
   "My Plant List": visitors save plants and supplies they're interested in,
   then compare where to buy each one. Stored in localStorage (this browser
   only). Replaces a shopping cart – GreenCorner does not sell products.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const GC = window.GC;
  const A = window.GCAnalytics || { track() {}, toItem() { return {}; } };
  const { $, $$, esc, icon, toast, productUrl } = GC.ui;
  const STORAGE_KEY = 'greencorner_plant_list_v1';

  /* ---------------- Storage (fails safely in private mode) ---------------- */
  function getList() {
    try {
      const ids = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(ids) ? ids.filter((id) => GC.getProduct(id)) : [];
    } catch (e) { return []; }
  }
  function saveList(ids) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) { /* storage unavailable */ }
    render();
    document.dispatchEvent(new CustomEvent('gc:list-updated', { detail: { ids } }));
  }
  const has = (id) => getList().includes(id);

  /* ---------------- Actions ---------------- */
  function add(id) {
    const p = GC.getProduct(id);
    if (!p || has(id)) return;
    saveList(getList().concat(id));
    bumpBadge();
    A.track('add_to_wishlist', { items: [A.toItem(p)] });
    toast(p.name + ' saved to your plant list', { icon: 'heart', actionLabel: 'View list', onAction: open });
  }

  function remove(id, silent) {
    const list = getList();
    const index = list.indexOf(id);
    if (index < 0) return;
    const p = GC.getProduct(id);
    list.splice(index, 1);
    saveList(list);
    A.track('remove_from_wishlist', { items: [A.toItem(p)] });
    if (!silent) toast(p.name + ' removed', { icon: 'trash', actionLabel: 'Undo', onAction: () => { const l = getList(); l.splice(index, 0, id); saveList(l); } });
  }

  function toggle(id) { if (has(id)) remove(id); else add(id); }

  /** Plain-text version of the list for copying or sharing. */
  function listAsText() {
    const lines = getList().map((id, i) => {
      const p = GC.getProduct(id);
      return (i + 1) + '. ' + p.name + ' – ' + GC.SITE_URL + 'product.html?id=' + encodeURIComponent(id);
    });
    return 'My GreenCorner plant list:\n' + lines.join('\n');
  }

  /* ---------------- Drawer UI ---------------- */
  let drawer, overlay, lastFocus;

  function buildUI() {
    overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.setAttribute('data-list-close', '');

    drawer = document.createElement('aside');
    drawer.className = 'list-drawer';
    drawer.id = 'list-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'list-title');
    drawer.innerHTML =
      '<div class="drawer-head"><h2 id="list-title">My plant list <span data-list-heading-count></span></h2>' +
        '<button type="button" class="icon-btn" data-list-close aria-label="Close plant list">' + icon('close') + '</button></div>' +
      '<p class="drawer-intro">Save picks here, then compare where to buy each one.</p>' +
      '<div class="drawer-body" data-list-items></div>' +
      '<div class="drawer-foot" data-list-foot>' +
        '<div class="list-actions">' +
          '<button type="button" class="btn btn-primary" data-list-copy>' + icon('check') + '<span>Copy list</span></button>' +
          '<a class="btn btn-outline" data-list-share target="_blank" rel="noopener">' + icon('external') + '<span>Share on WhatsApp</span></a>' +
        '</div>' +
        '<button type="button" class="remove-btn" data-list-clear>Clear list</button>' +
        '<p class="demo-note">Saved in this browser only. GreenCorner doesn’t sell products — store links open each store’s search results.</p>' +
      '</div>';
    document.body.append(overlay, drawer);
  }

  function render() {
    const ids = getList();
    // Header badge + every Save button on the page.
    $$('[data-list-count]').forEach((el) => { el.textContent = ids.length; el.classList.toggle('has-items', ids.length > 0); });
    $$('.js-list-open').forEach((b) => b.setAttribute('aria-label', 'Open my plant list, ' + ids.length + (ids.length === 1 ? ' item' : ' items')));
    updateButtons(ids, true);
    if (!drawer) return;

    $('[data-list-heading-count]', drawer).textContent = ids.length ? '(' + ids.length + ')' : '';
    const itemsEl = $('[data-list-items]', drawer);
    const foot = $('[data-list-foot]', drawer);
    if (!ids.length) {
      foot.hidden = true;
      itemsEl.innerHTML = '<div class="list-empty">' + icon('heart') + '<h3>Your plant list is empty</h3><p class="muted">Tap “Save” on any pick to keep it here — or let the Plant Finder suggest plants for your space.</p>' +
        '<div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="' + rootPath('shop.html') + '">Browse picks</a><a class="btn btn-outline" href="' + rootPath('plant-finder.html') + '">Plant Finder</a></div></div>';
      return;
    }
    foot.hidden = false;
    itemsEl.innerHTML = ids.map((id) => {
      const p = GC.getProduct(id);
      const cat = GC.getCategory(p.category);
      const stores = GC.storeLinks(p).map((s) =>
        '<a class="store-chip" href="' + esc(s.url) + '" target="_blank" rel="noopener" data-store-link="' + s.id + '" data-item="' + esc(p.id) + '" data-location="plant_list">' + esc(s.name) + '<span class="visually-hidden"> (opens in a new tab)</span></a>').join('');
      return '<div class="list-item" data-id="' + esc(p.id) + '">' +
        '<a href="' + productUrl(p.id) + '"><img src="' + GC.imageUrl(p.photoId, 200) + '" alt="' + esc(p.alt) + '" width="76" height="84" loading="lazy"></a>' +
        '<div><span class="list-cat">' + esc(cat ? cat.name : '') + '</span>' +
          '<h3><a href="' + productUrl(p.id) + '">' + esc(p.name) + '</a></h3>' +
          '<div class="store-chips" aria-label="Where to buy ' + esc(p.name) + '">' + stores + '</div>' +
          '<button type="button" class="remove-btn" data-list-remove aria-label="Remove ' + esc(p.name) + ' from my plant list">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
    $('[data-list-share]', drawer).href = 'https://wa.me/?text=' + encodeURIComponent(listAsText());
  }

  const rootPath = (path) => (document.body.getAttribute('data-root') || '') + path;

  function bumpBadge() {
    $$('[data-list-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }

  /* ---------------- Open / close with focus management ---------------- */
  function open() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('[data-list-close].icon-btn', drawer).focus(), 50);
    A.track('view_plant_list', { items_count: getList().length });
  }

  function close() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapFocus(e) {
    const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }

  /* ---------------- Event delegation ---------------- */
  function bindEvents() {
    document.addEventListener('click', (e) => {
      const saveBtn = e.target.closest('[data-save-item]');
      if (saveBtn) { toggle(saveBtn.getAttribute('data-save-item')); return; }
      if (e.target.closest('.js-list-open')) { e.preventDefault(); open(); return; }
      if (e.target.closest('[data-list-close]')) { close(); return; }
      if (e.target.closest('[data-list-remove]')) { remove(e.target.closest('.list-item').getAttribute('data-id')); return; }
      if (e.target.closest('[data-list-clear]')) {
        const before = getList();
        saveList([]);
        toast('Plant list cleared', { icon: 'trash', actionLabel: 'Undo', onAction: () => saveList(before) });
        return;
      }
      if (e.target.closest('[data-list-copy]')) {
        const text = listAsText();
        const done = () => toast('List copied – paste it anywhere');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Copy not available in this browser', { icon: 'info' }));
        else toast('Copy not available in this browser', { icon: 'info' });
        A.track('share_plant_list', { method: 'copy', items_count: getList().length });
        return;
      }
      if (e.target.closest('[data-list-share]')) A.track('share_plant_list', { method: 'whatsapp', items_count: getList().length });
    });
    document.addEventListener('keydown', (e) => {
      if (!drawer || !drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') trapFocus(e);
    });
    // Keep several open tabs in sync.
    window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) render(); });
    // Re-sync Save buttons whenever product cards are re-rendered (filters, finder, related picks).
    new MutationObserver(() => syncButtons()).observe(document.body, { childList: true, subtree: true });
  }

  /** Show each Save button as saved / not saved. Big buttons (product page) use longer labels. */
  function updateButtons(ids, force) {
    $$('[data-save-item]').forEach((btn) => {
      const saved = ids.includes(btn.getAttribute('data-save-item'));
      if (!force && btn.getAttribute('aria-pressed') === String(saved)) return;
      btn.setAttribute('aria-pressed', String(saved));
      btn.classList.toggle('is-saved', saved);
      const label = btn.querySelector('span');
      const long = btn.classList.contains('btn-block');
      if (label) label.textContent = saved ? (long ? 'Saved to my plant list' : 'Saved') : (long ? 'Save to my plant list' : 'Save');
    });
  }

  /** Re-sync Save buttons after cards are re-rendered (batched to one call per frame). */
  let syncQueued = false;
  function syncButtons() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => { syncQueued = false; updateButtons(getList(), false); });
  }

  function init() { buildUI(); bindEvents(); render(); }

  window.GCPlantList = { add, remove, toggle, getList, open, close };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
