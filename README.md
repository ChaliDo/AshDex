# AshDex v5 Cloud MVP

GitHub/Netlify-ready static Firebase application. No npm build is required.

## Before opening the app
1. Firebase Console > Firestore Database > Rules.
2. Replace the rules with the contents of `firestore.rules`, then Publish.
3. Firebase Console > Authentication > Settings > Authorized domains.
4. Add the final Netlify domain, such as `your-site.netlify.app`.

## Deploy
Upload the repository folder to GitHub and connect it to Netlify, or drag this entire folder into Netlify Deploy manually.

## Included in this MVP
- Google sign-in
- Per-user cloud collection
- Offline Firestore cache where supported
- Trainer code
- Signed-in friend lookup with live cloud data
- Private user document and read-only public friend profile
