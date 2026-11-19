/* Modiflix — store admin */
(function () {
  'use strict';

  var view = document.getElementById('view');
  var toastEl = document.getElementById('toast');
  var themeMeta = document.getElementById('theme-color');
  var themeBtn = document.getElementById('theme-btn');
  var topbar = document.getElementById('topbar');

  var state = {
    installed: {},
    toastTimer: null
  };

  try {
    state.installed = JSON.parse(localStorage.getItem('gp_installed') || '{}') || {};
  } catch (e) { state.installed = {}; }

  /* ---------------- catalog persistence ---------------- */
  var CATALOG_KEY = 'gp_catalog_v1';
  var DEFAULTS = JSON.parse(JSON.stringify(APPS));

  var admin = {
    q: '',
    cat: 'all',
    deleting: null,
    delTimer: null
  };

  function hexOr(v, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : fallback;
  }

  function normalizeApp(a) {
    function txt(v, fallback, max) {
      var s = String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, max || 200);
      return s || fallback;
    }
    a = a || {};
    a.id = String(a.id || 'app').replace(/[^\w-]/g, '').slice(0, 48) || 'app';
    a.name = txt(a.name, 'Untitled app', 60);
    a.dev = txt(a.dev, 'Unknown developer', 60);
    a.cat = a.cat === 'game' ? 'game' : 'app';
    a.genre = txt(a.genre, 'Productivity', 40);
    a.glyph = txt(a.glyph, '📦', 8);
    a.colors = [hexOr((a.colors || [])[0], '#1a73e8'), hexOr((a.colors || [])[1], '#34a853')];
    a.rating = Math.min(5, Math.max(0, Number(a.rating) || 0));
    a.reviews = Math.max(0, parseInt(a.reviews, 10) || 0);
    a.downloads = txt(a.downloads, '1K+', 16);
    a.size = txt(a.size, '20 MB', 16);
    a.age = txt(a.age, 'Everyone', 20);
    a.tag = a.tag ? txt(a.tag, null, 24) : null;
    a.featured = !!a.featured;
    a.blurb = txt(a.blurb, '', 200);
    a.desc = txt(a.desc, a.blurb, 4000);
    return a;
  }

  function loadSavedCatalog() {
    var raw = null;
    try { raw = localStorage.getItem(CATALOG_KEY); } catch (e) { return; }
    if (!raw) return;
    try {
      var parsed = JSON.parse(raw);
      var list = parsed && Array.isArray(parsed.apps) ? parsed.apps : null;
      if (!list) return;
      APPS.length = 0;
      list.forEach(function (a) { APPS.push(normalizeApp(a)); });
    } catch (e) { /* keep seed data */ }
  }

  function saveCatalog() {
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify({ v: 1, apps: APPS }));
    } catch (e) {
      toast('Could not save — device storage is full');
    }
  }

  function saveInstalled() {
    try { localStorage.setItem('gp_installed', JSON.stringify(state.installed)); } catch (e) {}
  }

  loadSavedCatalog();

  /* ---------------- utils ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function grad(colors) { return 'background:linear-gradient(135deg,' + colors[0] + ',' + colors[1] + ')'; }

  function byId(id) {
    return APPS.filter(function (a) { return a.id === id; })[0] ||
      (typeof MOVIES !== 'undefined' ? MOVIES.filter(function (m) { return m.id === id; })[0] : null) ||
      (typeof BOOKS !== 'undefined' ? BOOKS.filter(function (b) { return b.id === id; })[0] : null) || null;
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'app';
  }

  function uniqueId(name) {
    var base = slugify(name);
    var id = base;
    var n = 2;
    while (byId(id)) { id = base + '-' + n; n++; }
    return id;
  }

  function blankApp() {
    return {
      id: '', name: '', dev: '', cat: 'app', genre: 'Productivity', glyph: '📦',
      colors: ['#1a73e8', '#34a853'], rating: 4.0, reviews: 1000,
      downloads: '1K+', size: '20 MB', age: 'Everyone', tag: null,
      featured: false, blurb: '', desc: ''
    };
  }

  /* ---------------- admin rows & views ---------------- */
  function adminRow(a) {
    var confirm = admin.deleting === a.id;
    return '' +
      '<div class="admin-row">' +
        '<div class="a-icon" style="' + grad(a.colors) + '">' + a.glyph + '</div>' +
        '<div class="a-main">' +
          '<div class="a-name">' + esc(a.name) +
            (a.tag ? '<span class="a-badge">' + esc(a.tag) + '</span>' : '') + '</div>' +
          '<div class="a-sub">' + esc(a.dev) + ' · ' + (a.cat === 'game' ? 'Game' : 'App') + ' · ' + esc(a.genre) + '</div>' +
        '</div>' +
        '<div class="a-cell"><span class="a-label">Rating</span>' + a.rating.toFixed(1) + ' ★</div>' +
        '<div class="a-cell"><span class="a-label">Downloads</span>' + esc(a.downloads) + '</div>' +
        '<div class="a-cell"><span class="a-label">ID</span>' + esc(a.id) + '</div>' +
        '<div class="a-actions">' + (confirm
          ? '<span class="a-confirm">Delete?</span>' +
            '<button class="admin-btn danger" data-admin-del-confirm="' + a.id + '">Yes</button>' +
            '<button class="admin-btn" data-admin-del-cancel="' + a.id + '">No</button>'
          : '<button class="admin-btn" data-admin-edit="' + a.id + '">Edit</button>' +
            '<button class="admin-btn danger" data-admin-del="' + a.id + '">Delete</button>') +
        '</div>' +
      '</div>';
  }

  function adminRows() {
    var q = admin.q.trim().toLowerCase();
    var list = APPS.filter(function (a) {
      if (admin.cat !== 'all' && a.cat !== admin.cat) return false;
      if (!q) return true;
      return (a.name + ' ' + a.dev + ' ' + a.genre + ' ' + a.id).toLowerCase().indexOf(q) > -1;
    });
    if (!list.length) {
      return '<div class="admin-empty">' +
        '<div class="e-icon">🔎</div>' +
        '<h3>No apps match</h3><p>Try another search or add a new app.</p>' +
        '</div>';
    }
    return list.map(adminRow).join('');
  }

  function adminStatsHTML() {
    var games = APPS.filter(function (a) { return a.cat === 'game'; }).length;
    var installed = Object.keys(state.installed).filter(function (id) { return !!byId(id); }).length;
    return '' +
      '<div class="admin-stat"><div class="n">' + APPS.length + '</div><div class="l">Total apps</div></div>' +
      '<div class="admin-stat"><div class="n">' + games + '</div><div class="l">Games</div></div>' +
      '<div class="admin-stat"><div class="n">' + (APPS.length - games) + '</div><div class="l">Apps</div></div>' +
      '<div class="admin-stat"><div class="n">' + installed + '</div><div class="l">On this device</div></div>';
  }

  function refreshAdminList() {
    var listEl = document.getElementById('admin-list');
    if (listEl) listEl.innerHTML = adminRows();
    var countEl = document.getElementById('admin-count');
    if (countEl) countEl.textContent = APPS.length + (APPS.length === 1 ? ' app' : ' apps');
    var statsEl = document.getElementById('admin-stats');
    if (statsEl) statsEl.innerHTML = adminStatsHTML();
  }

  function adminView() {
    return '' +
      '<div class="admin-title">' +
        '<div>' +
          '<span class="admin-eyebrow">Store admin</span>' +
          '<h1>Manage apps</h1>' +
          '<p>Edit listings, add new apps or remove them. Changes are saved locally and synced securely with Firebase Cloud.</p>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<div class="cloud-status local" id="cloud-status" title="Firebase Cloud status">' +
            '<span class="cloud-dot"></span>' +
            '<span id="cloud-status-text">Local Mode</span>' +
          '</div>' +
          '<a class="btn-sm" href="index.html#/home">View store ↗</a>' +
        '</div>' +
      '</div>' +

      '<div class="admin-stats" id="admin-stats">' +
        adminStatsHTML() +
      '</div>' +

      '<div class="admin-toolbar">' +
        '<div class="admin-search">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.5 19.1 16.9 15.5a7.5 7.5 0 1 0-1.4 1.4l3.6 3.6a1 1 0 0 0 1.4-1.4ZM10 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/></svg>' +
          '<input id="admin-q" type="search" placeholder="Search by name, developer, genre or ID" value="' + esc(admin.q) + '" autocomplete="off">' +
        '</div>' +
        '<select id="admin-cat" aria-label="Filter by type">' +
          '<option value="all"' + (admin.cat === 'all' ? ' selected' : '') + '>All types</option>' +
          '<option value="game"' + (admin.cat === 'game' ? ' selected' : '') + '>Games</option>' +
          '<option value="app"' + (admin.cat === 'app' ? ' selected' : '') + '>Apps</option>' +
        '</select>' +
        '<span class="admin-count" id="admin-count">' + APPS.length + (APPS.length === 1 ? ' app' : ' apps') + '</span>' +
        '<button class="btn-sm primary admin-add" data-admin-add>+ Add app</button>' +
      '</div>' +

      '<div class="admin-list" id="admin-list">' + adminRows() + '</div>' +

      '<div class="admin-danger">' +
        '<h3>Danger zone</h3>' +
        '<p>Reset the catalog to its original listings, or clear which apps are installed on this device.</p>' +
        '<div class="admin-danger-actions">' +
          '<button class="btn-sm danger" data-admin-reset>Reset catalog</button>' +
          '<button class="btn-sm danger" data-admin-clear>Clear installed apps</button>' +
        '</div>' +
      '</div>' +
      '<p class="admin-note">All content is fictional. Edits are stored in this browser only.</p>';
  }

  /* ---------------- app form modal ---------------- */
  function appFormHTML(app, isNew) {
    var genreSource = (typeof GENRES !== 'undefined' ? GENRES : []).concat(APPS.map(function (a) { return a.genre; }));
    var genreOptions = genreSource.filter(function (g, i, arr) {
      return arr.indexOf(g) === i;
    });
    var tag = app.tag || '';

    return '' +
      '<div class="admin-modal" id="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">' +
        '<div class="admin-panel">' +
          '<div class="admin-panel-head">' +
            '<h2 id="admin-modal-title">' + (isNew ? 'Add a new app' : 'Edit ' + esc(app.name)) + '</h2>' +
            '<button class="icon-btn" data-admin-close aria-label="Close">✕</button>' +
          '</div>' +
          '<form id="app-form">' +
            '<div class="form-preview">' +
              '<div class="pv-icon" id="pv-icon" style="' + grad(app.colors) + '">' + app.glyph + '</div>' +
              '<div><div class="pv-name" id="pv-name">' + esc(app.name || 'App name') + '</div>' +
              '<div class="pv-sub" id="pv-sub">' + esc(app.dev || 'Developer') + '</div></div>' +
            '</div>' +
            '<div class="form-grid">' +
              '<label>App name *<input name="name" type="text" maxlength="48" required value="' + esc(app.name) + '"></label>' +
              '<label>Developer *<input name="dev" type="text" maxlength="48" required value="' + esc(app.dev) + '"></label>' +
              '<label>Type<select name="cat">' +
                '<option value="app"' + (app.cat === 'app' ? ' selected' : '') + '>App</option>' +
                '<option value="game"' + (app.cat === 'game' ? ' selected' : '') + '>Game</option>' +
              '</select></label>' +
              '<label>Genre<input name="genre" type="text" list="genre-options" maxlength="32" value="' + esc(app.genre) + '">' +
                '<datalist id="genre-options">' + genreOptions.map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist>' +
              '</label>' +
              '<label>Icon emoji<input name="glyph" type="text" maxlength="8" value="' + esc(app.glyph) + '"></label>' +
              '<label>Size<input name="size" type="text" maxlength="16" value="' + esc(app.size) + '" placeholder="e.g. 42 MB"></label>' +
              '<label>Downloads<input name="downloads" type="text" maxlength="16" value="' + esc(app.downloads) + '" placeholder="e.g. 10M+"></label>' +
              '<label>Age rating<select name="age">' +
                ['Everyone', 'Everyone 10+', '12+', '16+', '18+'].map(function (age) {
                  return '<option value="' + age + '"' + (app.age === age ? ' selected' : '') + '>' + age + '</option>';
                }).join('') +
              '</select></label>' +
              '<label>Rating (0–5)<input name="rating" type="number" min="0" max="5" step="0.1" value="' + app.rating + '"></label>' +
              '<label>Review count<input name="reviews" type="number" min="0" step="100" value="' + app.reviews + '"></label>' +
              '<label>Colour 1<input name="c1" type="color" value="' + hexOr(app.colors[0], '#1a73e8') + '"></label>' +
              '<label>Colour 2<input name="c2" type="color" value="' + hexOr(app.colors[1], '#34a853') + '"></label>' +
              '<label>Badge<select name="tag">' +
                [['', 'None'], ["Editor's Choice", "Editor's Choice"], ['Top charts', 'Top charts'], ['New', 'New']].map(function (t) {
                  return '<option value="' + esc(t[0]) + '"' + (tag === t[0] ? ' selected' : '') + '>' + t[1] + '</option>';
                }).join('') +
              '</select></label>' +
              '<label class="check"><input name="featured" type="checkbox"' + (app.featured ? ' checked' : '') + '> Featured on the home page</label>' +
              '<label class="wide">Short tagline<input name="blurb" type="text" maxlength="120" value="' + esc(app.blurb) + '" placeholder="One line shown under the title"></label>' +
              '<label class="wide">Description<textarea name="desc" rows="6" placeholder="Describe what the app does…">' + esc(app.desc) + '</textarea></label>' +
            '</div>' +
            '<div class="admin-panel-foot">' +
              '<span class="form-error" id="form-error"></span>' +
              '<button type="button" class="btn-sm" data-admin-close>Cancel</button>' +
              '<button type="submit" class="btn-sm primary">' + (isNew ? 'Create app' : 'Save changes') + '</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>';
  }

  function closeAppForm() {
    var el = document.getElementById('admin-modal');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove('no-scroll');
  }

  function openAppForm(id) {
    var existing = id ? byId(id) : null;
    var isNew = !existing;
    var seed = existing ? JSON.parse(JSON.stringify(existing)) : blankApp();
    closeAppForm();

    var host = document.createElement('div');
    host.innerHTML = appFormHTML(seed, isNew);
    host = host.firstElementChild;
    document.body.appendChild(host);
    document.body.classList.add('no-scroll');

    var form = host.querySelector('#app-form');
    var pvIcon = host.querySelector('#pv-icon');
    var pvName = host.querySelector('#pv-name');
    var pvSub = host.querySelector('#pv-sub');
    var errEl = host.querySelector('#form-error');

    function field(n) { return form.querySelector('[name="' + n + '"]'); }

    function syncPreview() {
      pvIcon.textContent = field('glyph').value.trim() || '📦';
      pvIcon.style.background = 'linear-gradient(135deg,' +
        hexOr(field('c1').value, '#1a73e8') + ',' + hexOr(field('c2').value, '#34a853') + ')';
      pvName.textContent = field('name').value.trim() || 'App name';
      pvSub.textContent = field('dev').value.trim() || 'Developer';
    }
    form.addEventListener('input', syncPreview);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.textContent = '';
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var fd = new FormData(form);
      var name = String(fd.get('name') || '').trim();
      var dev = String(fd.get('dev') || '').trim();
      if (!name || !dev) {
        errEl.textContent = 'Name and developer are both required.';
        return;
      }
      var rating = parseFloat(fd.get('rating'));
      rating = isNaN(rating) ? 0 : Math.round(Math.min(5, Math.max(0, rating)) * 10) / 10;
      var reviews = parseInt(fd.get('reviews'), 10);
      reviews = isNaN(reviews) ? 0 : Math.max(0, reviews);

      var payload = {
        name: name,
        dev: dev,
        cat: fd.get('cat') === 'game' ? 'game' : 'app',
        genre: String(fd.get('genre') || '').trim() || 'Productivity',
        glyph: String(fd.get('glyph') || '').trim() || '📦',
        colors: [hexOr(fd.get('c1'), '#1a73e8'), hexOr(fd.get('c2'), '#34a853')],
        rating: rating,
        reviews: reviews,
        downloads: String(fd.get('downloads') || '').trim() || '1K+',
        size: String(fd.get('size') || '').trim() || '20 MB',
        age: String(fd.get('age') || 'Everyone'),
        tag: fd.get('tag') ? String(fd.get('tag')) : null,
        featured: fd.get('featured') === 'on',
        blurb: String(fd.get('blurb') || '').trim(),
        desc: String(fd.get('desc') || '').trim()
      };
      if (!payload.blurb) {
        payload.blurb = payload.desc.split('\n')[0].slice(0, 110) || ('A new ' + payload.cat + ' on the store.');
      }
      if (!payload.desc) payload.desc = payload.blurb;

      if (isNew) {
        payload.id = uniqueId(name);
        APPS.unshift(normalizeApp(payload));
      } else {
        for (var i = 0; i < APPS.length; i++) {
          if (APPS[i].id === existing.id) {
            APPS[i] = normalizeApp(Object.assign({}, APPS[i], payload));
            break;
          }
        }
      }

      saveCatalog();
      if (typeof ModiflixFirebase !== 'undefined' && ModiflixFirebase.isCloudAvailable()) {
        ModiflixFirebase.saveApp(isNew ? APPS[0] : payload).catch(function (err) {
          console.warn('[Modiflix Firebase] Note: Saved locally. Cloud sync message:', err.message);
        });
      }
      closeAppForm();
      toast(isNew ? 'Added “' + name + '”' : 'Updated “' + name + '”');
      refreshAdminList();
    });

    host.addEventListener('click', function (e) {
      if (e.target === host) closeAppForm();
    });

    setTimeout(function () { field('name').focus(); }, 40);
  }

  function deleteApp(id) {
    var name = null;
    for (var i = 0; i < APPS.length; i++) {
      if (APPS[i].id === id) { name = APPS[i].name; APPS.splice(i, 1); break; }
    }
    if (name === null) return;
    delete state.installed[id];
    saveInstalled();
    saveCatalog();
    if (typeof ModiflixFirebase !== 'undefined' && ModiflixFirebase.isCloudAvailable()) {
      ModiflixFirebase.deleteApp(id).catch(function (err) {
        console.warn('[Modiflix Firebase] Note: Deleted locally. Cloud sync message:', err.message);
      });
    }
    admin.deleting = null;
    toast('Removed “' + name + '”');
    refreshAdminList();
  }

  function resetCatalog() {
    if (!window.confirm('Reset the catalog to its original listings? All your edits will be lost.')) return;
    APPS.length = 0;
    JSON.parse(JSON.stringify(DEFAULTS)).forEach(function (a) { APPS.push(a); });
    try { localStorage.removeItem(CATALOG_KEY); } catch (e) {}
    if (typeof ModiflixFirebase !== 'undefined' && ModiflixFirebase.isCloudAvailable()) {
      ModiflixFirebase.syncAllApps(DEFAULTS).catch(function () {});
    }
    admin.deleting = null;
    toast('Catalog reset to defaults');
    refreshAdminList();
  }

  function clearInstalled() {
    if (!window.confirm('Remove all installed apps from this device? The listings stay in the store.')) return;
    state.installed = {};
    try { localStorage.removeItem('gp_installed'); } catch (e) {}
    toast('Installed apps cleared');
    refreshAdminList();
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-admin-add]')) { openAppForm(null); return; }

    var editBtn = e.target.closest('[data-admin-edit]');
    if (editBtn) { openAppForm(editBtn.getAttribute('data-admin-edit')); return; }

    var delBtn = e.target.closest('[data-admin-del]');
    if (delBtn) {
      admin.deleting = delBtn.getAttribute('data-admin-del');
      refreshAdminList();
      clearTimeout(admin.delTimer);
      admin.delTimer = setTimeout(function () {
        if (admin.deleting) { admin.deleting = null; refreshAdminList(); }
      }, 5000);
      return;
    }

    var delYes = e.target.closest('[data-admin-del-confirm]');
    if (delYes) {
      clearTimeout(admin.delTimer);
      deleteApp(delYes.getAttribute('data-admin-del-confirm'));
      return;
    }

    var delNo = e.target.closest('[data-admin-del-cancel]');
    if (delNo) {
      clearTimeout(admin.delTimer);
      admin.deleting = null;
      refreshAdminList();
      return;
    }

    if (e.target.closest('[data-admin-reset]')) { resetCatalog(); return; }
    if (e.target.closest('[data-admin-clear]')) { clearInstalled(); return; }
    if (e.target.closest('[data-admin-close]')) { closeAppForm(); return; }
  });

  /* admin toolbar filters */
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'admin-q') {
      admin.q = e.target.value;
      refreshAdminList();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'admin-cat') {
      admin.cat = e.target.value;
      refreshAdminList();
    }
  });

  /* theme */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#131314' : '#ffffff');
    try { localStorage.setItem('gp_theme', t); } catch (e) {}
  }

  var savedTheme = 'light';
  try { savedTheme = localStorage.getItem('gp_theme') || 'light'; } catch (e) {}
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* topbar scroll state */
  if (topbar) {
    window.addEventListener('scroll', function () {
      topbar.classList.toggle('scrolled', window.scrollY > 4);
    }, { passive: true });
  }

  /* keyboard shortcut */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('admin-modal')) {
      closeAppForm();
    }
  });

  /* sync if updated in another tab */
  window.addEventListener('storage', function (e) {
    if (e.key === CATALOG_KEY || e.key === 'gp_installed') {
      try {
        state.installed = JSON.parse(localStorage.getItem('gp_installed') || '{}') || {};
      } catch (err) {}
      loadSavedCatalog();
      refreshAdminList();
    }
  });

  /* cloud sync */
  function updateCloudStatus(status) {
    var badge = document.getElementById('cloud-status');
    var text = document.getElementById('cloud-status-text');
    if (!badge || !text) return;
    badge.className = 'cloud-status ' + (status.cloudOnline ? 'cloud' : 'local');
    text.textContent = status.cloudOnline ? 'Cloud Synced' : 'Local Mode';
  }

  function initCloudSync() {
    if (typeof ModiflixFirebase === 'undefined') return;

    ModiflixFirebase.onStatusChange(updateCloudStatus);

    if (ModiflixFirebase.isCloudAvailable()) {
      ModiflixFirebase.subscribeCatalog(function (cloudApps) {
        if (cloudApps && cloudApps.length) {
          APPS.length = 0;
          cloudApps.forEach(function (a) { APPS.push(normalizeApp(a)); });
          saveCatalog();
          refreshAdminList();
        }
      });
    }
  }

  /* render admin view */
  view.innerHTML = adminView();
  document.title = 'Store admin — Modiflix';
  initCloudSync();

  /* expose for debugging */
  window.MODIFLIX_ADMIN = { admin: admin, refresh: refreshAdminList };
})();
