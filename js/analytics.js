/* ==========================================================================
   GreenCorner – Google Analytics 4 (GA4) setup
   --------------------------------------------------------------------------
   HOW TO CONNECT A REAL GA4 PROPERTY
   1. In Google Analytics, create a GA4 property and a Web data stream.
   2. Copy the stream's Measurement ID (it looks like G-XXXXXXXXXX).
   3. Paste it into GA_MEASUREMENT_ID below and redeploy.
   Until an ID is added, no data is sent to Google: events are only pushed to
   window.dataLayer and printed in the browser console (when DEBUG is true),
   so you can check the tracking plan locally.
   ========================================================================== */
(function (window, document) {
  'use strict';

  /** Paste your GA4 Measurement ID here, e.g. 'G-AB12CD34EF'. Leave empty to disable. */
  var GA_MEASUREMENT_ID = '';

  /** Log events to the console while developing. Set to false for production. */
  var DEBUG = true;

  var isValidId = /^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (isValidId) {
    // Load the official gtag.js library asynchronously.
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);

    window.gtag('js', new Date());
    // page_view is sent automatically by the config call (Enhanced Measurement
    // in GA4 also covers scrolls, outbound clicks and site search if enabled).
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      debug_mode: DEBUG
    });
  }

  /**
   * Track an event. Safe to call whether or not GA4 is configured.
   * Uses GA4 recommended event names where they exist (view_item,
   * add_to_cart, begin_checkout, generate_lead, search ...) so that the
   * standard GA4 e-commerce reports work without extra setup.
   * @param {string} name   GA4 event name (snake_case, max 40 chars)
   * @param {Object} params Event parameters
   */
  function track(name, params) {
    params = params || {};
    if (isValidId) {
      window.gtag('event', name, params);
    } else {
      // Keep a GTM-friendly record even without gtag.js.
      window.dataLayer.push({ event: name, params: params });
    }
    if (DEBUG && window.console) {
      console.info('[GA4 event]', name, params, isValidId ? '' : '(not sent – no Measurement ID set)');
    }
  }

  /** Convert a product object into a GA4 "item" for e-commerce events. */
  function toItem(product, quantity) {
    if (!product) return {};
    return {
      item_id: product.id,
      item_name: product.name,
      item_category: product.categoryName || product.category,
      item_brand: 'GreenCorner',
      price: product.price,
      quantity: quantity || 1
    };
  }

  window.GCAnalytics = {
    measurementId: GA_MEASUREMENT_ID,
    enabled: isValidId,
    track: track,
    toItem: toItem
  };
})(window, document);
