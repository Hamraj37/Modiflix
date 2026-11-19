/* Modiflix — Firebase Secure Configuration & Service */
(function (global) {
  'use strict';

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // Securely frozen configuration: identified for client-side API requests
  var firebaseConfig = Object.freeze({
    apiKey: "AIzaSyAA1JB4R7l5t69PVLJeXu19Ne5lZxsZ9-0",
    authDomain: "modiflix-app.firebaseapp.com",
    projectId: "modiflix-app",
    storageBucket: "modiflix-app.firebasestorage.app",
    messagingSenderId: "427251971705",
    appId: "1:427251971705:web:a49620568f52e8799c86a8",
    measurementId: "G-ZKJK65NDT0"
  });

  var app = null;
  var db = null;
  var auth = null;
  var analytics = null;
  var isInitialized = false;
  var isCloudAvailable = false;
  var statusListeners = [];
  var currentStatus = {
    initialized: false,
    cloudOnline: false,
    authenticated: false,
    user: null,
    mode: 'local' // 'cloud' | 'local'
  };

  function notifyStatus() {
    statusListeners.forEach(function (fn) {
      try { fn(Object.assign({}, currentStatus)); } catch (e) {}
    });
  }

  /* Safe initialization */
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
      isInitialized = true;
      currentStatus.initialized = true;

      // Firestore
      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
        isCloudAvailable = true;
        currentStatus.cloudOnline = true;
        currentStatus.mode = 'cloud';

        // Enable offline cache if available
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch(function () {
            /* Persistence may fail if multiple tabs are active, fallback smoothly */
          });
        } catch (e) {}
      }

      // Authentication
      if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
        auth.onAuthStateChanged(function (u) {
          currentStatus.authenticated = !!u;
          currentStatus.user = u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null;
          notifyStatus();
        });
      }

      // Analytics
      if (typeof firebase.analytics === 'function' && firebaseConfig.measurementId) {
        try { analytics = firebase.analytics(); } catch (e) {}
      }
    } else {
      currentStatus.mode = 'local';
    }
  } catch (err) {
    console.warn('[Modiflix Firebase] Note: Running in local resilience mode.', err.message);
    currentStatus.mode = 'local';
  }

  /* Data sanitization to protect cloud database integrity */
  function sanitizeForFirestore(a) {
    if (!a || typeof a !== 'object') return null;
    return {
      id: String(a.id || '').replace(/[^\w-]/g, '').slice(0, 48),
      name: String(a.name || 'Untitled').replace(/[<>]/g, '').slice(0, 60),
      dev: String(a.dev || 'Unknown').replace(/[<>]/g, '').slice(0, 60),
      cat: a.cat === 'game' ? 'game' : 'app',
      genre: String(a.genre || 'Productivity').replace(/[<>]/g, '').slice(0, 40),
      glyph: String(a.glyph || '📦').slice(0, 8),
      colors: Array.isArray(a.colors) && a.colors.length >= 2
        ? [String(a.colors[0]), String(a.colors[1])]
        : ['#1a73e8', '#34a853'],
      rating: Math.min(5, Math.max(0, Number(a.rating) || 0)),
      reviews: Math.max(0, parseInt(a.reviews, 10) || 0),
      downloads: String(a.downloads || '1K+').slice(0, 16),
      size: String(a.size || '20 MB').slice(0, 16),
      age: String(a.age || 'Everyone').slice(0, 20),
      tag: a.tag ? String(a.tag).slice(0, 24) : null,
      featured: !!a.featured,
      blurb: String(a.blurb || '').replace(/[<>]/g, '').slice(0, 200),
      desc: String(a.desc || '').slice(0, 4000),
      updatedAt: Date.now()
    };
  }

  /* Public API */
  var ModiflixFirebase = {
    config: firebaseConfig,
    isInitialized: function () { return isInitialized; },
    isCloudAvailable: function () { return isCloudAvailable && !!db; },
    getApp: function () { return app; },
    getDb: function () { return db; },
    getAuth: function () { return auth; },
    getAnalytics: function () { return analytics; },
    getStatus: function () { return Object.assign({}, currentStatus); },
    onStatusChange: function (cb) {
      if (typeof cb === 'function') {
        statusListeners.push(cb);
        cb(Object.assign({}, currentStatus));
      }
    },

    /* Fetch all catalog apps from Firestore */
    fetchCatalog: function () {
      if (!db) return Promise.resolve(null);
      return db.collection('apps').get().then(function (snapshot) {
        if (snapshot.empty) return null;
        var list = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          if (data && data.name) {
            data.id = data.id || doc.id;
            list.push(data);
          }
        });
        return list.length ? list : null;
      }).catch(function (err) {
        console.warn('[Modiflix Firebase] Fetch notice (falling back to local):', err.message);
        currentStatus.cloudOnline = false;
        notifyStatus();
        return null;
      });
    },

    /* Save or update a single app */
    saveApp: function (appData) {
      if (!db) return Promise.resolve(false);
      var clean = sanitizeForFirestore(appData);
      if (!clean || !clean.id) return Promise.reject(new Error('Invalid app data'));
      return db.collection('apps').doc(clean.id).set(clean, { merge: true }).then(function () {
        return true;
      }).catch(function (err) {
        console.warn('[Modiflix Firebase] Cloud save notice:', err.message);
        throw err;
      });
    },

    /* Delete an app from Firestore */
    deleteApp: function (id) {
      if (!db || !id) return Promise.resolve(false);
      return db.collection('apps').doc(String(id)).delete().then(function () {
        return true;
      }).catch(function (err) {
        console.warn('[Modiflix Firebase] Cloud delete notice:', err.message);
        throw err;
      });
    },

    /* Sync an array of apps to Firestore (batch) */
    syncAllApps: function (appsList) {
      if (!db || !Array.isArray(appsList) || !appsList.length) return Promise.resolve(false);
      try {
        var batch = db.batch();
        appsList.forEach(function (a) {
          var clean = sanitizeForFirestore(a);
          if (clean && clean.id) {
            var ref = db.collection('apps').doc(clean.id);
            batch.set(ref, clean, { merge: true });
          }
        });
        return batch.commit().then(function () { return true; });
      } catch (err) {
        console.warn('[Modiflix Firebase] Batch sync notice:', err.message);
        return Promise.reject(err);
      }
    },

    /* Subscribe to realtime updates */
    subscribeCatalog: function (onUpdate, onError) {
      if (!db) return function () {};
      return db.collection('apps').onSnapshot(function (snapshot) {
        if (snapshot.empty) {
          if (typeof onUpdate === 'function') onUpdate(null);
          return;
        }
        var list = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          if (data && data.name) {
            data.id = data.id || doc.id;
            list.push(data);
          }
        });
        currentStatus.cloudOnline = true;
        notifyStatus();
        if (typeof onUpdate === 'function') onUpdate(list);
      }, function (err) {
        console.warn('[Modiflix Firebase] Realtime listener notice:', err.message);
        currentStatus.cloudOnline = false;
        notifyStatus();
        if (typeof onError === 'function') onError(err);
      });
    },

    /* Auth actions */
    signIn: function (email, password) {
      if (!auth) return Promise.reject(new Error('Firebase Auth is not available.'));
      return auth.signInWithEmailAndPassword(email, password);
    },
    signOut: function () {
      if (!auth) return Promise.resolve();
      return auth.signOut();
    },
    getCurrentUser: function () {
      return auth ? auth.currentUser : null;
    }
  };

  global.ModiflixFirebase = ModiflixFirebase;
})(typeof window !== 'undefined' ? window : this);
