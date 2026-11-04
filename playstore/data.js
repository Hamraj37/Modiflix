/* Catalog data for the Play Store clone */

const APPS = [
  // ---------------- Games ----------------
  {
    id: 'pixelforge', name: 'PixelForge', dev: 'Lumen Labs', cat: 'game', genre: 'Action',
    glyph: '🎮', colors: ['#6a3ef5', '#e83e8c'], rating: 4.6, reviews: 1284000,
    downloads: '50M+', size: '68 MB', age: '12+', featured: true, tag: "Editor's Choice",
    blurb: 'Forge your own pixel hero and battle through hand-crafted worlds.',
    desc: 'PixelForge is a fast, fluid action platformer built around creativity. Design your hero pixel by pixel, unlock dozens of weapons, and take on weekly community levels.\n\nEvery run is different: procedural dungeons, daily quests and a friendly guild system keep the adventure fresh. Play offline, sync your progress across devices, and compete on global leaderboards.'
  },
  {
    id: 'skyward', name: 'Skyward Racer', dev: 'Vortex Studio', cat: 'game', genre: 'Racing',
    glyph: '🏎️', colors: ['#1565ff', '#00d4ff'], rating: 4.4, reviews: 892000,
    downloads: '10M+', size: '142 MB', age: 'Everyone', featured: true, tag: 'Top charts',
    blurb: 'Drift through neon skylines at 300 km/h.',
    desc: 'Skyward Racer puts you behind the wheel of hypercars on tracks suspended above the clouds. Master drifts, chain boosts and race friends in real time.\n\nIncludes a full career mode, 60+ cars to tune, and cross-platform multiplayer races every weekend.'
  },
  {
    id: 'dragonrealm', name: 'Dragon Realm', dev: 'Mythic Games', cat: 'game', genre: 'Role playing',
    glyph: '🐉', colors: ['#ff6b00', '#c2185b'], rating: 4.7, reviews: 2450000,
    downloads: '100M+', size: '1.2 GB', age: '12+', featured: true, tag: 'Top charts',
    blurb: 'Raise a dragon, build a kingdom, rule the realm.',
    desc: 'An open-world fantasy RPG with hundreds of hours of story. Hatch and raise dragons, ally with rival houses, and defend your kingdom in massive siege battles.\n\nNew chapters arrive every month, and the world map expands with each season.'
  },
  {
    id: 'bubblepop', name: 'Bubble Pop Saga', dev: 'Tasty Games', cat: 'game', genre: 'Puzzle',
    glyph: '🫧', colors: ['#00b09b', '#96e6a1'], rating: 4.5, reviews: 5120000,
    downloads: '500M+', size: '94 MB', age: 'Everyone', featured: false, tag: 'Top charts',
    blurb: 'Pop, match and blast through 5,000 levels.',
    desc: 'Bubble Pop Saga is the cosy puzzler everyone is talking about. Match bubbles, trigger combos and rescue the bubbles\' friends across a colourful map.\n\nNo lives to wait for — play as much as you like, offline or online.'
  },
  {
    id: 'starcolony', name: 'Star Colony', dev: 'Nova Interactive', cat: 'game', genre: 'Strategy',
    glyph: '🚀', colors: ['#3f51b5', '#9c27b0'], rating: 4.3, reviews: 214000,
    downloads: '5M+', size: '310 MB', age: 'Everyone 10+', featured: false, tag: null,
    blurb: 'Build a colony on a hostile alien world.',
    desc: 'Manage resources, terraform the surface and keep your colonists alive through dust storms and meteor showers. A deep strategy sim with a gentle learning curve.\n\nPlay solo campaigns or challenge friends in asynchronous multiplayer.'
  },
  {
    id: 'kitchenfrenzy', name: 'Kitchen Frenzy', dev: 'Onion Studio', cat: 'game', genre: 'Simulation',
    glyph: '🍳', colors: ['#f7971e', '#ffd200'], rating: 4.5, reviews: 741000,
    downloads: '20M+', size: '120 MB', age: 'Everyone', featured: false, tag: 'New',
    blurb: 'Cook, serve and upgrade your way to a five-star diner.',
    desc: 'Take orders, flip burgers and race the dinner rush in this addictive cooking sim. Upgrade your kitchen, hire staff and unlock recipes from around the world.\n\nWeekly events and seasonal menus keep the kitchen hot.'
  },
  {
    id: 'shadowninja', name: 'Shadow Ninja', dev: 'Swift Pixel', cat: 'game', genre: 'Action',
    glyph: '🥷', colors: ['#232526', '#414345'], rating: 4.2, reviews: 1100000,
    downloads: '50M+', size: '220 MB', age: '16+', featured: false, tag: null,
    blurb: 'A stealth action adventure in a rain-soaked city.',
    desc: 'Move through the shadows, chain wall-runs and take down targets without raising an alarm. A stylish stealth game with a hand-drawn comic story.\n\nIncludes a level editor and monthly challenge contracts.'
  },
  {
    id: 'wordwizard', name: 'Word Wizard', dev: 'Brainy Apps', cat: 'game', genre: 'Word',
    glyph: '🔤', colors: ['#11998e', '#38ef7d'], rating: 4.6, reviews: 431000,
    downloads: '10M+', size: '38 MB', age: 'Everyone', featured: false, tag: 'New',
    blurb: 'A daily word puzzle that trains your brain.',
    desc: 'Guess the hidden word in six tries, build streaks and learn new words with a friendly wizard. Thousands of puzzles, plus a head-to-head duel mode.\n\nA calm, ad-light word game you can play in a minute or an hour.'
  },
  {
    id: 'galaxyquest', name: 'Galaxy Quest', dev: 'Nova Interactive', cat: 'game', genre: 'Adventure',
    glyph: '🌌', colors: ['#0f0c29', '#6a11cb'], rating: 4.4, reviews: 388000,
    downloads: '5M+', size: '480 MB', age: 'Everyone 10+', featured: false, tag: null,
    blurb: 'Chart unknown systems in a gorgeous space odyssey.',
    desc: 'Explore a procedurally generated galaxy, trade with alien species and upgrade your ship. Discovery is rewarded: every planet you scan fills in the galactic atlas.\n\nA relaxed narrative adventure with no timers and no ads.'
  },
  {
    id: 'hoopsarena', name: 'Hoops Arena', dev: 'Court Side', cat: 'game', genre: 'Sports',
    glyph: '🏀', colors: ['#ff512f', '#dd2476'], rating: 4.3, reviews: 523000,
    downloads: '10M+', size: '260 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Fast 3-on-3 street basketball with real physics.',
    desc: 'Build a squad, master trick shots and take on the world in 3-on-3 street ball. Short matches, deep progression and satisfying physics.\n\nSeason passes add new courts, kits and moves.'
  },
  {
    id: 'tinytown', name: 'Tiny Town', dev: 'Cozy Pixel', cat: 'game', genre: 'Simulation',
    glyph: '🏘️', colors: ['#56ab2f', '#a8e063'], rating: 4.5, reviews: 902000,
    downloads: '50M+', size: '156 MB', age: 'Everyone', featured: false, tag: 'New',
    blurb: 'Build the cosiest little town on the internet.',
    desc: 'Place homes, plant gardens and invite neighbours over. Tiny Town is a slow, gentle builder with no failure states and no ads.\n\nShare your town with friends and visit theirs.'
  },
  {
    id: 'zombierush', name: 'Zombie Rush', dev: 'Dark Room', cat: 'game', genre: 'Action',
    glyph: '🧟', colors: ['#4b6f44', '#1d2b1a'], rating: 4.1, reviews: 1890000,
    downloads: '100M+', size: '340 MB', age: '16+', featured: false, tag: null,
    blurb: 'Survive the night. Then do it again.',
    desc: 'Run, shoot and scavenge through a city overrun by the undead. Every night is harder than the last.\n\nTeam up with friends in co-op survival and unlock dozens of weapons.'
  },

  // ---------------- Apps ----------------
  {
    id: 'notescloud', name: 'Notes Cloud', dev: 'CloudKit', cat: 'app', genre: 'Productivity',
    glyph: '📝', colors: ['#f5af19', '#f12711'], rating: 4.5, reviews: 3120000,
    downloads: '100M+', size: '42 MB', age: 'Everyone', featured: true, tag: "Editor's Choice",
    blurb: 'Notes, lists and ideas that sync everywhere.',
    desc: 'Write notes, keep lists and clip the web in a clean, fast editor. Everything syncs instantly to every device, and works offline.\n\nMarkdown support, folders, reminders and end-to-end encrypted sharing.'
  },
  {
    id: 'photolab', name: 'PhotoLab', dev: 'Prism Inc', cat: 'app', genre: 'Photography',
    glyph: '📸', colors: ['#8e2de2', '#4a00e0'], rating: 4.7, reviews: 6230000,
    downloads: '500M+', size: '88 MB', age: 'Everyone', featured: true, tag: 'Top charts',
    blurb: 'Pro photo editing, one tap away.',
    desc: 'PhotoLab brings film-grade colour, portrait retouching and one-tap presets to your phone. Non-destructive editing means you never lose the original.\n\nIncludes AI object removal, sky replacement and a community preset gallery.'
  },
  {
    id: 'fittrack', name: 'FitTrack', dev: 'MoveWell', cat: 'app', genre: 'Health & Fitness',
    glyph: '🏃', colors: ['#00c6ff', '#0072ff'], rating: 4.4, reviews: 1200000,
    downloads: '10M+', size: '64 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Track workouts, steps and sleep in one place.',
    desc: 'FitTrack turns your phone into a complete fitness tracker. Log runs, strength sessions and sleep, and see clear trends over time.\n\nWorks with Wear OS and most fitness bands. No account required.'
  },
  {
    id: 'wander', name: 'Wander', dev: 'Atlas Labs', cat: 'app', genre: 'Travel',
    glyph: '🧭', colors: ['#f12711', '#f5af19'], rating: 4.6, reviews: 540000,
    downloads: '50M+', size: '72 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Plan trips, save places and explore like a local.',
    desc: 'Build day-by-day itineraries, save places from anywhere and download maps for offline use. Wander suggests hidden gems based on what you love.\n\nShare trips with friends and split costs in the built-in planner.'
  },
  {
    id: 'budgetbee', name: 'Budget Bee', dev: 'Hive Apps', cat: 'app', genre: 'Finance',
    glyph: '🐝', colors: ['#f7971e', '#ffd200'], rating: 4.3, reviews: 214000,
    downloads: '5M+', size: '35 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'A budget that actually sticks.',
    desc: 'Set envelopes, track spending automatically and get a friendly nudge before you overspend. Your data stays encrypted on your device.\n\nSupports multiple currencies and shared household budgets.'
  },
  {
    id: 'tunein', name: 'Tune In', dev: 'SoundWave', cat: 'app', genre: 'Music & Audio',
    glyph: '🎧', colors: ['#ee0979', '#ff6a00'], rating: 4.5, reviews: 4230000,
    downloads: '100M+', size: '76 MB', age: 'Everyone', featured: false, tag: 'Top charts',
    blurb: 'Millions of tracks, podcasts and live radio.',
    desc: 'Stream your favourite music, discover weekly mixes and follow podcasts in one app. Downloads for offline listening are included.\n\nLossless audio on supported devices, plus a sleep timer and equalizer.'
  },
  {
    id: 'chatter', name: 'Chatter', dev: 'Bluebird', cat: 'app', genre: 'Communication',
    glyph: '💬', colors: ['#00b4db', '#0083b0'], rating: 4.2, reviews: 8120000,
    downloads: '1B+', size: '58 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Simple, private messaging for everyone.',
    desc: 'Send messages, photos and voice notes with end-to-end encryption. Groups, reactions and disappearing messages included.\n\nNo ads, no data selling — just fast chat that works on any connection.'
  },
  {
    id: 'recipebox', name: 'Recipe Box', dev: 'Kitchen Co', cat: 'app', genre: 'Lifestyle',
    glyph: '🥗', colors: ['#43cea2', '#185a9d'], rating: 4.6, reviews: 388000,
    downloads: '10M+', size: '54 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Save recipes, plan meals, shop smarter.',
    desc: 'Import recipes from any site, build a weekly meal plan and generate a shopping list automatically. Step-by-step cooking mode keeps your screen awake.\n\nThousands of curated recipes for every diet.'
  },
  {
    id: 'skyweather', name: 'Sky Weather', dev: 'Meteo Labs', cat: 'app', genre: 'Weather',
    glyph: '⛅', colors: ['#2193b0', '#6dd5ed'], rating: 4.4, reviews: 962000,
    downloads: '50M+', size: '28 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Hyper-local forecasts, minute by minute.',
    desc: 'Rain radar, hourly forecasts and severe weather alerts for your exact location. Beautiful widgets for your home screen.\n\nNo ads, and forecasts are available offline once loaded.'
  },
  {
    id: 'codepad', name: 'CodePad', dev: 'Loop Software', cat: 'app', genre: 'Productivity',
    glyph: '💻', colors: ['#141e30', '#243b55'], rating: 4.7, reviews: 164000,
    downloads: '5M+', size: '46 MB', age: 'Everyone', featured: false, tag: "Editor's Choice",
    blurb: 'A pocket editor for quick scripts and snippets.',
    desc: 'CodePad is a fast code editor with syntax highlighting for 40+ languages, git integration and an offline playground for HTML, CSS and JS.\n\nPerfect for reviewing a pull request or jotting down an idea on the go.'
  },
  {
    id: 'dreamjournal', name: 'Dream Journal', dev: 'Night Owl', cat: 'app', genre: 'Lifestyle',
    glyph: '🌙', colors: ['#2c3e50', '#8e44ad'], rating: 4.5, reviews: 87000,
    downloads: '1M+', size: '22 MB', age: 'Everyone', featured: false, tag: 'New',
    blurb: 'Capture dreams before they fade.',
    desc: 'A quiet place to record dreams the moment you wake up. Add tags, moods and voice notes, then look back at patterns over time.\n\nPasscode lock keeps your journal private.'
  },
  {
    id: 'petpal', name: 'Pet Pal', dev: 'Paw Prints', cat: 'app', genre: 'Lifestyle',
    glyph: '🐶', colors: ['#f7971e', '#e65c00'], rating: 4.3, reviews: 210000,
    downloads: '10M+', size: '48 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Health records and reminders for your pets.',
    desc: 'Keep vaccinations, vet visits and medication schedules for every pet in one place. Set reminders and share records with your vet.\n\nIncludes a weight tracker and a lost-pet alert network.'
  },
  {
    id: 'studdy', name: 'Study Buddy', dev: 'LearnLoop', cat: 'app', genre: 'Education',
    glyph: '📚', colors: ['#654ea3', '#eaafc8'], rating: 4.6, reviews: 640000,
    downloads: '20M+', size: '66 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Flashcards, focus timers and study plans.',
    desc: 'Turn any notes into flashcards, build spaced-repetition decks and stay on track with a focus timer. Study Buddy also shares decks with your class.\n\nWorks offline, and syncs when you are back online.'
  },
  {
    id: 'vault', name: 'Vault', dev: 'Secure Co', cat: 'app', genre: 'Tools',
    glyph: '🔐', colors: ['#134e5e', '#71b280'], rating: 4.8, reviews: 720000,
    downloads: '50M+', size: '31 MB', age: 'Everyone', featured: false, tag: 'Top charts',
    blurb: 'A simple, private password manager.',
    desc: 'Store logins, cards and secure notes with end-to-end encryption. Autofill works in apps and browsers, and the built-in generator creates strong passwords.\n\nZero-knowledge design: only you can unlock your vault.'
  },
  {
    id: 'sketchy', name: 'Sketchy', dev: 'Inkwell', cat: 'app', genre: 'Art & Design',
    glyph: '🎨', colors: ['#fc466b', '#3f5efb'], rating: 4.7, reviews: 430000,
    downloads: '10M+', size: '92 MB', age: 'Everyone', featured: true, tag: 'New',
    blurb: 'Draw, paint and animate on your phone.',
    desc: 'Sketchy packs professional brushes, layers and animation tools into a touch-first canvas. Pressure support, colour palettes and timelapse recording are included.\n\nExport to PNG, PSD or MP4 whenever you are ready.'
  },
  {
    id: 'mapmyride', name: 'MapMyRide', dev: 'RouteWorks', cat: 'app', genre: 'Maps & Navigation',
    glyph: '🗺️', colors: ['#11998e', '#38ef7d'], rating: 4.2, reviews: 380000,
    downloads: '50M+', size: '84 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Plan better routes for bikes and hikes.',
    desc: 'Find quiet roads, bike lanes and trails, then follow turn-by-turn voice navigation offline. Record rides with elevation and speed graphs.\n\nWorks with most GPS watches and bike computers.'
  },
  {
    id: 'sleepwaves', name: 'Sleep Waves', dev: 'Night Owl', cat: 'app', genre: 'Health & Fitness',
    glyph: '😴', colors: ['#141e30', '#4b6cb7'], rating: 4.5, reviews: 265000,
    downloads: '5M+', size: '58 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Fall asleep to rain, waves and white noise.',
    desc: 'A library of calming soundscapes, mixed exactly how you like them. Sleep timers, fade-outs and gentle wake-up alarms included.\n\nDownload sounds for offline use on flights and trips.'
  },
  {
    id: 'chefstable', name: "Chef's Table", dev: 'Kitchen Co', cat: 'app', genre: 'Food & Drink',
    glyph: '🍕', colors: ['#d31027', '#ea384d'], rating: 4.4, reviews: 96000,
    downloads: '1M+', size: '40 MB', age: 'Everyone', featured: false, tag: null,
    blurb: 'Order from local kitchens, without the fees.',
    desc: 'Browse local restaurants, order for pickup or delivery, and track it live. Transparent pricing with no hidden service fees.\n\nReorder favourites in two taps and split the bill with friends.'
  }
];

