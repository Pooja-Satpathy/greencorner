/* ==========================================================================
   GreenCorner – care-planner.js
   Plant Care Planner: keep a list of your plants, record watering dates,
   see approximate next-watering reminders, log care activities, export
   calendar (.ics) reminders. Everything is stored in this browser only.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const GC = window.GC;
  const A = window.GCAnalytics || { track() {} };
  const { $, $$, esc, icon, toast } = GC.ui;

  const STORAGE_KEY = 'greencorner_planner_v1';
  const DAY = 24 * 60 * 60 * 1000;
  const ACTIVITY_TYPES = ['Watered', 'Fertilised', 'Pruned', 'Repotted', 'Cleaned leaves', 'Rotated pot', 'Pest check', 'Other'];

  /* ---------------- Date helpers (local dates as YYYY-MM-DD) ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => toISO(new Date());
  function parseISO(s) {
    const [y, m, d] = String(s).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, 12); // noon avoids DST edge cases
  }
  const addDays = (s, n) => toISO(new Date(parseISO(s).getTime() + n * DAY));
  const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / DAY);
  const fmt = (s) => parseISO(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = (s) => parseISO(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  /* ---------------- Storage ---------------- */
  function load() {
    try {
      const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (data && Array.isArray(data.plants)) return data;
    } catch (e) { /* ignore corrupt data */ }
    return { plants: [], lastNotified: '' };
  }
  function save() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {
      toast('Could not save – browser storage is unavailable.', { icon: 'info' });
    }
    render();
  }
  let state = load();

  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const findPlant = (id) => state.plants.find((p) => p.id === id);

  /** Work out the next watering date and a status for one plant. */
  function schedule(plant) {
    const next = addDays(plant.lastWatered, plant.interval);
    const dueIn = daysBetween(today(), next);
    const since = daysBetween(plant.lastWatered, today());
    let status, label;
    if (dueIn < 0) { status = 'overdue'; label = 'Overdue by ' + -dueIn + (dueIn === -1 ? ' day' : ' days'); }
    else if (dueIn === 0) { status = 'today'; label = 'Water today'; }
    else if (dueIn <= 2) { status = 'soon'; label = 'Due in ' + dueIn + (dueIn === 1 ? ' day' : ' days'); }
    else { status = 'ok'; label = 'In ' + dueIn + ' days'; }
    return { next, dueIn, since, status, label, progress: Math.min(100, Math.max(0, Math.round((since / plant.interval) * 100))) };
  }

  /* ---------------- Rendering ---------------- */
  function render() {
    const plants = state.plants.map((p) => Object.assign({}, p, { s: schedule(p) }))
      .sort((a, b) => a.s.dueIn - b.s.dueIn);
    renderStats(plants);
    renderReminders(plants);
    renderPlants(plants);
    renderLog();
  }

  function renderStats(plants) {
    const due = plants.filter((p) => p.s.dueIn <= 0).length;
    const weekAgo = addDays(today(), -6);
    const wateredThisWeek = state.plants.reduce((n, p) => n + p.log.filter((l) => l.type === 'Watered' && l.date >= weekAgo).length, 0);
    $('#planner-stats').innerHTML =
      '<div class="stat"><strong>' + plants.length + '</strong><span>Plants tracked</span></div>' +
      '<div class="stat' + (due ? ' alert' : '') + '"><strong>' + due + '</strong><span>Need water now</span></div>' +
      '<div class="stat"><strong>' + wateredThisWeek + '</strong><span>Waterings in 7 days</span></div>';
  }

  function renderReminders(plants) {
    const list = $('#reminder-list');
    const due = plants.filter((p) => p.s.dueIn <= 2);
    if (!plants.length) {
      list.innerHTML = '<li class="reminder ok">' + icon('bell') + '<span>Add your first plant to start getting watering reminders.</span></li>';
      return;
    }
    if (!due.length) {
      const next = plants[0];
      list.innerHTML = '<li class="reminder ok">' + icon('checkCircle') + '<span>All caught up! Next up: <strong>' + esc(next.name) + '</strong> on ' + fmt(next.s.next) + '.</span></li>';
      return;
    }
    list.innerHTML = due.map((p) =>
      '<li class="reminder' + (p.s.dueIn > 0 ? ' ok' : '') + '">' + icon(p.s.dueIn > 0 ? 'clock' : 'droplet') +
        '<span><strong>' + esc(p.name) + '</strong> – ' + esc(p.s.label.toLowerCase()) + (p.location ? ' · ' + esc(p.location) : '') + '</span>' +
        (p.s.dueIn <= 0 ? '<button type="button" class="btn btn-sm btn-primary" data-action="water" data-id="' + p.id + '">Mark watered</button>' : '') +
      '</li>').join('');
  }

  function renderPlants(plants) {
    const wrap = $('#plant-list');
    if (!plants.length) {
      wrap.innerHTML = '<div class="empty-state">' + icon('sprout') + '<h3>No plants yet</h3><p class="muted">Add a plant using the form, or load two example plants to see how the planner works.</p>' +
        '<button type="button" class="btn btn-outline" id="load-examples">Load example plants</button></div>';
      $('#load-examples').addEventListener('click', loadExamples);
      return;
    }
    wrap.innerHTML = plants.map((p) => {
      const lastCare = p.log.filter((l) => l.type !== 'Watered').sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      const product = p.type && GC.getProduct(p.type);
      return '<article class="plant-item" data-id="' + p.id + '">' +
        '<header><div><h3>' + esc(p.name) + '</h3><div class="sub">' + esc([product ? product.name : 'Custom plant', p.location].filter(Boolean).join(' · ')) + '</div></div>' +
          '<span class="status-pill status-' + p.s.status + '">' + esc(p.s.label) + '</span></header>' +
        '<div class="water-bar" role="img" aria-label="Estimated soil drying progress: ' + p.s.progress + '% of the watering interval"><span style="width:' + p.s.progress + '%"></span></div>' +
        '<dl class="plant-facts">' +
          '<dt>Last watered</dt><dd>' + fmt(p.lastWatered) + '</dd>' +
          '<dt>Next watering</dt><dd>' + fmt(p.s.next) + '</dd>' +
          '<dt>Interval</dt><dd>Every ' + p.interval + (p.interval === 1 ? ' day' : ' days') + '</dd>' +
          '<dt>Last care</dt><dd>' + (lastCare ? esc(lastCare.type) + ' · ' + fmtShort(lastCare.date) : '—') + '</dd>' +
        '</dl>' +
        (p.notes ? '<p class="plant-notes">' + esc(p.notes) + '</p>' : '') +
        '<div class="plant-actions">' +
          '<button type="button" class="btn btn-primary" data-action="water">' + icon('droplet') + 'Watered today</button>' +
          '<button type="button" class="btn btn-outline" data-action="log" aria-expanded="false" aria-controls="log-' + p.id + '">Log care</button>' +
          '<button type="button" class="btn btn-ghost" data-action="ics" title="Download a repeating calendar reminder">' + icon('calendar') + 'Calendar</button>' +
          '<button type="button" class="btn btn-ghost" data-action="delete" aria-label="Delete ' + esc(p.name) + '">' + icon('trash') + '</button>' +
        '</div>' +
        '<form class="log-form" id="log-' + p.id + '" hidden novalidate>' +
          '<div class="row">' +
            '<div class="field"><label for="type-' + p.id + '">Activity</label><select id="type-' + p.id + '" name="type">' + ACTIVITY_TYPES.map((t) => '<option>' + t + '</option>').join('') + '</select></div>' +
            '<div class="field"><label for="date-' + p.id + '">Date</label><input type="date" id="date-' + p.id + '" name="date" value="' + today() + '" max="' + today() + '"></div>' +
          '</div>' +
          '<div class="field"><label for="note-' + p.id + '">Note (optional)</label><input type="text" id="note-' + p.id + '" name="note" maxlength="80" placeholder="e.g. Half-strength seaweed feed"></div>' +
          '<button type="submit" class="btn btn-sm btn-primary">Save activity</button>' +
        '</form>' +
      '</article>';
    }).join('');
  }

  function renderLog() {
    const entries = [];
    state.plants.forEach((p) => p.log.forEach((l) => entries.push(Object.assign({ plant: p.name }, l))));
    entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.t || 0) - (a.t || 0)));
    $('#activity-log').innerHTML = entries.length
      ? entries.slice(0, 15).map((e) => '<li><time datetime="' + e.date + '">' + fmt(e.date) + '</time><span><strong>' + esc(e.type) + '</strong> · ' + esc(e.plant) + (e.note ? ' — ' + esc(e.note) : '') + '</span></li>').join('')
      : '<li><span class="muted">Your watering and care history will appear here.</span></li>';
  }

  /* ---------------- Actions ---------------- */
  function waterPlant(id) {
    const p = findPlant(id);
    if (!p) return;
    p.lastWatered = today();
    p.log.push({ type: 'Watered', date: today(), t: Date.now() });
    save();
    A.track('care_planner_watered', { plant_type: p.type || 'custom' });
    toast(p.name + ' watered. Next reminder: ' + fmt(addDays(p.lastWatered, p.interval)), { icon: 'droplet' });
  }

  function deletePlant(id) {
    const index = state.plants.findIndex((p) => p.id === id);
    if (index < 0) return;
    const [removed] = state.plants.splice(index, 1);
    save();
    toast(removed.name + ' deleted', { icon: 'trash', actionLabel: 'Undo', onAction: () => { state.plants.splice(index, 0, removed); save(); } });
  }

  /** Build a repeating all-day calendar event (.ics) for a plant's watering. */
  function downloadIcs(id) {
    const p = findPlant(id);
    if (!p) return;
    const s = schedule(p);
    const start = s.dueIn < 0 ? today() : s.next;
    const ymd = (iso) => iso.replace(/-/g, '');
    const escText = (t) => String(t).replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GreenCorner//Plant Care Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + p.id + '-' + Date.now() + '@greencorner',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + ymd(start),
      'DTEND;VALUE=DATE:' + ymd(addDays(start, 1)),
      'RRULE:FREQ=DAILY;INTERVAL=' + p.interval,
      'SUMMARY:' + escText('Water ' + p.name),
      'DESCRIPTION:' + escText('Approximate reminder from the GreenCorner Plant Care Planner (every ' + p.interval + ' days). Check the soil with your finger before watering and adjust for season.'),
      'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:' + escText('Water ' + p.name), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'water-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    A.track('care_planner_calendar_export', { interval_days: p.interval });
  }

  function loadExamples() {
    const t = today();
    state.plants.push(
      { id: uid(), name: 'Living-room snake plant', type: 'snake-plant', location: 'Living room corner', interval: 18, lastWatered: addDays(t, -19), notes: 'Let the soil dry out fully.', created: t, log: [{ type: 'Watered', date: addDays(t, -19), t: 1 }, { type: 'Cleaned leaves', date: addDays(t, -10), t: 2 }] },
      { id: uid(), name: 'Kitchen money plant', type: 'money-plant', location: 'Kitchen shelf', interval: 7, lastWatered: addDays(t, -5), notes: '', created: t, log: [{ type: 'Watered', date: addDays(t, -5), t: 3 }, { type: 'Fertilised', date: addDays(t, -12), note: 'Diluted liquid feed', t: 4 }] }
    );
    save();
    toast('Two example plants added.');
  }

  /* ---------------- Notifications (only while the page is open) ---------------- */
  function notifyIfDue(force) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!force && state.lastNotified === today()) return;
    const due = state.plants.filter((p) => schedule(p).dueIn <= 0);
    if (!due.length) return;
    try {
      new Notification('GreenCorner: ' + due.length + (due.length === 1 ? ' plant needs' : ' plants need') + ' water', {
        body: due.map((p) => p.name).join(', '),
        icon: (document.body.getAttribute('data-root') || '') + 'images/favicon.svg'
      });
      state.lastNotified = today();
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    } catch (e) { /* some mobile browsers only allow notifications from a service worker */ }
  }

  function initNotifications() {
    const btn = $('#enable-notifications');
    const status = $('#notify-status');
    if (!('Notification' in window)) {
      btn.hidden = true;
      status.textContent = 'Browser reminders are not supported here – use “Calendar” on a plant to add a repeating reminder.';
      return;
    }
    const update = () => {
      const perm = Notification.permission;
      btn.hidden = perm !== 'default'; // only offer the button while permission can still be asked
      status.textContent = perm === 'granted'
        ? 'Browser reminders are on. They appear when you open this page on a day a plant is due. For reminders when the site is closed, use “Calendar”.'
        : perm === 'denied' ? 'Notifications are blocked in your browser settings. Use “Calendar” reminders instead.' : '';
    };
    btn.addEventListener('click', () => {
      Notification.requestPermission().then(() => { update(); notifyIfDue(true); A.track('care_planner_notifications', { permission: Notification.permission }); });
    });
    update();
    notifyIfDue(false);
  }

  /* ---------------- Add-plant form ---------------- */
  function initForm() {
    const form = $('#plant-form');
    const typeSel = form.elements.type;
    const nameIn = form.elements.name;
    const intervalIn = form.elements.interval;
    const dateIn = form.elements.lastWatered;
    let autoName = '';

    // Populate the plant dropdown from the catalogue (plants only).
    GC.products.filter((p) => p.waterDays).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name.replace(/\s*\(.*\)$/, '') + ' (water ~every ' + p.waterDays + ' days)';
      typeSel.insertBefore(opt, typeSel.querySelector('option[value="custom"]'));
    });
    dateIn.value = today();
    dateIn.max = today();

    function applyType() {
      const p = GC.getProduct(typeSel.value);
      if (p) {
        intervalIn.value = p.waterDays;
        if (!nameIn.value || nameIn.value === autoName) { autoName = p.name.replace(/\s*\(.*\)$/, ''); nameIn.value = autoName; }
        $('#plant-type-hint').textContent = 'Suggested interval: ' + p.waterDays + ' days. ' + p.watering.split('.')[0] + '.';
      } else {
        $('#plant-type-hint').textContent = 'Picking a plant from our catalogue suggests a watering interval.';
      }
    }
    typeSel.addEventListener('change', applyType);

    // Pre-select a plant when arriving from a product page (care-planner.html?plant=snake-plant).
    const pre = new URLSearchParams(window.location.search).get('plant');
    if (pre && GC.getProduct(pre) && GC.getProduct(pre).waterDays) { typeSel.value = pre; applyType(); }

    const err = (el, msg) => {
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      $('#' + el.id + '-error').textContent = msg;
      return !msg;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      const interval = parseInt(intervalIn.value, 10);
      const last = dateIn.value;
      const ok = [
        err(nameIn, !name ? 'Please give your plant a name.' : ''),
        err(intervalIn, !(interval >= 1 && interval <= 60) ? 'Enter a number of days between 1 and 60.' : ''),
        err(dateIn, !last ? 'Please choose a date.' : last > today() ? 'The date can’t be in the future.' : '')
      ];
      if (ok.includes(false)) { const bad = form.querySelector('[aria-invalid="true"]'); bad && bad.focus(); return; }

      const plant = {
        id: uid(), name, type: GC.getProduct(typeSel.value) ? typeSel.value : '',
        location: form.elements.location.value.trim(), interval, lastWatered: last,
        notes: form.elements.notes.value.trim(), created: today(),
        log: [{ type: 'Watered', date: last, t: Date.now() }]
      };
      state.plants.push(plant);
      save();
      A.track('care_planner_add_plant', { plant_type: plant.type || 'custom', interval_days: interval });
      toast(name + ' added – next watering ' + fmt(addDays(last, interval)), { icon: 'sprout' });
      form.reset();
      autoName = '';
      dateIn.value = today();
      $('#plant-type-hint').textContent = 'Picking a plant from our catalogue suggests a watering interval.';
      nameIn.focus();
    });
  }

  /* ---------------- Delegated events on the plant list ---------------- */
  function initListEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const card = btn.closest('.plant-item');
      const id = btn.getAttribute('data-id') || (card ? card.getAttribute('data-id') : '');
      if (!id) return;
      const action = btn.getAttribute('data-action');
      if (action === 'water') waterPlant(id);
      if (action === 'delete') deletePlant(id);
      if (action === 'ics') downloadIcs(id);
      if (action === 'log') {
        const f = $('#log-' + id);
        f.hidden = !f.hidden;
        btn.setAttribute('aria-expanded', String(!f.hidden));
        if (!f.hidden) f.elements.type.focus();
      }
    });

    document.addEventListener('submit', (e) => {
      const f = e.target.closest('.log-form');
      if (!f) return;
      e.preventDefault();
      const id = f.closest('.plant-item').getAttribute('data-id');
      const p = findPlant(id);
      const type = f.elements.type.value;
      const date = f.elements.date.value || today();
      if (date > today()) { toast('Please choose today or an earlier date.', { icon: 'info' }); return; }
      p.log.push({ type, date, note: f.elements.note.value.trim(), t: Date.now() });
      if (type === 'Watered' && date > p.lastWatered) p.lastWatered = date;
      save();
      A.track('care_planner_log_activity', { activity: type });
      toast(type + ' logged for ' + p.name, { icon: 'check' });
    });
  }

  /* ---------------- Backup & reset ---------------- */
  function initTools() {
    $('#export-data').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'greencorner-plant-planner-backup.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    const confirmBox = $('#clear-confirm');
    $('#clear-data').addEventListener('click', () => { confirmBox.hidden = false; $('#clear-no').focus(); });
    $('#clear-no').addEventListener('click', () => { confirmBox.hidden = true; $('#clear-data').focus(); });
    $('#clear-yes').addEventListener('click', () => {
      state = { plants: [], lastNotified: '' };
      save();
      confirmBox.hidden = true;
      toast('All plant records cleared.', { icon: 'trash' });
    });
    // Sync if the planner is open in two tabs.
    window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) { state = load(); render(); } });
  }

  function init() {
    if (!$('#plant-form')) return;
    initForm();
    initListEvents();
    initTools();
    render();
    initNotifications();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
