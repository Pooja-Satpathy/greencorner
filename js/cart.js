/* ==========================================================================
   GreenCorner – cart.js
   Shopping cart stored in localStorage: add / update quantity / remove,
   coupon codes, totals with shipping, slide-out cart drawer and a demo
   checkout. No real payment is processed.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const GC = window.GC;
  const A = window.GCAnalytics || { track() {}, toItem() { return {}; } };
  const { $, $$, esc, icon, toast, productUrl } = GC.ui;

  const STORAGE_KEY = 'greencorner_cart_v1';
  const COUPON_KEY = 'greencorner_coupon_v1';
  const MAX_QTY = 20;
  const FREE_SHIPPING_MIN = 999;   // ₹ – orders at or above this ship free
  const SHIPPING_FEE = 79;         // ₹ – flat delivery fee below the threshold

  /** Sample promo codes used by the marketing banners. */
  const COUPONS = {
    GREEN10: { percent: 10, min: 0, label: '10% welcome discount' },
    WINTER15: { percent: 15, min: 999, label: 'Winter Garden Festival – 15% off' }
  };

  /* ---------------- Storage helpers (fail safely in private mode) ---------------- */
  function read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------------- Cart state ---------------- */
  /** Returns a cleaned list of {id, qty}, dropping unknown products. */
  function getCart() {
    const items = read(STORAGE_KEY, []);
    if (!Array.isArray(items)) return [];
    return items
      .filter((it) => it && GC.getProduct(it.id))
      .map((it) => ({ id: it.id, qty: Math.min(MAX_QTY, Math.max(1, parseInt(it.qty, 10) || 1)) }));
  }

  function saveCart(items) {
    write(STORAGE_KEY, items);
    render();
    document.dispatchEvent(new CustomEvent('gc:cart-updated', { detail: { items } }));
  }

  /** Add a product (or increase its quantity). */
  function addItem(id, qty = 1) {
    const p = GC.getProduct(id);
    if (!p) return;
    const items = getCart();
    const line = items.find((it) => it.id === id);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
    else items.push({ id, qty: Math.min(MAX_QTY, qty) });
    saveCart(items);
    bumpBadge();
    A.track('add_to_cart', { currency: 'INR', value: p.price * qty, items: [A.toItem(p, qty)] });
    toast(p.name + ' added to your cart', { icon: 'bag', actionLabel: 'View cart', onAction: open });
  }

  /** Set an exact quantity; 0 removes the line. */
  function setQty(id, qty) {
    if (qty <= 0) { removeItem(id); return; }
    const items = getCart();
    const line = items.find((it) => it.id === id);
    if (!line) return;
    line.qty = Math.min(MAX_QTY, qty);
    saveCart(items);
  }

  function removeItem(id) {
    const items = getCart();
    const line = items.find((it) => it.id === id);
    const p = GC.getProduct(id);
    saveCart(items.filter((it) => it.id !== id));
    if (line && p) {
      A.track('remove_from_cart', { currency: 'INR', value: p.price * line.qty, items: [A.toItem(p, line.qty)] });
      toast(p.name + ' removed', { icon: 'trash', actionLabel: 'Undo', onAction: () => { const list = getCart(); list.push(line); saveCart(list); } });
    }
  }

  function clearCart() { saveCart([]); }

  /* ---------------- Coupons & totals ---------------- */
  function getCoupon() {
    const code = read(COUPON_KEY, '');
    return COUPONS[code] ? code : '';
  }

  function applyCoupon(raw) {
    const code = String(raw || '').trim().toUpperCase();
    if (!code) return { ok: false, msg: 'Enter a coupon code.' };
    if (!COUPONS[code]) return { ok: false, msg: '“' + code + '” is not a valid code. Try GREEN10.' };
    write(COUPON_KEY, code);
    A.track('coupon_applied', { coupon: code });
    render();
    return { ok: true, msg: COUPONS[code].label + ' applied.' };
  }

  function removeCoupon() { write(COUPON_KEY, ''); render(); }

  /** Calculate subtotal, discount, shipping and grand total in rupees. */
  function getTotals() {
    const items = getCart();
    const lines = items.map((it) => {
      const p = GC.getProduct(it.id);
      return { product: p, qty: it.qty, total: p.price * it.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const code = getCoupon();
    const coupon = code ? COUPONS[code] : null;
    const couponActive = !!coupon && subtotal >= coupon.min && subtotal > 0;
    const discount = couponActive ? Math.round((subtotal * coupon.percent) / 100) : 0;
    const afterDiscount = subtotal - discount;
    const shipping = subtotal === 0 || afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    return { lines, count, subtotal, code, coupon, couponActive, discount, shipping, total: afterDiscount + shipping };
  }

  /* ---------------- Drawer UI ---------------- */
  let drawer, overlay, modal, lastFocus;

  function buildUI() {
    overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.setAttribute('data-cart-close', '');

    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.id = 'cart-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'cart-title');
    drawer.innerHTML =
      '<div class="drawer-head"><h2 id="cart-title">Your cart <span data-cart-heading-count></span></h2>' +
        '<button type="button" class="icon-btn" data-cart-close aria-label="Close cart">' + icon('close') + '</button></div>' +
      '<div class="free-ship" data-free-ship aria-live="polite"></div>' +
      '<div class="drawer-body" data-cart-items></div>' +
      '<div class="drawer-foot" data-cart-foot>' +
        '<form class="coupon-form" data-coupon-form novalidate>' +
          '<label class="visually-hidden" for="coupon-input">Coupon code</label>' +
          '<input id="coupon-input" type="text" placeholder="Coupon code (try GREEN10)" autocomplete="off" maxlength="20">' +
          '<button class="btn btn-outline btn-sm" type="submit">Apply</button>' +
        '</form>' +
        '<p class="coupon-msg" data-coupon-msg aria-live="polite"></p>' +
        '<div class="totals" data-cart-totals></div>' +
        '<button type="button" class="btn btn-primary btn-block btn-lg" data-checkout>' + icon('shield') + '<span>Proceed to checkout</span></button>' +
        '<p class="demo-note">Demo store – no payment is taken and no order is placed.</p>' +
      '</div>';

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'checkout-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="modal-backdrop" data-modal-close></div>' +
      '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title" tabindex="-1">' +
        '<button type="button" class="icon-btn" data-modal-close aria-label="Close">' + icon('close') + '</button>' +
        '<span class="sample-label">Demo checkout</span>' +
        '<h2 id="checkout-title" class="mt-1">Thanks for trying GreenCorner!</h2>' +
        '<p class="muted">This is a demonstration e-commerce website created for a Digital Marketing project. No payment is processed, no order is created and no personal data is collected.</p>' +
        '<ul class="modal-summary" data-checkout-summary></ul>' +
        '<div class="hero-actions"><button type="button" class="btn btn-primary" data-finish-demo>Finish demo &amp; clear cart</button>' +
        '<button type="button" class="btn btn-outline" data-modal-close>Back to cart</button></div>' +
      '</div>';

    body().append(overlay, drawer, modal);

    // Coupon form.
    $('[data-coupon-form]', drawer).addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#coupon-input');
      const res = applyCoupon(input.value);
      const msg = $('[data-coupon-msg]', drawer);
      msg.textContent = res.msg;
      msg.className = 'coupon-msg ' + (res.ok ? 'ok' : 'err');
      if (res.ok) input.value = '';
    });

    $('[data-checkout]', drawer).addEventListener('click', openCheckout);
    $('[data-finish-demo]', modal).addEventListener('click', () => {
      A.track('demo_checkout_complete', { value: getTotals().total, currency: 'INR' });
      clearCart();
      removeCoupon();
      closeCheckout();
      close();
      toast('Demo complete – your cart has been cleared.');
    });
    $$('[data-modal-close]', modal).forEach((el) => el.addEventListener('click', closeCheckout));
  }

  function body() { return document.body; }

  /** Re-render badge, drawer contents and totals. */
  function render() {
    const t = getTotals();

    $$('[data-cart-count]').forEach((el) => {
      el.textContent = t.count > 99 ? '99+' : String(t.count);
      el.classList.toggle('has-items', t.count > 0);
    });
    $$('.js-cart-open').forEach((b) => b.setAttribute('aria-label', 'Open cart, ' + t.count + (t.count === 1 ? ' item' : ' items')));
    if (!drawer) return;

    $('[data-cart-heading-count]', drawer).textContent = t.count ? '(' + t.count + (t.count === 1 ? ' item)' : ' items)') : '';

    const freeShip = $('[data-free-ship]', drawer);
    const remaining = FREE_SHIPPING_MIN - (t.subtotal - t.discount);
    const progress = Math.min(100, Math.round(((t.subtotal - t.discount) / FREE_SHIPPING_MIN) * 100));
    freeShip.hidden = t.count === 0;
    freeShip.innerHTML = (remaining > 0
      ? 'Add <strong>' + GC.formatPrice(remaining) + '</strong> more for free delivery.'
      : '<strong>You’ve unlocked free delivery.</strong>') +
      '<div class="bar" aria-hidden="true"><span style="width:' + progress + '%"></span></div>';

    const itemsEl = $('[data-cart-items]', drawer);
    const foot = $('[data-cart-foot]', drawer);
    if (!t.lines.length) {
      itemsEl.innerHTML = '<div class="cart-empty">' + icon('sprout') + '<h3>Your cart is empty</h3><p class="muted">Find a plant that suits your space — or let our Plant Finder suggest one.</p>' +
        '<div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="' + rootPath('shop.html') + '">Shop plants</a><a class="btn btn-outline" href="' + rootPath('plant-finder.html') + '">Plant Finder</a></div></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    itemsEl.innerHTML = t.lines.map((l) => {
      const p = l.product;
      return '<div class="cart-item" data-id="' + esc(p.id) + '">' +
        '<a href="' + productUrl(p.id) + '"><img src="' + GC.imageUrl(p.photoId, 200) + '" alt="' + esc(p.alt) + '" width="76" height="84" loading="lazy"></a>' +
        '<div><h3><a href="' + productUrl(p.id) + '">' + esc(p.name) + '</a></h3>' +
          '<span class="unit">' + GC.formatPrice(p.price) + ' each</span>' +
          '<div class="controls">' +
            '<div class="qty-stepper" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
              '<button type="button" data-cart-dec aria-label="Decrease quantity of ' + esc(p.name) + '">−</button>' +
              '<span aria-live="polite">' + l.qty + '</span>' +
              '<button type="button" data-cart-inc aria-label="Increase quantity of ' + esc(p.name) + '"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<button type="button" class="remove-btn" data-cart-remove aria-label="Remove ' + esc(p.name) + ' from cart">Remove</button>' +
          '</div></div>' +
        '<div class="line-total">' + GC.formatPrice(l.total) + '</div>' +
      '</div>';
    }).join('');

    let couponRow = '';
    if (t.code) {
      couponRow = t.couponActive
        ? '<div class="discount"><span>Discount (' + esc(t.code) + ') <button type="button" class="remove-btn" data-remove-coupon>remove</button></span><span>−' + GC.formatPrice(t.discount) + '</span></div>'
        : '<div class="muted small"><span>' + esc(t.code) + ' needs a subtotal of ' + GC.formatPrice(t.coupon.min) + ' <button type="button" class="remove-btn" data-remove-coupon>remove</button></span><span>—</span></div>';
    }
    $('[data-cart-totals]', drawer).innerHTML =
      '<div><span>Subtotal</span><span>' + GC.formatPrice(t.subtotal) + '</span></div>' + couponRow +
      '<div><span>Delivery</span><span>' + (t.shipping ? GC.formatPrice(t.shipping) : 'Free') + '</span></div>' +
      '<div class="grand"><span>Total</span><span>' + GC.formatPrice(t.total) + '</span></div>';
  }

  function rootPath(path) { return (document.body.getAttribute('data-root') || '') + path; }

  function bumpBadge() {
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }

  /* ---------------- Open / close with focus management ---------------- */
  function open() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('[data-cart-close].icon-btn', drawer).focus(), 50);
    const t = getTotals();
    A.track('view_cart', { currency: 'INR', value: t.total, items: t.lines.map((l) => A.toItem(l.product, l.qty)) });
  }

  function close() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openCheckout() {
    const t = getTotals();
    if (!t.lines.length) return;
    A.track('begin_checkout', { currency: 'INR', value: t.total, coupon: t.couponActive ? t.code : undefined, items: t.lines.map((l) => A.toItem(l.product, l.qty)) });
    $('[data-checkout-summary]', modal).innerHTML =
      t.lines.map((l) => '<li><span>' + esc(l.product.name) + ' × ' + l.qty + '</span><span>' + GC.formatPrice(l.total) + '</span></li>').join('') +
      (t.discount ? '<li><span>Discount (' + esc(t.code) + ')</span><span>−' + GC.formatPrice(t.discount) + '</span></li>' : '') +
      '<li><span>Delivery</span><span>' + (t.shipping ? GC.formatPrice(t.shipping) : 'Free') + '</span></li>' +
      '<li><strong>Total (demo)</strong><strong>' + GC.formatPrice(t.total) + '</strong></li>';
    modal.hidden = false;
    $('.modal-dialog', modal).focus();
  }

  function closeCheckout() { modal.hidden = true; $('[data-checkout]', drawer).focus(); }

  /** Keep keyboard focus inside the open drawer / modal. */
  function trapFocus(e, container) {
    const focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- Event delegation ---------------- */
  function bindEvents() {
    document.addEventListener('click', (e) => {
      // "Add to Cart" buttons anywhere on the site.
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        const qtySel = addBtn.getAttribute('data-qty-from');
        const qtyInput = qtySel ? document.querySelector(qtySel) : null;
        const qty = qtyInput ? Math.min(MAX_QTY, Math.max(1, parseInt(qtyInput.value, 10) || 1)) : 1;
        addItem(addBtn.getAttribute('data-add-to-cart'), qty);
        const label = addBtn.querySelector('span');
        if (label) {
          const original = label.textContent;
          addBtn.classList.add('is-added');
          label.textContent = 'Added';
          setTimeout(() => { addBtn.classList.remove('is-added'); label.textContent = original; }, 1400);
        }
        return;
      }
      if (e.target.closest('.js-cart-open')) { e.preventDefault(); open(); return; }
      if (e.target.closest('[data-cart-close]')) { close(); return; }
      if (e.target.closest('[data-remove-coupon]')) { removeCoupon(); $('[data-coupon-msg]', drawer).textContent = ''; return; }

      const line = e.target.closest('.cart-item');
      if (!line) return;
      const id = line.getAttribute('data-id');
      const current = (getCart().find((it) => it.id === id) || {}).qty || 0;
      if (e.target.closest('[data-cart-inc]')) setQty(id, current + 1);
      else if (e.target.closest('[data-cart-dec]')) setQty(id, current - 1);
      else if (e.target.closest('[data-cart-remove]')) removeItem(id);
    });

    document.addEventListener('keydown', (e) => {
      const modalOpen = modal && !modal.hidden;
      if (e.key === 'Escape') { if (modalOpen) closeCheckout(); else close(); }
      if (e.key === 'Tab') {
        if (modalOpen) trapFocus(e, $('.modal-dialog', modal));
        else if (drawer && drawer.classList.contains('is-open')) trapFocus(e, drawer);
      }
    });

    // Keep several open tabs in sync.
    window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY || e.key === COUPON_KEY) render(); });
  }

  function init() {
    buildUI();
    bindEvents();
    render();
  }

  window.GCCart = { add: addItem, setQty, remove: removeItem, clear: clearCart, getCart, getTotals, applyCoupon, open, close };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