const MOVIES = [
  { id: 'm-neon', title: 'Neon Horizon', studio: 'Parallax Pictures', glyph: '🌆', colors: ['#ff512f', '#dd2476'], rating: 4.5, year: 2025, price: 'Rent ₹149' },
  { id: 'm-abyss', title: 'Deep Abyss', studio: 'Bluewater Films', glyph: '🌊', colors: ['#000428', '#004e92'], rating: 4.2, year: 2024, price: 'Buy ₹499' },
  { id: 'm-orbit', title: 'Orbit 9', studio: 'Starline Studio', glyph: '🛰️', colors: ['#1a2a6c', '#b21f1f'], rating: 4.6, year: 2025, price: 'Rent ₹149' },
  { id: 'm-lantern', title: 'Paper Lanterns', studio: 'Meadow House', glyph: '🏮', colors: ['#f857a6', '#ff5858'], rating: 4.4, year: 2023, price: 'Buy ₹399' },
  { id: 'm-static', title: 'Static', studio: 'Night Shift', glyph: '📺', colors: ['#434343', '#000000'], rating: 3.9, year: 2024, price: 'Rent ₹99' },
  { id: 'm-solstice', title: 'Solstice', studio: 'Parallax Pictures', glyph: '🌞', colors: ['#f7971e', '#ffd200'], rating: 4.3, year: 2025, price: 'Rent ₹149' },
  { id: 'm-hollow', title: 'Hollow Creek', studio: 'Meadow House', glyph: '🌲', colors: ['#134e5e', '#71b280'], rating: 4.1, year: 2022, price: 'Buy ₹299' },
  { id: 'm-circuit', title: 'Circuit Breaker', studio: 'Starline Studio', glyph: '⚡', colors: ['#4776e6', '#8e54e9'], rating: 4.0, year: 2024, price: 'Rent ₹99' }
];

