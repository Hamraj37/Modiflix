# Firebase Security & Configuration Guide — Modiflix

This guide outlines how Firebase is integrated into Modiflix and the security measures applied to safeguard your project (`modiflix-app`).

---

## 1. Client-Side API Keys vs. Secrets

In Firebase, the `apiKey` within `firebaseConfig`:
- **Is an application identifier**, not a secret root credential.
- Is designed by Google to be embedded in web and mobile clients so they can identify your Firebase project to Google Cloud services.
- **Does NOT grant unrestricted database access**. Security is governed by **Firebase Security Rules** and **Google Cloud API Key Restrictions**.

---

## 2. Security Perimeter: Firestore Security Rules

To prevent unauthorized writes, deletions, or data pollution, deploy the included [`firestore.rules`](file:///c:/Users/Administrator/Modiflix/firestore.rules).

### How to Deploy

#### Option A: Using Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase use modiflix-app
firebase deploy --only firestore:rules
```

#### Option B: In the Firebase Console
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project **modiflix-app**.
3. Navigate to **Firestore Database** → **Rules**.
4. Paste the contents of `firestore.rules` and click **Publish**.

### Rules Structure

- **Public Read Access**: Anyone can view apps in the storefront (`allow read: if true;`).
- **Validated Writes**: Inbound app documents must satisfy `isValidApp()` (field length limits, valid categories `app` | `game`, valid ratings 0–5, array colors, and matching `appId`).
- **Admin Access**: When Firebase Authentication is enabled for your admin, update the write rule to enforce `request.auth != null`.

---

## 3. Google Cloud API Key Restrictions (Recommended)

To prevent other websites from using your API key:

1. Open the [Google Cloud Console API Credentials page](https://console.cloud.google.com/apis/credentials).
2. Select project **modiflix-app**.
3. Under **API Keys**, select **Browser key (auto created by Firebase)**.
4. Set **Application restrictions** to **Websites (HTTP referrers)** and add your authorized domains:
   - `http://localhost:*`
   - `http://127.0.0.1:*`
   - `https://modiflix-app.web.app/*`
   - `https://modiflix-app.firebaseapp.com/*`
   - `https://<your-username>.github.io/*` (or your production domain)
5. Set **API restrictions** to **Restrict key**:
   - Cloud Firestore API
   - Firebase Authentication API
   - Firebase Installations API
6. Click **Save**.

---

## 4. Authorized Domains in Firebase Authentication

1. In the [Firebase Console](https://console.firebase.google.com/), open **Authentication** → **Settings** → **Authorized domains**.
2. Verify that only your trusted domains (e.g., your GitHub Pages domain, custom domain, and localhost) are present.

---

## 5. Enable Firebase App Check (Anti-Abuse)

To protect your Cloud Firestore quota against automated bots and scrapers:
1. Go to **App Check** in the Firebase Console.
2. Register your web app using **reCAPTCHA v3** or **Cloudflare Turnstile**.
3. Enforce App Check on Cloud Firestore.

---

## 6. Offline & Local Storage Resilience

Modiflix implements a dual-layer storage strategy:
- **Instant Paint**: The app reads from `localStorage` immediately upon startup.
- **Cloud Sync**: `ModiflixFirebase` listens for real-time Firestore updates and syncs catalog modifications across all active tabs and devices.
- **Fail-Safe Fallback**: If Firebase is offline, blocked by an ad-blocker, or if network connectivity is lost, Modiflix continues to function seamlessly in local mode without error prompts or UI interruption.
