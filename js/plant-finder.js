/* ==========================================================================
   GreenCorner – plant-finder.js
   Interactive Plant Finder: scores every plant in the catalogue against the
   visitor's location, light, maintenance and space answers, then shows the
   best matches with plain-language reasons.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const GC = window.GC;
  const A = window.GCAnalytics || { track() {} };
  const { $, $$, esc, icon, renderProducts } = GC.ui;

  const LIGHT_ORDER = ['low', 'medium', 'bright', 'direct'];
  const LEVEL = { low: 1, medium: 2, high: 3, small: 1, large: 3 };
  const LABELS = {
    location: { indoor: 'Indoors', outdoor: 'Outdoors / balcony' },
    light: { low: 'Low light', medium: 'Medium light', bright: 'Bright indirect light', direct: 'Direct sun' },
    maintenance: { low: 'Very low maintenance', medium: 'Some care', high: 'Hands-on care' },
    space: { small: 'Small space', medium: 'Medium space', large: 'Large space' }
  };
  const LIGHT_REASON = {
    low: 'Tolerates low light', medium: 'Happy in medium, indirect light',
    bright: 'Thrives in bright, indirect light', direct: 'Loves direct sunshine'
  };
  const CARE_REASON = {
    low: 'Low maintenance – forgiving if you forget', medium: 'Needs a simple weekly routine', high: 'Rewarding for hands-on gardeners'
  };
  const SPACE_REASON = {
    small: 'Compact – fits shelves, desks and windowsills', medium: 'Medium-sized – suits a floor corner or balcony pot', large: 'Grows into a large statement plant'
  };

  /**
   * Score one plant against the answers. Returns null when it is clearly unsuitable.
   * Weighting: light 40 · maintenance 30 · space 30 (max 100).
   */
  function scorePlant(p, a) {
    const f = p.finder;
    if (!f || !f.location.includes(a.location)) return null;

    let score = 0;
    const reasons = [];
    const notes = [];

    // Light – exact match is best; one step away is acceptable with a note.
    if (f.light.includes(a.light)) {
      score += 40;
      reasons.push(LIGHT_REASON[a.light]);
    } else {
      const i = LIGHT_ORDER.indexOf(a.light);
      const dist = Math.min(...f.light.map((l) => Math.abs(LIGHT_ORDER.indexOf(l) - i)));
      if (dist > 1) return null;
      const needsMore = LIGHT_ORDER.indexOf(f.light[0]) > i;
      score += 15;
      notes.push(needsMore ? 'Prefers a little more light – place it near your brightest window' : 'Shield it from harsh afternoon sun');
    }

    // Maintenance – plants that need less care than you can give are always fine.
    const need = LEVEL[f.maintenance];
    const give = LEVEL[a.maintenance];
    if (need <= give) {
      score += need === give ? 30 : 26;
      reasons.push(CARE_REASON[f.maintenance]);
    } else if (need - give === 1) {
      score += 8;
      notes.push('Needs a little more attention than you prefer');
    } else {
      return null;
    }

    // Space – smaller plants fit larger spaces; a much larger plant does not fit.
    const size = LEVEL[f.space];
    const room = LEVEL[a.space];
    if (size === room) { score += 30; reasons.push(SPACE_REASON[f.space]); }
    else if (size < room) { score += 22; reasons.push(SPACE_REASON[f.space]); }
    else if (size - room === 1) { score += 6; notes.push('Will need room to grow over time'); }
    else return null;

    // Watering rhythm (helpful context, not scored).
    if (p.waterDays >= 14) reasons.push('Water roughly every 2–3 weeks');
    else if (p.waterDays >= 6) reasons.push('Water about once a week');
    else reasons.push('Needs frequent watering in warm weather');
    if (p.pet && /non-toxic/i.test(p.pet)) reasons.push('Listed as non-toxic to cats and dogs (ASPCA)');

    return { product: p, score, reasons, notes };
  }

  function matchLabel(score) {
    if (score >= 85) return 'Great match';
    if (score >= 65) return 'Good match';
    return 'Worth a try';
  }

  function reasonsHtml(r) {
    return '<ul class="match-reasons">' +
      r.reasons.slice(0, 3).map((t) => '<li>' + icon('check') + '<span>' + esc(t) + '</span></li>').join('') +
      r.notes.map((t) => '<li>' + icon('info') + '<span>' + esc(t) + '</span></li>').join('') +
      '</ul>';
  }

  function init() {
    const form = $('#finder-form');
    if (!form) return;
    const results = $('#finder-results');
    const grid = $('#finder-grid');
    const errorEl = $('#finder-error');

    function answers() {
      const data = {};
      ['location', 'light', 'maintenance', 'space'].forEach((k) => {
        const checked = form.querySelector('input[name="' + k + '"]:checked');
        data[k] = checked ? checked.value : '';
      });
      return data;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = answers();
      const missing = Object.keys(a).filter((k) => !a[k]);
      if (missing.length) {
        errorEl.textContent = 'Please answer all four questions (' + missing.length + ' remaining).';
        const firstMissing = form.querySelector('input[name="' + missing[0] + '"]');
        firstMissing.closest('fieldset').scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstMissing.focus({ preventScroll: true });
        return;
      }
      errorEl.textContent = '';

      const matches = GC.products
        .map((p) => scorePlant(p, a))
        .filter(Boolean)
        .sort((x, y) => y.score - x.score || (y.product.featured ? 1 : 0) - (x.product.featured ? 1 : 0))
        .slice(0, 6);

      $('#finder-summary').innerHTML = Object.keys(a).map((k) => '<span class="chip is-active" aria-pressed="true">' + esc(LABELS[k][a[k]]) + '</span>').join('');
      $('#results-title').textContent = matches.length
        ? 'We found ' + matches.length + (matches.length === 1 ? ' plant' : ' plants') + ' for your space'
        : 'No close matches – try adjusting your answers';

      if (matches.length) {
        grid.innerHTML = matches.map((m) => GC.ui.productCard(m.product, {
          listName: 'Plant Finder results', matchLabel: matchLabel(m.score) + ' · ' + m.score + '%', extraHtml: reasonsHtml(m)
        })).join('');
      } else {
        grid.innerHTML = '<div class="empty-state">' + icon('sprout') + '<h3>Nothing fits every answer</h3><p class="muted">Try “Some care” or a brighter light level — or read our guide to <a href="guides/best-plants-for-small-apartments.html">plants for small apartments</a>.</p></div>';
      }

      // Cross-sell: essentials to complete the setup.
      const extras = a.location === 'indoor'
        ? ['white-ceramic-planter', 'organic-potting-mix', 'plant-mister']
        : ['terracotta-pot-set', 'vermicompost', 'metal-watering-can'];
      renderProducts($('#finder-extras'), extras.map(GC.getProduct).filter(Boolean), { listName: 'Plant Finder – essentials' });

      results.hidden = false;
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('#results-title').focus({ preventScroll: true });

      A.track('plant_finder_submit', {
        location: a.location, light: a.light, maintenance: a.maintenance, space: a.space,
        results_count: matches.length, top_result: matches[0] ? matches[0].product.id : 'none'
      });
    });

    form.addEventListener('reset', () => {
      results.hidden = true;
      errorEl.textContent = '';
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    });

    // Clear the "please answer" message as soon as all questions are answered.
    $$('input[type="radio"]', form).forEach((r) => r.addEventListener('change', () => {
      if (errorEl.textContent && Object.values(answers()).every(Boolean)) errorEl.textContent = '';
    }));
  }

  // Exposed for testing in the browser console.
  window.GCPlantFinder = { scorePlant };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