const BOOKS = [
  { id: 'b-dune', title: 'The Long Dune', author: 'Mira Voss', glyph: '🏜️', colors: ['#c79081', '#dfa579'], rating: 4.6, pages: 412, price: '₹299' },
  { id: 'b-code', title: 'Clean Code, Small Teams', author: 'Jonas Reed', glyph: '🧩', colors: ['#232526', '#414345'], rating: 4.8, pages: 288, price: '₹399' },
  { id: 'b-garden', title: 'The Midnight Garden', author: 'Elif Kaya', glyph: '🌿', colors: ['#093028', '#237a57'], rating: 4.4, pages: 336, price: '₹249' },
  { id: 'b-stars', title: 'Counting Stars', author: 'Mira Voss', glyph: '✨', colors: ['#0f0c29', '#6a11cb'], rating: 4.5, pages: 298, price: '₹279' },
  { id: 'b-bread', title: 'Salt, Flour, Water', author: 'Ana Ruiz', glyph: '🥖', colors: ['#f12711', '#f5af19'], rating: 4.3, pages: 224, price: '₹199' },
  { id: 'b-silence', title: 'A Quiet Signal', author: 'Tomas Lind', glyph: '📡', colors: ['#4b6cb7', '#182848'], rating: 4.2, pages: 364, price: '₹259' },
  { id: 'b-bloom', title: 'Bloom Season', author: 'Elif Kaya', glyph: '🌸', colors: ['#ee9ca7', '#ffdde1'], rating: 4.0, pages: 252, price: '₹179' },
  { id: 'b-atlas', title: 'Atlas of Small Things', author: 'Jonas Reed', glyph: '🗺️', colors: ['#43cea2', '#185a9d'], rating: 4.7, pages: 480, price: '₹449' }
];

