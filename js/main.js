/* ==========================================================================
   GreenCorner – main.js
   Shared UI helpers + page controllers (home, shop, product, contact).
   Load order on every page:
     analytics.js → products.js → main.js → plant-list.js → (page-specific script)
   ========================================================================== */
(function (window, document) {
  'use strict';

  const GC = (window.GC = window.GC || {});
  const A = window.GCAnalytics || { track() {}, toItem() { return {}; } };
  const body = document.body;
  const ROOT = body.getAttribute('data-root') || '';
  const PAGE = body.getAttribute('data-page') || '';

  /* ------------------------------------------------------------------
     1. Small utilities
     ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /** Escape text before inserting it into HTML (prevents XSS from user input). */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Return an inline SVG icon from the shared icon set in products.js. */
  function icon(name, extraClass) {
    const inner = (GC.icons && GC.icons[name]) || '';
    return '<svg class="' + (extraClass || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const productUrl = (id) => ROOT + 'product.html?id=' + encodeURIComponent(id);
  const guideUrl = (slug) => ROOT + 'guides/' + slug + '.html';
  const shopUrl = (category) => ROOT + 'shop.html' + (category ? '?category=' + encodeURIComponent(category) : '');

  /** Accessible toast notifications (announced by screen readers). */
  let toastRegion;
  function toast(message, opts = {}) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      body.appendChild(toastRegion);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(opts.icon || 'checkCircle') + '<span>' + esc(message) + '</span>';
    if (opts.actionLabel && typeof opts.onAction === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opts.actionLabel;
      btn.addEventListener('click', () => { opts.onAction(); remove(); });
      el.appendChild(btn);
    }
    toastRegion.appendChild(el);
    function remove() {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 320);
    }
    setTimeout(remove, opts.duration || 3200);
  }

  /* ------------------------------------------------------------------
     2. Product card (used on home, shop, product, finder & guide pages)
     ------------------------------------------------------------------ */
  function productCard(p, opts = {}) {
    const cat = GC.getCategory(p.category);
    const listName = opts.listName || 'Product list';
    const extra = opts.extraHtml || '';
    const stores = GC.storeLinks(p).map((s) => s.name);
    return (
      '<article class="product-card">' +
        '<a class="product-card__media" href="' + productUrl(p.id) + '" data-product-link="' + esc(p.id) + '" data-list="' + esc(listName) + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + GC.imageUrl(p.photoId, 600) + '" srcset="' + GC.imageUrl(p.photoId, 400) + ' 400w, ' + GC.imageUrl(p.photoId, 600) + ' 600w, ' + GC.imageUrl(p.photoId, 900) + ' 900w" sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 300px" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" width="600" height="660">' +
          '<span class="product-card__badges">' +
            (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '<span></span>') +
            (opts.matchLabel ? '<span class="match-badge">' + esc(opts.matchLabel) + '</span>' : '') +
          '</span>' +
          '<span class="product-card__quick">Care info &amp; where to buy</span>' +
        '</a>' +
        '<div class="product-card__body">' +
          '<p class="product-card__cat">' + esc(cat ? cat.name : '') + '</p>' +
          '<h3 class="product-card__title"><a href="' + productUrl(p.id) + '" data-product-link="' + esc(p.id) + '" data-list="' + esc(listName) + '">' + esc(p.name) + '</a></h3>' +
          '<p class="product-card__desc">' + esc(p.short) + '</p>' +
          extra +
          '<p class="card-stores" title="' + esc(stores.join(', ')) + '">' + icon('bag') + '<span>Compare at ' + stores.length + ' stores</span></p>' +
          '<div class="product-card__actions">' +
            '<a class="btn btn-primary" href="' + productUrl(p.id) + '#where-to-buy" data-product-link="' + esc(p.id) + '" data-list="' + esc(listName) + '" aria-label="Where to buy ' + esc(p.name) + '">Where to buy</a>' +
            '<button class="btn btn-outline btn-save" type="button" data-save-item="' + esc(p.id) + '" aria-pressed="false" aria-label="Save ' + esc(p.name) + ' to my plant list">' + icon('heart') + '<span>Save</span></button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /** Render a list of products into a grid and send a GA4 view_item_list event. */
  function renderProducts(container, list, opts = {}) {
    if (!container) return;
    container.innerHTML = list.map((p) => productCard(p, opts)).join('');
    if (list.length && opts.listName) {
      A.track('view_item_list', {
        item_list_name: opts.listName,
        items: list.slice(0, 20).map((p, i) => Object.assign(A.toItem(p), { index: i }))
      });
    }
  }

  GC.ui = { $, $$, esc, icon, debounce, toast, productCard, renderProducts, productUrl, guideUrl, shopUrl };

  /* ------------------------------------------------------------------
     3. Global UI: header, mobile nav, search, reveal, image fallback
     ------------------------------------------------------------------ */
  function initHeader() {
    const header = $('.site-header');
    const nav = $('#main-nav');
    const toggle = $('.js-nav-toggle');
    const overlay = $('.nav-overlay');
    const searchToggle = $('.js-search-toggle');
    const searchPanel = $('#header-search');

    // Add a subtle border/shadow once the page scrolls.
    const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile navigation (off-canvas panel).
    function setNav(open) {
      if (!nav || !toggle) return;
      nav.classList.toggle('is-open', open);
      overlay && overlay.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = icon(open ? 'close' : 'menu');
      body.classList.toggle('no-scroll', open);
      if (open) { const first = $('a', nav); first && first.focus(); }
    }
    toggle && toggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
    overlay && overlay.addEventListener('click', () => setNav(false));
    nav && $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
    window.addEventListener('resize', debounce(() => { if (window.innerWidth > 960) setNav(false); }, 150));

    // Header search panel.
    searchToggle && searchToggle.addEventListener('click', () => {
      const open = searchPanel.hasAttribute('hidden');
      if (open) searchPanel.removeAttribute('hidden'); else searchPanel.setAttribute('hidden', '');
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open) $('input', searchPanel).focus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (nav && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
      if (searchPanel && !searchPanel.hasAttribute('hidden')) {
        searchPanel.setAttribute('hidden', '');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.focus();
      }
    });
  }

  /** Fade/slide sections in as they enter the viewport. */
  function initReveal() {
    const els = $$('.reveal, .reveal-stagger');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /** If a remote photo fails to load, show a local placeholder instead. */
  function initImageFallback() {
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.removeAttribute('srcset');
      img.src = ROOT + 'images/placeholder.svg';
    }, true);
  }

  /** Track product link clicks as GA4 select_item, and store links as where_to_buy_click. */
  function initSelectItemTracking() {
    document.addEventListener('click', (e) => {
      const store = e.target.closest('[data-store-link]');
      if (store) {
        const item = GC.getProduct(store.getAttribute('data-item'));
        A.track('where_to_buy_click', {
          store: store.getAttribute('data-store-link'), item_id: item ? item.id : '', item_name: item ? item.name : '',
          link_location: store.getAttribute('data-location') || PAGE, link_url: store.href, outbound: true
        });
        return;
      }
      const link = e.target.closest('[data-product-link]');
      if (!link) return;
      const p = GC.getProduct(link.getAttribute('data-product-link'));
      if (p) A.track('select_item', { item_list_name: link.getAttribute('data-list') || '', items: [A.toItem(p)] });
    });
  }

  /** Promotion banners: GA4 view_promotion / select_promotion events. */
  function initPromotions() {
    const promos = $$('[data-promo-id]');
    if (!promos.length) return;
    const data = (el) => ({ promotion_id: el.dataset.promoId, promotion_name: el.dataset.promoName || el.dataset.promoId, creative_slot: el.dataset.promoSlot || '' });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { A.track('view_promotion', data(en.target)); io.unobserve(en.target); } });
      }, { threshold: 0.5 });
      promos.forEach((el) => io.observe(el));
    }
    promos.forEach((el) => el.addEventListener('click', (e) => { if (e.target.closest('a, button')) A.track('select_promotion', data(el)); }));
  }

  /** Mini product lists and card strips declared in HTML with data-product-ids. */
  function initProductStrips() {
    $$('[data-product-ids]').forEach((el) => {
      const ids = el.getAttribute('data-product-ids').split(',').map((s) => s.trim());
      const list = ids.map((id) => GC.getProduct(id)).filter(Boolean);
      if (el.getAttribute('data-variant') === 'cards') {
        renderProducts(el, list, { listName: el.getAttribute('data-list') || 'Guide products' });
        return;
      }
      el.innerHTML = list.map((p) =>
        '<a class="mini-product" href="' + productUrl(p.id) + '" data-product-link="' + esc(p.id) + '" data-list="Guide sidebar">' +
          '<img src="' + GC.imageUrl(p.photoId, 160) + '" alt="' + esc(p.alt) + '" loading="lazy" width="64" height="64">' +
          '<div><strong>' + esc(p.name) + '</strong><span>Where to buy →</span></div>' +
        '</a>').join('');
    });
  }

  /* ------------------------------------------------------------------
     4. Forms: newsletter + contact validation
     ------------------------------------------------------------------ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(input, message) {
    const errorEl = document.getElementById(input.getAttribute('data-error-id') || (input.id + '-error'));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message || '';
  }

  /** Newsletter forms (footer band on every page). */
  function initNewsletter() {
    $$('.js-newsletter-form').forEach((form) => {
      const input = $('input[type="email"]', form);
      const success = $('.form-success', form);
      const row = $('.input-row', form);
      form.setAttribute('novalidate', '');
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validate(); });
      function validate() {
        const v = input.value.trim();
        let msg = '';
        if (!v) msg = 'Please enter your email address.';
        else if (!EMAIL_RE.test(v)) msg = 'Please enter a valid email address, e.g. name@example.com.';
        setFieldError(input, msg);
        return !msg;
      }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) { input.focus(); return; }
        // Demo only: no email is stored or sent. Connect a provider (Mailchimp, Brevo, etc.) here.
        A.track('newsletter_signup', { form_location: form.getAttribute('data-location') || PAGE, method: 'email' });
        row.hidden = true;
        const consent = $('.consent', form);
        if (consent) consent.hidden = true;
        success.hidden = false;
        success.focus();
      });
    });
  }

  /** Contact form with inline, accessible validation. */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    form.setAttribute('novalidate', '');
    const rules = {
      name: (v) => (!v ? 'Please enter your name.' : v.length < 2 ? 'Name should be at least 2 characters.' : !/^[\p{L} .'-]+$/u.test(v) ? 'Please use letters only.' : ''),
      email: (v) => (!v ? 'Please enter your email address.' : !EMAIL_RE.test(v) ? 'Please enter a valid email address.' : ''),
      phone: (v) => (v && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')) ? 'Enter a 10-digit Indian mobile number (optional).' : ''),
      topic: (v) => (!v ? 'Please choose a topic.' : ''),
      message: (v) => (!v ? 'Please write a message.' : v.length < 20 ? 'Please add a little more detail (at least 20 characters).' : v.length > 1000 ? 'Please keep your message under 1000 characters.' : ''),
      consent: (_, el) => (!el.checked ? 'Please confirm you agree to be contacted about your enquiry.' : '')
    };
    const fields = Object.keys(rules).map((name) => form.elements[name]).filter(Boolean);
    const counter = $('#message-count');

    function check(el) {
      const value = el.type === 'checkbox' ? el.checked : el.value.trim();
      const msg = rules[el.name](value, el);
      setFieldError(el, msg);
      return !msg;
    }
    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.dataset.touched || el.value) { el.dataset.touched = '1'; check(el); } });
      el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
    });
    if (counter && form.elements.message) {
      form.elements.message.addEventListener('input', () => { counter.textContent = form.elements.message.value.length + ' / 1000'; });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = fields.filter((el) => !check(el));
      if (invalid.length) { invalid[0].focus(); return; }
      const name = form.elements.name.value.trim().split(' ')[0];
      const topic = form.elements.topic.value;
      // Demo only: nothing is transmitted. See README to connect Formspree / Google Forms.
      A.track('generate_lead', { form_name: 'contact', topic: topic });
      A.track('contact_form_submit', { topic: topic });
      const success = $('#contact-success');
      $('#contact-success-name').textContent = name;
      form.reset();
      if (counter) counter.textContent = '0 / 1000';
      fields.forEach((el) => { el.removeAttribute('aria-invalid'); delete el.dataset.touched; });
      success.hidden = false;
      success.focus();
    });
  }

  /* ------------------------------------------------------------------
     5. Page controllers
     ------------------------------------------------------------------ */
  const pages = {};

  /** Home: best sellers + campaign products. */
  pages.home = function () {
    const best = GC.products.filter((p) => p.featured).slice(0, 8);
    renderProducts($('#bestsellers-grid'), best, { listName: 'Home – Best sellers' });
    const campaign = GC.products.filter((p) => p.campaign).slice(0, 4);
    renderProducts($('#campaign-grid'), campaign, { listName: 'Home – Winter Garden Festival' });
  };

  /** Shop: search, category filter, sorting, URL state. */
  pages.shop = function () {
    const grid = $('#shop-grid');
    const chips = $('#category-chips');
    const search = $('#shop-search');
    const sort = $('#shop-sort');
    const countEl = $('#result-count');
    const headingEl = $('#shop-results-heading');
    const introEl = $('#category-intro');
    const params = new URLSearchParams(window.location.search);
    const validCats = GC.categories.map((c) => c.id);
    const state = {
      q: (params.get('q') || '').trim(),
      category: validCats.includes(params.get('category')) ? params.get('category') : 'all',
      sort: params.get('sort') || 'featured'
    };
    search.value = state.q;
    if ($('option[value="' + state.sort + '"]', sort)) sort.value = state.sort; else state.sort = 'featured';

    // Build category chips with product counts.
    const count = (cat) => GC.products.filter((p) => cat === 'all' || p.category === cat).length;
    chips.innerHTML = [{ id: 'all', name: 'All picks' }].concat(GC.categories).map((c) =>
      '<button type="button" class="chip" data-category="' + c.id + '" aria-pressed="' + (state.category === c.id) + '">' +
        esc(c.name) + ' <span class="chip-count">' + count(c.id) + '</span></button>').join('');

    const trackSearch = debounce((term) => { if (term.length >= 2) A.track('search', { search_term: term }); }, 900);

    function sortList(list) {
      const care = (p) => (p.finder ? { low: 1, medium: 2, high: 3 }[p.finder.maintenance] : 1.5);
      const catIndex = (p) => GC.categories.findIndex((c) => c.id === p.category);
      const by = {
        'easy': (a, b) => care(a) - care(b) || a.order - b.order,
        'category': (a, b) => catIndex(a) - catIndex(b) || a.order - b.order,
        'name-asc': (a, b) => a.name.localeCompare(b.name),
        'featured': (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order
      };
      return list.slice().sort(by[state.sort] || by.featured);
    }

    function updateUrl() {
      const p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      if (state.category !== 'all') p.set('category', state.category);
      if (state.sort !== 'featured') p.set('sort', state.sort);
      const qs = p.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    }

    function render() {
      const cat = GC.getCategory(state.category);
      let list = GC.searchProducts(state.q);
      if (state.category !== 'all') list = list.filter((p) => p.category === state.category);
      list = sortList(list);

      $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === state.category)));
      headingEl.textContent = cat ? cat.name : 'All plants & gardening supplies';
      introEl.textContent = cat ? cat.blurb + ' Compare where to buy each one.' : 'Our curated plants, planters, seeds, soil and tools — each with links to compare where to buy.';
      countEl.textContent = list.length + (list.length === 1 ? ' pick' : ' picks') + (state.q ? ' for “' + state.q + '”' : '');
      document.title = (cat ? 'Where to Buy ' + cat.name + ' Online in India' : 'Where to Buy Plants Online in India: Plants, Pots & Tools') + ' | GreenCorner';

      if (!list.length) {
        grid.innerHTML = '<div class="empty-state">' + icon('sprout') + '<h3>No picks found</h3><p class="muted">Try a different search term or browse all categories.</p><button type="button" class="btn btn-outline" id="clear-filters">Clear filters</button></div>';
        $('#clear-filters').addEventListener('click', () => { state.q = ''; state.category = 'all'; search.value = ''; render(); search.focus(); });
      } else {
        renderProducts(grid, list, { listName: 'Where to buy – ' + (cat ? cat.name : 'All picks') });
      }
      updateUrl();
    }

    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      state.category = chip.dataset.category;
      render();
    });
    search.addEventListener('input', debounce(() => { state.q = search.value.trim(); render(); trackSearch(state.q); }, 180));
    $('#shop-search-form').addEventListener('submit', (e) => { e.preventDefault(); state.q = search.value.trim(); render(); trackSearch(state.q); });
    sort.addEventListener('change', () => { state.sort = sort.value; render(); });
    if (state.q) A.track('search', { search_term: state.q });
    render();
  };

  /** Buying checklists shown on product pages, by type of pick. */
  const BUYING_TIPS = {
    plant: [
      'Compare the plant height and pot size in each listing — photos often show larger plants.',
      'Look for firm stems and healthy leaves without yellow patches, spots or pests in photos and reviews.',
      'Read recent reviews about packaging and how plants arrived, not just the star rating.',
      'Check delivery to your pin code and the store’s policy for plants that arrive damaged.',
      'Let a new plant settle for one to two weeks before repotting it.'
    ],
    supply: [
      'Check dimensions and material in the listing so it fits your space and plants.',
      'For pots and planters, make sure there is a drainage hole.',
      'Compare price per unit or per kg between pack sizes.',
      'Read recent reviews for quality and durability, and check the return policy.'
    ]
  };

  /** Product details: render from ?id=, update SEO tags, where-to-buy links, related picks. */
  pages.product = function () {
    const root = $('#product-root');
    const id = new URLSearchParams(window.location.search).get('id');
    const p = id && GC.getProduct(id);
    const notFound = $('#product-not-found');

    if (!p) {
      root.hidden = true;
      notFound.hidden = false;
      document.title = 'Pick not found | GreenCorner';
      const robots = document.createElement('meta');
      robots.name = 'robots'; robots.content = 'noindex';
      document.head.appendChild(robots);
      return;
    }

    const cat = GC.getCategory(p.category);
    const isPlant = !!p.sunlight;
    const links = GC.storeLinks(p);
    const url = GC.SITE_URL + 'product.html?id=' + encodeURIComponent(p.id);

    // --- SEO: title, description, canonical, Open Graph, breadcrumb structured data ---
    const title = p.name + (isPlant ? ' – Care Guide & Where to Buy in India' : ' – Buying Tips & Where to Buy in India') + ' | GreenCorner';
    const desc = p.short + ' ' + (isPlant ? 'Sunlight: ' + p.sunlight.split('.')[0] + '. ' : '') + 'Compare where to buy online in India.';
    document.title = title;
    const setMeta = (sel, attr, val) => { const m = $(sel); if (m) m.setAttribute(attr, val); };
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', GC.imageUrl(p.photoId, 1200));
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', GC.imageUrl(p.photoId, 1200));
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: GC.SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Where to Buy', item: GC.SITE_URL + 'shop.html' },
        { '@type': 'ListItem', position: 3, name: cat.name, item: GC.SITE_URL + 'shop.html?category=' + cat.id },
        { '@type': 'ListItem', position: 4, name: p.name, item: url }
      ]
    });
    document.head.appendChild(ld);

    // --- Breadcrumb ---
    $('#product-breadcrumb').innerHTML =
      '<ol><li><a href="index.html">Home</a></li><li><a href="shop.html">Where to Buy</a></li>' +
      '<li><a href="' + shopUrl(cat.id) + '">' + esc(cat.name) + '</a></li><li><span aria-current="page">' + esc(p.name) + '</span></li></ol>';

    // --- Quick facts ---
    const facts = isPlant
      ? [['sun', 'Sunlight', p.sunlight.split('.')[0]], ['droplet', 'Watering', p.watering.split('.')[0]], ['ruler', 'Typical size', p.size.replace(/^Commonly sold around /, '')], ['leaf', 'Care level', p.finder ? ({ low: 'Easy', medium: 'Moderate', high: 'Hands-on' })[p.finder.maintenance] : 'Easy']]
      : [['ruler', 'Size guide', p.size]].concat(p.specs.slice(0, 3).map((s) => ['info', s[0], s[1]]));

    const guides = (p.guides || []).map((slug) => GC.getGuide(slug)).filter(Boolean);
    const tips = BUYING_TIPS[isPlant ? 'plant' : 'supply'];

    const storeButtons = links.map((s) =>
      '<a class="store-link" href="' + esc(s.url) + '" target="_blank" rel="noopener" data-store-link="' + s.id + '" data-item="' + esc(p.id) + '" data-location="product_page">' +
        '<span class="store-name">' + esc(s.name) + '</span>' +
        '<span class="store-note">' + esc(s.note) + '</span>' +
        '<span class="store-cta">Search “' + esc(p.search) + '” ' + icon('external') + '</span>' +
        '<span class="visually-hidden"> (opens in a new tab)</span>' +
      '</a>').join('');

    root.innerHTML =
      '<div class="product-detail">' +
        '<div class="product-gallery"><div class="main-img">' +
          '<img src="' + GC.imageUrl(p.photoId, 1000) + '" srcset="' + GC.imageUrl(p.photoId, 600) + ' 600w, ' + GC.imageUrl(p.photoId, 1000) + ' 1000w, ' + GC.imageUrl(p.photoId, 1400) + ' 1400w" sizes="(max-width: 960px) 100vw, 50vw" alt="' + esc(p.alt) + '" width="1000" height="1050" fetchpriority="high">' +
          (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
        '</div></div>' +
        '<div class="product-info">' +
          '<a class="product-cat" href="' + shopUrl(cat.id) + '">' + esc(cat.name) + '</a>' +
          '<h1>' + esc(p.name) + '</h1>' +
          '<p class="short">' + esc(p.short) + '</p>' +
          '<section class="where-to-buy" id="where-to-buy" aria-labelledby="wtb-h">' +
            '<h2 id="wtb-h">Where to buy</h2>' +
            '<p class="small muted">Compare price, size and delivery at these Indian online stores. Each link opens the store’s search results.</p>' +
            '<div class="store-grid">' + storeButtons + '</div>' +
            '<button class="btn btn-outline btn-save btn-block" type="button" data-save-item="' + esc(p.id) + '" aria-pressed="false">' + icon('heart') + '<span>Save to my plant list</span></button>' +
            '<p class="disclosure">' + icon('info') + '<span>GreenCorner doesn’t sell products and isn’t affiliated with these stores — we earn no commission. Prices, stock and delivery are set by each store.</span></p>' +
          '</section>' +
          '<div class="quick-facts">' + facts.map((f) => '<div class="quick-fact">' + icon(f[0]) + '<div><strong>' + esc(f[1]) + '</strong><span>' + esc(f[2]) + '</span></div></div>').join('') + '</div>' +
          '<section class="detail-section" aria-labelledby="about-h"><h2 id="about-h">' + (isPlant ? 'About this plant' : 'About this pick') + '</h2><p>' + esc(p.description) + '</p></section>' +
          (isPlant
            ? '<section class="detail-section" aria-labelledby="sun-h"><h2 id="sun-h">Sunlight requirements</h2><p>' + esc(p.sunlight) + '</p></section>' +
              '<section class="detail-section" aria-labelledby="water-h"><h2 id="water-h">Watering frequency</h2><p>' + esc(p.watering) + '</p><p class="small muted">Watering needs change with season, pot size and room conditions — always check the soil first. Read our guide: <a href="' + guideUrl('how-often-to-water-indoor-plants') + '">how often should indoor plants be watered?</a></p></section>' +
              '<section class="detail-section" aria-labelledby="care-h"><h2 id="care-h">Plant care instructions</h2><ul class="care-list">' + p.care.map((c) => '<li>' + icon('check') + '<span>' + esc(c) + '</span></li>').join('') + '</ul>' +
                '<p class="mt-1"><a class="link-arrow" href="care-planner.html?plant=' + encodeURIComponent(p.id) + '">Track this plant in the Plant Care Planner ' + icon('arrow') + '</a></p></section>' +
              (p.pet ? '<section class="detail-section" aria-labelledby="pet-h"><h2 id="pet-h">Pets &amp; children</h2><p class="pet-note">' + icon('paw') + '<span>' + esc(p.pet) + '</span></p></section>' : '')
            : '<section class="detail-section" aria-labelledby="spec-h"><h2 id="spec-h">What to look for</h2><table class="spec-table"><tbody>' +
              '<tr><th scope="row">Size guide</th><td>' + esc(p.size) + '</td></tr>' +
              p.specs.map((s) => '<tr><th scope="row">' + esc(s[0]) + '</th><td>' + esc(s[1]) + '</td></tr>').join('') + '</tbody></table></section>') +
          '<section class="detail-section" aria-labelledby="tips-h"><h2 id="tips-h">Tips for buying online</h2><ul class="care-list">' + tips.map((t) => '<li>' + icon('checkCircle') + '<span>' + esc(t) + '</span></li>').join('') + '</ul></section>' +
          (guides.length ? '<section class="detail-section" aria-labelledby="guides-h"><h2 id="guides-h">Helpful plant care guides</h2><ul class="guide-links">' +
            guides.map((g) => '<li><a href="' + guideUrl(g.slug) + '">' + icon('book') + esc(g.title) + '</a></li>').join('') + '</ul></section>' : '') +
        '</div>' +
      '</div>';

    // Related picks: same category first, then featured items.
    let related = GC.products.filter((x) => x.category === p.category && x.id !== p.id);
    if (related.length < 4) related = related.concat(GC.products.filter((x) => x.featured && x.id !== p.id && !related.includes(x)));
    renderProducts($('#related-grid'), related.slice(0, 4), { listName: 'Related picks' });
    $('#related-section').hidden = false;

    // If the visitor arrived via a "Where to buy" button, bring that section into view.
    if (window.location.hash === '#where-to-buy') {
      setTimeout(() => { const w = $('#where-to-buy'); if (w) w.scrollIntoView({ block: 'start' }); }, 60);
    }

    A.track('view_item', { items: [A.toItem(Object.assign({}, p, { categoryName: cat.name }))] });
  };

  pages.contact = initContactForm;

  /* ------------------------------------------------------------------
     6. Boot
     ------------------------------------------------------------------ */
  function init() {
    initHeader();
    initImageFallback();
    initSelectItemTracking();
    initProductStrips();
    initNewsletter();
    if (pages[PAGE]) pages[PAGE]();
    initPromotions();
    initReveal();
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
