/* Modiflix — client app */
(function () {
  'use strict';

  var view = document.getElementById('view');
  var searchBox = document.getElementById('search');
  var searchInput = document.getElementById('search-input');
  var suggest = document.getElementById('suggest');
  var tabs = document.getElementById('tabs');
  var toastEl = document.getElementById('toast');
  var themeMeta = document.getElementById('theme-color');

  var CONDITION = false;

  var state = {
    installed: {},
    installing: {},
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

  loadSavedCatalog();

  /* ---------------- utils ---------------- */
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function grad(colors) { return 'background:linear-gradient(135deg,' + colors[0] + ',' + colors[1] + ')'; }
  function fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(n);
  }
  function hashStr(s) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function stars(rating) {
    var full = Math.round(rating);
    var out = '';
    for (var i = 1; i <= 5; i++) out += i <= full ? '★' : '☆';
    return out;
  }
  function byId(id) {
    return APPS.filter(function (a) { return a.id === id; })[0] ||
      MOVIES.filter(function (m) { return m.id === id; })[0] ||
      BOOKS.filter(function (b) { return b.id === id; })[0] || null;
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
  function saveInstalled() {
    try { localStorage.setItem('gp_installed', JSON.stringify(state.installed)); } catch (e) {}
  }

  var STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
  var DOWNLOAD_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v9.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.4L11 13.6V4a1 1 0 0 1 1-1ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"/></svg>';

  /* ---------------- cards ---------------- */
  function appCard(app) {
    return '' +
      '<a class="app-card" href="#/app/' + app.id + '">' +
        '<div class="icon" style="' + grad(app.colors) + '">' + app.glyph + '</div>' +
        '<div class="name">' + esc(app.name) + '</div>' +
        '<div class="dev">' + esc(app.dev) + '</div>' +
        '<div class="meta"><span class="star"><b>' + app.rating.toFixed(1) + '</b></span><span>·</span><span>Free</span></div>' +
      '</a>';
  }

  function chartCard(app, i) {
    var up = i % 3 !== 2;
    return '' +
      '<a class="chart-card" href="#/app/' + app.id + '">' +
        '<span class="chart-rank">' + (i + 1) + '</span>' +
        '<div class="icon" style="' + grad(app.colors) + '">' + app.glyph + '</div>' +
        '<div class="chart-body">' +
          '<div class="name">' + esc(app.name) + '</div>' +
          '<div class="dev">' + esc(app.dev) + '</div>' +
          '<div class="meta"><span class="star"><b>' + app.rating.toFixed(1) + '</b></span> · ' + app.downloads + '</div>' +
        '</div>' +
        '<span class="chart-move">' + (up ? '▲ ' + (2 + (i % 4)) : '▼ ' + (1 + (i % 3))) + '</span>' +
      '</a>';
  }

  function posterCard(m) {
    return '' +
      '<a class="poster-card" href="#/app/' + m.id + '">' +
        '<div class="poster" style="' + grad(m.colors) + '">' +
          '<div class="p-glyph">' + m.glyph + '</div>' +
          '<div><div class="p-title">' + esc(m.title) + '</div>' +
          '<div class="p-sub">' + esc(m.studio) + '</div></div>' +
          '<div class="poster-play">▶</div>' +
        '</div>' +
        '<div class="name">' + esc(m.title) + '</div>' +
        '<div class="meta">' + m.year + ' · ' + m.price + '</div>' +
      '</a>';
  }

  function bookCard(b) {
    return '' +
      '<a class="book-card" href="#/app/' + b.id + '">' +
        '<div class="book" style="' + grad(b.colors) + '">' +
          '<div class="b-glyph">' + b.glyph + '</div>' +
          '<div><div class="b-title">' + esc(b.title) + '</div>' +
          '<div class="b-author">' + esc(b.author) + '</div></div>' +
        '</div>' +
        '<div class="name">' + esc(b.title) + '</div>' +
        '<div class="meta">' + esc(b.author) + ' · ' + b.price + '</div>' +
      '</a>';
  }

  function heroCard(app) {
    return '' +
      '<a class="hero-card" style="' + grad(app.colors) + '" href="#/app/' + app.id + '">' +
        '<div class="hero-glyph">' + app.glyph + '</div>' +
        '<span class="hero-badge">' + esc(app.tag || 'Featured') + '</span>' +
        '<h3>' + esc(app.name) + '</h3>' +
        '<p>' + esc(app.blurb) + '</p>' +
        '<div class="hero-meta"><span>' + app.rating.toFixed(1) + ' ★</span><span class="dot">·</span><span>' + app.downloads + ' downloads</span><span class="dot">·</span><span>Free</span></div>' +
      '</a>';
  }

  function rowWrap(inner, label) {
    return '' +
      '<div class="row-wrap">' +
        '<button class="row-arrow" data-dir="left" aria-label="Scroll left">‹</button>' +
        '<div class="row" aria-label="' + esc(label || '') + '">' + inner + '</div>' +
        '<button class="row-arrow" data-dir="right" aria-label="Scroll right">›</button>' +
      '</div>';
  }

  function section(title, inner, href, label) {
    return '' +
      '<section>' +
        '<div class="sec-head"><h2>' + title + '</h2>' +
        (href ? '<a class="see-all" href="' + href + '">' + (label || 'See more') + ' ›</a>' : '') +
        '</div>' + inner +
      '</section>';
  }

  function genreChips(list, active, base) {
    base = base || 'games';
    var chips = ['<button class="chip' + (!active ? ' active' : '') + '" data-genre="" data-browse="' + base + '">All</button>'];
    list.forEach(function (g) {
      chips.push('<button class="chip' + (active === g ? ' active' : '') + '" data-genre="' + esc(g) + '" data-browse="' + base + '">' + esc(g) + '</button>');
    });
    return '<div class="chip-row">' + chips.join('') + '</div>';
  }

  function categoryTiles() {
    var items = [
      ['Action', '🎯', ['#ff512f', '#dd2476']],
      ['Puzzle', '🧩', ['#00b09b', '#96e6a1']],
      ['Racing', '🏁', ['#1565ff', '#00d4ff']],
      ['Role playing', '🐉', ['#ff6b00', '#c2185b']],
      ['Strategy', '♟️', ['#3f51b5', '#9c27b0']],
      ['Simulation', '🏡', ['#56ab2f', '#a8e063']]
    ];
    return '<div class="cat-grid">' + items.map(function (it) {
      return '<a class="cat-tile" style="' + grad(it[2]) + '" href="#/games?genre=' + encodeURIComponent(it[0]) + '">' +
        '<span>' + it[0] + '</span><i>' + it[1] + '</i></a>';
    }).join('') + '</div>';
  }

  /* ---------------- views ---------------- */
  function homeView() {
    if (!APPS.length) {
      return '<div class="empty" style="padding:80px 20px">' +
        '<div class="e-icon">🗂️</div><h3>The store is empty</h3>' +
        '<p>Add your first app from the store admin.</p>' +
        '<a class="chip active" href="#/admin">Open store admin</a></div>';
    }
    var featured = APPS.filter(function (a) { return a.featured; }).slice(0, 3);
    if (!featured.length) featured = APPS.slice(0, 3);
    var charts = APPS.slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 10);
    var fresh = APPS.filter(function (a) { return a.tag === 'New'; });
    var picks = [
      'photolab', 'wordwizard', 'sketchy', 'tinytown', 'vault', 'chatter', 'skyward', 'recipebox',
      'dragonrealm', 'notescloud', 'sleepwaves', 'hoopsarena'
    ].map(byId).filter(Boolean);

    return '' +
      '<div class="hero-row">' + featured.map(heroCard).join('') + '</div>' +
      section('Top charts', rowWrap(charts.map(chartCard).join(''), 'Top charts'), '#/apps') +
      section('New &amp; updated', rowWrap(fresh.concat(APPS.filter(function (a) { return a.tag === "Editor's Choice"; })).slice(0, 8).map(appCard).join(''), 'New and updated'), '#/apps') +
      section('Recommended for you', '<div class="grid">' + picks.map(appCard).join('') + '</div>', '#/apps') +
      section('Browse games by category', categoryTiles(), '#/games') +
      section('Great on your phone',
        rowWrap(['vault', 'skyweather', 'codepad', 'fittrack', 'tunein', 'wander', 'studdy', 'mapmyride']
          .map(byId).filter(Boolean).map(appCard).join(''), 'Great on your phone'), '#/apps');
  }

  function browseView(kind, genre) {
    var cat = kind === 'games' ? 'game' : 'app';
    var all = APPS.filter(function (a) { return a.cat === cat; });
    if (!all.length) {
      return '<div class="empty" style="padding:70px 20px"><div class="e-icon">🗂️</div>' +
        '<h3>No ' + (kind === 'games' ? 'games' : 'apps') + ' yet</h3>' +
        '<p>Add one from the store admin to see it here.</p>' +
        '<a class="chip active" href="#/admin">Open store admin</a></div>';
    }
    var list = genre ? all.filter(function (a) { return a.genre === genre; }) : all;
    var sortByReviews = list.slice().sort(function (a, b) { return b.reviews - a.reviews; });
    var featured = all.filter(function (a) { return a.featured; }).slice(0, 3);
    if (!featured.length) featured = all.slice(0, 3);
    var title = kind === 'games' ? 'Games' : 'Apps';
    var genreList = GENRES.filter(function (g) {
      return all.some(function (a) { return a.genre === g; });
    });

    var out = '';
    if (!genre) {
      out += '<div class="hero-row">' + featured.map(heroCard).join('') + '</div>';
    }
    out += '<div class="page-title"><h1>' + title + (genre ? ' · ' + esc(genre) : '') + '</h1>' +
      '<p>' + (genre ? list.length + ' ' + (kind === 'games' ? 'games' : 'apps') + ' in ' + esc(genre) : 'Everything you need, all in one place') + '</p></div>';
    out += genreChips(genreList, genre || '', kind);
    if (!genre) {
      out += section('Top ' + (kind === 'games' ? 'games' : 'apps'), rowWrap(sortByReviews.slice(0, 10).map(chartCard).join(''), 'Top charts'));
    }
    out += section(genre ? 'All ' + esc(genre) : 'All ' + (kind === 'games' ? 'games' : 'apps'),
      '<div class="grid">' + sortByReviews.map(appCard).join('') + '</div>');
    out += section('You might also like',
      rowWrap(all.filter(function (a) { return list.indexOf(a) === -1; }).concat(all).slice(0, 8).map(appCard).join(''), 'Suggestions'));
    return out;
  }

  function moviesView() {
    return '<div class="page-title"><h1>Movies &amp; TV</h1><p>Rent or buy the latest releases</p></div>' +
      section('New releases', rowWrap(MOVIES.slice(0, 6).map(posterCard).join(''), 'New releases')) +
      section('Top rentals', rowWrap(MOVIES.slice().sort(function (a, b) { return b.rating - a.rating; }).map(posterCard).join(''), 'Top rentals')) +
      section('Continue watching', '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr))">' +
        MOVIES.slice(2, 6).map(function (m) {
          return '<a class="poster-card" style="width:auto;margin:0" href="#/app/' + m.id + '">' +
            '<div class="poster" style="' + grad(m.colors) + ';aspect-ratio:16/9">' +
            '<div class="p-glyph" style="font-size:30px">' + m.glyph + '</div>' +
            '<div><div class="p-title" style="font-size:14px">' + esc(m.title) + '</div>' +
            '<div class="p-sub">' + m.year + ' · ' + m.price + '</div></div></div></a>';
        }).join('') + '</div>');
  }

  function booksView() {
    return '<div class="page-title"><h1>Books</h1><p>Read on your phone, tablet or the web</p></div>' +
      section('Top picks', '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">' +
        BOOKS.map(bookCard).join('') + '</div>') +
      section('New this week', rowWrap(BOOKS.slice(4).concat(BOOKS.slice(0, 4)).map(bookCard).join(''), 'New this week')) +
      section('Audiobooks', rowWrap(BOOKS.slice().reverse().map(bookCard).join(''), 'Audiobooks'));
  }

  function searchView(q) {
    if (!q) {
      return '<div class="page-title"><h1>Search</h1><p>Find apps, games, films and books</p></div>' +
        section('Trending searches', '<div class="chip-row">' +
          ['Photo editing', 'Puzzle games', 'Note taking', 'Racing', 'Sleep sounds', 'Recipes'].map(function (t) {
            return '<button class="chip" data-search="' + esc(t) + '">' + esc(t) + '</button>';
          }).join('') + '</div>') +
        section('Top charts', rowWrap(APPS.slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 8).map(chartCard).join(''), 'Top charts')) +
        section('Browse categories', categoryTiles());
    }
    var needle = q.toLowerCase();
    var apps = APPS.filter(function (a) {
      return (a.name + ' ' + a.dev + ' ' + a.genre + ' ' + a.blurb + ' ' + a.desc).toLowerCase().indexOf(needle) > -1;
    });
    var movies = MOVIES.filter(function (m) {
      return (m.title + ' ' + m.studio).toLowerCase().indexOf(needle) > -1;
    });
    var books = BOOKS.filter(function (b) {
      return (b.title + ' ' + b.author).toLowerCase().indexOf(needle) > -1;
    });
    var total = apps.length + movies.length + books.length;

    var out = '<div class="page-title"><h1>Results for “' + esc(q) + '”</h1>' +
      '<p>' + total + (total === 1 ? ' result' : ' results') + '</p></div>';
    if (!total) {
      out += '<div class="empty"><div class="e-icon">🔍</div><h3>No results found</h3>' +
        '<p>Try a different app name, developer or category.</p>' +
        '<a class="chip active" href="#/home">Back to home</a></div>';
      return out;
    }
    if (apps.length) out += section('Apps &amp; games', '<div class="grid">' + apps.map(appCard).join('') + '</div>');
    if (movies.length) out += section('Movies &amp; TV', '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">' + movies.map(posterCard).join('') + '</div>');
    if (books.length) out += section('Books', '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">' + books.map(bookCard).join('') + '</div>');
    return out;
  }

  function libraryView() {
    var ids = Object.keys(state.installed).filter(function (id) {
      return !!state.installed[id] && byId(id) && byId(id).cat;
    });
    ids.sort(function (a, b) { return (state.installed[b] || 0) - (state.installed[a] || 0); });

    var out = '<div class="page-title"><h1>My apps</h1><p>' +
      (ids.length ? ids.length + (ids.length === 1 ? ' app installed' : ' apps installed') + ' on this device' : 'Apps you install will show up here') +
      ' · <a class="admin-link" href="#/admin">Store admin</a>' +
      '</p></div>';

    if (!ids.length) {
      out += '<div class="empty"><div class="e-icon">📥</div><h3>Nothing installed yet</h3>' +
        '<p>Browse the store and install something to see it here.</p>' +
        '<a class="chip active" href="#/apps">Browse apps</a></div>';
    } else {
      out += '<div class="lib-list">' + ids.map(function (id) {
        var a = byId(id);
        return '<div class="lib-row">' +
          '<div class="icon" style="' + grad(a.colors) + '">' + a.glyph + '</div>' +
          '<div class="lib-body"><div class="name">' + esc(a.name) + '</div>' +
          '<div class="sub">' + esc(a.dev) + ' · ' + a.size + '</div></div>' +
          '<div class="lib-actions">' +
          (hashStr(a.id) % 2 === 0
            ? '<button class="btn-sm" data-update="' + a.id + '">Update</button>'
            : '') +
          '<button class="btn-sm primary" data-open="' + a.id + '">Open</button>' +
          '</div></div>';
      }).join('') + '</div>';
      out += section('Recommended for you', '<div class="grid">' +
        APPS.filter(function (a) { return ids.indexOf(a.id) === -1; }).slice(0, 6).map(appCard).join('') + '</div>');
    }
    return out;
  }

  /* ---------------- admin ---------------- */
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

  function refreshAdminList() {
    var listEl = document.getElementById('admin-list');
    if (listEl) listEl.innerHTML = adminRows();
    var countEl = document.getElementById('admin-count');
    if (countEl) countEl.textContent = APPS.length + (APPS.length === 1 ? ' app' : ' apps');
  }

  function adminView() {
    var games = APPS.filter(function (a) { return a.cat === 'game'; }).length;
    var installed = Object.keys(state.installed).filter(function (id) { return !!byId(id); }).length;

    return '' +
      '<div class="admin-title">' +
        '<div>' +
          '<span class="admin-eyebrow">Store admin</span>' +
          '<h1>Manage apps</h1>' +
          '<p>Edit listings, add new apps or remove them. Changes are saved on this device and appear in the store right away.</p>' +
        '</div>' +
        '<a class="btn-sm" href="#/home">View store ↗</a>' +
      '</div>' +

      '<div class="admin-stats">' +
        '<div class="admin-stat"><div class="n">' + APPS.length + '</div><div class="l">Total apps</div></div>' +
        '<div class="admin-stat"><div class="n">' + games + '</div><div class="l">Games</div></div>' +
        '<div class="admin-stat"><div class="n">' + (APPS.length - games) + '</div><div class="l">Apps</div></div>' +
        '<div class="admin-stat"><div class="n">' + installed + '</div><div class="l">On this device</div></div>' +
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
        '<span class="admin-count" id="admin-count">' + APPS.length + ' apps</span>' +
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

  function appFormHTML(app, isNew) {
    var genreOptions = GENRES.concat(APPS.map(function (a) { return a.genre; })).filter(function (g, i, arr) {
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
      closeAppForm();
      toast(isNew ? 'Added “' + name + '”' : 'Updated “' + name + '”');
      render({ keepScroll: true });
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
    admin.deleting = null;
    toast('Removed “' + name + '”');
    render({ keepScroll: true });
  }

  function resetCatalog() {
    if (!window.confirm('Reset the catalog to its original listings? All your edits will be lost.')) return;
    APPS.length = 0;
    JSON.parse(JSON.stringify(DEFAULTS)).forEach(function (a) { APPS.push(a); });
    try { localStorage.removeItem(CATALOG_KEY); } catch (e) {}
    admin.deleting = null;
    toast('Catalog reset to defaults');
    render({ keepScroll: true });
  }

  function clearInstalled() {
    if (!window.confirm('Remove all installed apps from this device? The listings stay in the store.')) return;
    state.installed = {};
    try { localStorage.removeItem('gp_installed'); } catch (e) {}
    toast('Installed apps cleared');
    render({ keepScroll: true });
  }


  function reviewsFor(app) {
    var h = hashStr(app.id);
    var list = [];
    var n = 3;
    for (var i = 0; i < n; i++) {
      var r = h + i * 37;
      var person = REVIEWERS[r % REVIEWERS.length];
      var text = REVIEW_TEXTS[(r * 3 + i) % REVIEW_TEXTS.length];
      var rating = i === 0 ? 5 : (i === 1 ? 4 : (h % 2 ? 4 : 5));
      var helpful = 8 + (r % 380);
      list.push({
        name: person[0],
        color: person[1],
        rating: rating,
        text: text,
        helpful: helpful,
        when: ['2 days ago', 'last week', '3 weeks ago'][i]
      });
    }
    return list;
  }

  function distFor(app) {
    var r = app.rating;
    var five = Math.round((r / 5) * 100);
    five = Math.min(92, Math.max(45, five));
    var four = Math.round((100 - five) * 0.55);
    var three = Math.round((100 - five - four) * 0.6);
    var two = Math.round((100 - five - four - three) * 0.6);
    var one = 100 - five - four - three - two;
    return [five, four, three, two, one];
  }

  function shotHTML(app, i) {
    var heights = [46, 72, 58, 88, 64];
    var c1 = app.colors[i % app.colors.length];
    var c2 = app.colors[(i + 1) % app.colors.length];
    var bars = '';
    for (var k = 0; k < 5; k++) {
      bars += '<i style="height:' + (heights[(k + i) % heights.length]) + '%"></i>';
    }
    return '<div class="shot" style="background:linear-gradient(160deg,' + c1 + ',' + c2 + ')">' +
      '<div class="shot-inner" style="color:' + c1 + '">' +
        '<div class="shot-glyph">' + app.glyph + '</div>' +
        '<div class="shot-line w80"></div>' +
        '<div class="shot-line w60"></div>' +
        '<div class="shot-line w40"></div>' +
        '<div class="shot-chips"><i></i><i></i><i></i></div>' +
        '<div class="shot-bars">' + bars + '</div>' +
      '</div>' +
    '</div>';
  }

  function detailView(app) {
    var installed = !!state.installed[app.id];
    var similar = APPS.filter(function (a) {
      return a.id !== app.id && (a.genre === app.genre || a.cat === app.cat);
    }).slice(0, 8);
    var reviews = reviewsFor(app);
    var dist = distFor(app);
    var h = hashStr(app.id);
    var updated = ['12 Feb 2026', '28 Jan 2026', '3 Mar 2026'][h % 3];
    var version = 'Varies with device';

    var distBars = dist.map(function (pct, i) {
      return '<div class="bar-row"><span style="width:10px">' + (5 - i) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span style="width:26px;text-align:right">' + pct + '%</span></div>';
    }).join('');

    var reviewCards = reviews.map(function (r) {
      return '<div class="review">' +
        '<div class="review-head">' +
          '<span class="review-avatar" style="background:' + r.color + '">' + r.name.charAt(0) + '</span>' +
          '<div><div class="review-name">' + esc(r.name) + '</div>' +
          '<div class="review-stars"><b>' + r.rating + '</b>' + stars(r.rating) + '</div></div>' +
        '</div>' +
        '<p>' + esc(r.text) + '</p>' +
        '<div class="review-foot"><span>' + r.when + '</span>' +
          '<button data-helpful>' + r.helpful + ' people found this helpful</button></div>' +
      '</div>';
    }).join('');

    return '' +
      '<a class="back" href="#/' + (app.cat === 'game' ? 'games' : 'apps') + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>' + (app.cat === 'game' ? 'Games' : 'Apps') + '</a>' +

      '<div class="detail-head">' +
        '<div class="detail-icon" style="' + grad(app.colors) + '">' + app.glyph + '</div>' +
        '<div class="detail-title">' +
          '<h1>' + esc(app.name) + '</h1>' +
          '<div class="detail-sub">' + esc(app.dev) + '</div>' +
          '<div class="detail-tagline">' + esc(app.blurb) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="detail-stats">' +
        '<div class="stat"><span class="big">' + app.rating.toFixed(1) + ' <span style="width:13px;height:13px;display:inline-block">' + STAR_SVG + '</span></span><span class="small">' + fmt(app.reviews) + ' reviews</span></div>' +
        '<div class="stat"><span class="big">' + app.downloads + '</span><span class="small">' + DOWNLOAD_SVG + ' Downloads</span></div>' +
        '<div class="stat"><span class="big">' + app.age + '</span><span class="small">Rated for ' + app.age + '</span></div>' +
        '<div class="stat"><span class="big">' + app.size + '</span><span class="small">App size</span></div>' +
      '</div>' +

      '<div class="install-wrap">' +
        '<button class="install-btn' + (installed ? ' installed' : '') + '" data-install="' + app.id + '">' +
          '<span>' + (installed ? 'Open' : 'Install') + '</span></button>' +
        '<div class="install-note">' + DOWNLOAD_SVG +
          '<span>' + (installed ? 'Installed · ' + app.size : 'Free · In-app purchases available') + '</span></div>' +
      '</div>' +

      '<div class="shots">' + [0, 1, 2, 3].map(function (i) { return shotHTML(app, i); }).join('') + '</div>' +

      '<div class="detail-cols">' +
        '<div>' +
          '<div class="block-title"><h2>About this ' + (app.cat === 'game' ? 'game' : 'app') + '</h2></div>' +
          '<div class="about-text clamp" id="about">' + esc(app.desc) + '</div>' +
          '<button class="read-more" data-readmore>Read more</button>' +
          '<div class="tags">' + ['#' + app.genre.toLowerCase().replace(/\s+/g, ''), '#' + (app.cat === 'game' ? 'games' : 'apps'), '#offline'] .map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +

          '<div class="block-title" style="margin-top:36px"><h2>Ratings and reviews</h2></div>' +
          '<div class="ratings-card">' +
            '<div class="big-score"><div class="n">' + app.rating.toFixed(1) + '</div>' +
              '<div class="stars">' + stars(app.rating) + '</div>' +
              '<div class="count">' + fmt(app.reviews) + ' reviews</div></div>' +
            '<div class="bars">' + distBars + '</div>' +
          '</div>' +
          '<div class="reviews">' + reviewCards + '</div>' +
          '<div class="block-title"><a href="#/app/' + app.id + '">See all reviews</a></div>' +
        '</div>' +

        '<div>' +
          '<div class="block-title"><h2>App info</h2></div>' +
          '<div class="info-list">' +
            '<div class="info-item"><div class="k">Updated on</div><div class="v">' + updated + '</div></div>' +
            '<div class="info-item"><div class="k">Size</div><div class="v">' + app.size + '</div></div>' +
            '<div class="info-item"><div class="k">Installs</div><div class="v">' + app.downloads + '</div></div>' +
            '<div class="info-item"><div class="k">Current version</div><div class="v">' + version + '</div></div>' +
            '<div class="info-item"><div class="k">Requires Android</div><div class="v">8.0 and up</div></div>' +
            '<div class="info-item"><div class="k">Content rating</div><div class="v">' + app.age + '</div></div>' +
            '<div class="info-item"><div class="k">Developer</div><div class="v">' + esc(app.dev) + '<br><span style="color:var(--blue)">support@' + app.id + '.example</span></div></div>' +
          '</div>' +
          '<div class="safety"><h3>Data safety</h3>' +
            '<p>This developer declares how your data is collected, shared and secured. Data is encrypted in transit and you can request deletion.</p>' +
            '<a href="#/app/' + app.id + '">Learn more</a></div>' +
          '<div class="safety"><h3>Ratings and reviews</h3>' +
            '<p>Reviews are from verified installs. Ratings are shown for all users on this device family.</p></div>' +
        '</div>' +
      '</div>' +

      section('Similar ' + (app.cat === 'game' ? 'games' : 'apps'), rowWrap(similar.map(appCard).join(''), 'Similar'));
  }

  function mediaView(item) {
    var isMovie = !!item.studio;
    var isBook = !!item.author;
    var kind = isMovie ? 'Movies & TV' : 'Books';
    var back = isMovie ? 'movies' : 'books';
    var meta = isMovie
      ? item.year + ' · ' + item.rating.toFixed(1) + ' ★ · ' + item.price
      : item.pages + ' pages · ' + item.rating.toFixed(1) + ' ★ · ' + item.price;
    var cast = isMovie
      ? ['Director', 'Screenplay', 'Studio', 'Runtime']
      : ['Author', 'Publisher', 'Language', 'Pages'];
    var vals = isMovie
      ? ['A. Mercer', 'J. Okada', item.studio, '1h 52m']
      : [item.author, 'Northwind Press', 'English', item.pages + ' pages'];

    var similar = (isMovie ? MOVIES : BOOKS).filter(function (x) { return x.id !== item.id; }).slice(0, 6);

    return '' +
      '<a class="back" href="#/' + back + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>' + kind + '</a>' +
      '<div class="detail-head">' +
        '<div class="detail-icon" style="' + grad(item.colors) + ';font-size:56px">' + item.glyph + '</div>' +
        '<div class="detail-title">' +
          '<h1>' + esc(item.title || item.name) + '</h1>' +
          '<div class="detail-sub">' + esc(isMovie ? item.studio : item.author) + '</div>' +
          '<div class="detail-tagline">' + meta + '</div>' +
          '<div class="install-wrap">' +
            '<button class="install-btn" data-buy="' + item.id + '"><span>' + (isMovie ? 'Rent now' : 'Buy now') + '</span></button>' +
            '<div class="install-note">' + item.price + ' · Watch or read anywhere</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-cols" style="margin-top:24px">' +
        '<div>' +
          '<div class="block-title"><h2>' + (isMovie ? 'About this film' : 'About this book') + '</h2></div>' +
          '<div class="about-text">' + esc(isMovie
            ? 'A ' + item.studio + ' production. Available in up to 4K HDR, with subtitles and dubbing in 20 languages. Rentals are available for 30 days, and once started you have 48 hours to finish watching.\n\nThis title is part of the ' + item.studio + ' collection on Modiflix.'
            : 'From ' + item.author + ', this title is available to read on your phone, tablet or the web. Your place is synced across devices automatically, and you can download it for offline reading.\n\nPublished by Northwind Press. ' + item.pages + ' pages.') + '</div>' +
          '<div class="tags">' + ['#new', isMovie ? '#film' : '#book', isMovie ? '#4k' : '#ebook'].map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="block-title"><h2>Details</h2></div>' +
          '<div class="info-list">' + cast.map(function (k, i) {
            return '<div class="info-item"><div class="k">' + k + '</div><div class="v">' + esc(vals[i]) + '</div></div>';
          }).join('') + '</div>' +
          '<div class="safety"><h3>Availability</h3><p>Streaming and reading are available in your region.</p></div>' +
        '</div>' +
      '</div>' +
      section('More like this', rowWrap(similar.map(isMovie ? posterCard : bookCard).join(''), 'More like this'));
  }

  /* ---------------- install ---------------- */
  function startInstall(id, btn) {
    if (!!state.installed[id]) {
      var a = byId(id);
      toast('Opening ' + (a ? (a.name || a.title) : 'app') + '…');
      return;
    }
    if (state.installing[id]) return;
    state.installing[id] = true;
    btn.disabled = true;
    btn.classList.remove('installed');
    btn.innerHTML = '<div class="progress"></div><span>Downloading…</span>';
    var bar = btn.querySelector('.progress');
    var label = btn.querySelector('span');
    var pct = 0;
    var timer = setInterval(function () {
      pct = Math.min(100, pct + 4 + Math.random() * 12);
      if (bar) bar.style.width = pct + '%';
      if (label) {
        label.textContent = pct < 55 ? 'Downloading… ' + Math.round(pct) + '%'
          : pct < 96 ? 'Installing…'
          : 'Almost done…';
      }
      if (pct >= 100) {
        clearInterval(timer);
        delete state.installing[id];
        state.installed[id] = Date.now();
        saveInstalled();
        var item = byId(id);
        toast((item && item.name ? item.name : 'App') + ' installed');
        render({ keepScroll: true });
      }
    }, 220);
  }

  /* ---------------- search ---------------- */
  function hideSuggest() {
    suggest.hidden = true;
    suggest.innerHTML = '';
  }

  function updateSuggest() {
    var q = searchInput.value.trim().toLowerCase();
    if (!q) { hideSuggest(); return; }
    var matches = APPS.filter(function (a) {
      return (a.name + ' ' + a.dev).toLowerCase().indexOf(q) > -1;
    }).slice(0, 4);
    var media = MOVIES.concat(BOOKS).filter(function (m) {
      return ((m.title || '') + ' ' + (m.studio || m.author || '')).toLowerCase().indexOf(q) > -1;
    }).slice(0, 2);
    var rows = matches.map(function (a) {
      return '<a href="#/app/' + a.id + '" data-suggest>' +
        '<span class="s-icon" style="' + grad(a.colors) + '">' + a.glyph + '</span>' +
        '<span><span class="s-name">' + esc(a.name) + '</span><br><span class="s-sub">' + esc(a.dev) + '</span></span>' +
        '<span class="s-kind">' + (a.cat === 'game' ? 'Game' : 'App') + '</span></a>';
    }).concat(media.map(function (m) {
      return '<a href="#/app/' + m.id + '" data-suggest>' +
        '<span class="s-icon" style="' + grad(m.colors) + '">' + m.glyph + '</span>' +
        '<span><span class="s-name">' + esc(m.title) + '</span><br><span class="s-sub">' + esc(m.studio || m.author) + '</span></span>' +
        '<span class="s-kind">' + (m.studio ? 'Film' : 'Book') + '</span></a>';
    }));
    if (!rows.length) { hideSuggest(); return; }
    rows.push('<a href="#/search?q=' + encodeURIComponent(searchInput.value.trim()) + '" data-suggest style="color:var(--green);font-weight:500;font-size:13px">See all results for “' + esc(searchInput.value.trim()) + '”</a>');
    suggest.innerHTML = rows.join('');
    suggest.hidden = false;
  }

  /* ---------------- router ---------------- */
  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    return {
      seg: parts[0].split('/').filter(Boolean),
      q: new URLSearchParams(parts[1] || '')
    };
  }

  function render(opts) {
    opts = opts || {};
    var r = parseHash();
    var page = r.seg[0] || 'home';
    var html = '';
    var tab = page;
    var title = 'Modiflix';

    if (page === 'app' && r.seg[1]) {
      var item = byId(r.seg[1]);
      if (!item) {
        html = '<div class="empty"><div class="e-icon">🕵️</div><h3>Not found</h3><p>That item is no longer in the store.</p><a class="chip active" href="#/home">Go home</a></div>';
      } else if (item.cat) {
        html = detailView(item);
        tab = item.cat === 'game' ? 'games' : 'apps';
        title = item.name + ' – Modiflix';
      } else {
        html = mediaView(item);
        tab = item.studio ? 'movies' : 'books';
        title = item.title + ' – Modiflix';
      }
    } else if (page === 'games' || page === 'apps') {
      html = browseView(page, r.q.get('genre') || '');
      title = (page === 'games' ? 'Games' : 'Apps') + ' – Modiflix';
    } else if (page === 'movies') {
      html = moviesView();
      title = 'Movies & TV – Modiflix';
    } else if (page === 'books') {
      html = booksView();
      title = 'Books – Modiflix';
    } else if (page === 'search') {
      var q = r.q.get('q') || '';
      if (q && q !== searchInput.value) searchInput.value = q;
      html = searchView(q);
      title = q ? '“' + q + '” – Modiflix' : 'Search – Modiflix';
    } else if (page === 'library') {
      html = libraryView();
      title = 'My apps – Modiflix';
    } else if (page === 'admin') {
      html = adminView();
      title = 'Store admin';
    } else {
      html = homeView();
      page = 'home';
      tab = 'home';
      title = 'Modiflix – Apps, Games & more';
    }

    view.innerHTML = html;
    document.title = title;

    /* active tabs */
    $$('[data-tab]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-tab') === tab);
    });
    searchBox.classList.toggle('has-value', !!searchInput.value);
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var install = e.target.closest('[data-install]');
    if (install) { startInstall(install.getAttribute('data-install'), install); return; }

    var buy = e.target.closest('[data-buy]');
    if (buy) {
      var item = byId(buy.getAttribute('data-buy'));
      toast((item.studio ? 'Rental' : 'Purchase') + ' started for ' + item.title + ' — demo only');
      return;
    }

    var open = e.target.closest('[data-open]');
    if (open) {
      var o = byId(open.getAttribute('data-open'));
      toast('Opening ' + o.name + '…');
      return;
    }

    var upd = e.target.closest('[data-update]');
    if (upd) {
      var u = byId(upd.getAttribute('data-update'));
      upd.textContent = 'Updating…';
      upd.disabled = true;
      setTimeout(function () {
        toast(u.name + ' updated');
        render({ keepScroll: true });
      }, 1400);
      return;
    }

    /* ----- admin actions ----- */
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

    var arrow = e.target.closest('.row-arrow');
    if (arrow) {
      var wrap = arrow.closest('.row-wrap');
      var row = wrap && wrap.querySelector('.row');
      if (row) row.scrollBy({ left: arrow.getAttribute('data-dir') === 'left' ? -520 : 520, behavior: 'smooth' });
      return;
    }

    var chip = e.target.closest('[data-genre]');
    if (chip) {
      var g = chip.getAttribute('data-genre');
      var base = chip.getAttribute('data-browse') || 'games';
      location.hash = '#/' + base + (g ? '?genre=' + encodeURIComponent(g) : '');
      return;
    }

    var sChip = e.target.closest('[data-search]');
    if (sChip) {
      var term = sChip.getAttribute('data-search');
      searchInput.value = term;
      location.hash = '#/search?q=' + encodeURIComponent(term);
      render();
      return;
    }

    var rm = e.target.closest('[data-readmore]');
    if (rm) {
      var about = document.getElementById('about');
      if (about) {
        var clamped = about.classList.toggle('clamp');
        rm.textContent = clamped ? 'Read more' : 'Read less';
      }
      return;
    }

    var helpful = e.target.closest('[data-helpful]');
    if (helpful) {
      helpful.textContent = 'Thanks for your feedback';
      helpful.disabled = true;
      return;
    }

    if (e.target.closest('[data-suggest]')) {
      searchInput.value = '';
      searchBox.classList.remove('has-value');
      hideSuggest();
    }
  });

  searchInput.addEventListener('input', function () {
    searchBox.classList.toggle('has-value', !!searchInput.value);
    updateSuggest();
  });
  searchInput.addEventListener('focus', updateSuggest);
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var q = searchInput.value.trim();
      hideSuggest();
      searchInput.blur();
      location.hash = q ? '#/search?q=' + encodeURIComponent(q) : '#/search';
      render();
    } else if (e.key === 'Escape') {
      hideSuggest();
      searchInput.blur();
    }
  });

  document.getElementById('search-clear').addEventListener('click', function () {
    searchInput.value = '';
    searchBox.classList.remove('has-value');
    hideSuggest();
    searchInput.focus();
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

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#search')) hideSuggest();
  });

  /* theme */
  var themeBtn = document.getElementById('theme-btn');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeMeta.setAttribute('content', t === 'dark' ? '#131314' : '#ffffff');
    try { localStorage.setItem('gp_theme', t); } catch (e) {}
  }
  var savedTheme = 'light';
  try { savedTheme = localStorage.getItem('gp_theme') || 'light'; } catch (e) {}
  applyTheme(savedTheme);
  themeBtn.addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* header scroll state */
  var topbar = document.getElementById('topbar');
  window.addEventListener('scroll', function () {
    topbar.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  /* keyboard shortcut */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('admin-modal')) {
      closeAppForm();
      return;
    }
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  window.addEventListener('hashchange', function () {
    closeAppForm();
    render();
  });

  /* boot */
  if (!location.hash) location.hash = '#/home';
  render();

  /* expose for debugging */
  window.MODIFLIX = { state: state, render: render };
})();