const GENRES = ['Action', 'Puzzle', 'Racing', 'Role playing', 'Strategy', 'Simulation', 'Sports', 'Word', 'Adventure'];

const REVIEWERS = [
  ['Aarav S.', '#e57373'], ['Priya M.', '#64b5f6'], ['Daniel K.', '#81c784'],
  ['Sofia L.', '#ba68c8'], ['Marcus T.', '#ffb74d'], ['Yuki N.', '#4db6ac'],
  ['Elena R.', '#f06292'], ['Omar H.', '#9575cd'], ['Grace W.', '#4fc3f7'],
  ['Leo P.', '#aed581'], ['Nadia F.', '#ff8a65'], ['Sam D.', '#90a4ae']
];

const REVIEW_TEXTS = [
  'Exactly what I was looking for. Clean, fast and no annoying ads.',
  'Been using this for a few weeks now and it keeps getting better with every update.',
  'Great app overall. Would love a dark mode option but otherwise perfect.',
  'The latest update fixed the battery issue I had. Solid five stars now.',
  'Really well designed. Everything is where you expect it to be.',
  'Works perfectly offline, which is a lifesaver on my commute.',
  'A few small bugs here and there, but the team clearly cares about feedback.',
  'Honestly the best app in this category right now. Worth the space.',
  'Easy to learn and surprisingly deep once you get into it.',
  'Notifications are a bit much by default, but easy to turn off in settings.'
];

if (typeof module !== 'undefined') module.exports = { APPS, MOVIES, BOOKS, GENRES, REVIEWERS, REVIEW_TEXTS };
