BETTER WORLD SCHOOL - PWA package (v12)
=======================================
Upload everything in this folder to the ROOT of your Netlify site. Keep the .well-known folder.

  index.html            the app (v12: email/password sign-in)
  manifest.json         app name, colours, icons
  sw.js                 service worker (do not rename)
  _headers              Netlify cache + assetlinks headers
  icon-*.png            app icons (any + maskable + apple-touch)
  privacy.html          privacy policy page (use this URL in Play Console)
  .well-known/assetlinks.json   EDIT before deploying: package name + SHA-256 fingerprint (see below)

play-store/             for Play Console only - do NOT upload to Netlify
  play-store-icon-512.png, feature-graphic-1024x500.png

Play Store steps: build the .aab on pwabuilder.com, create the app in Play Console, copy the SHA-256
from Play Console > Setup > App signing into assetlinks.json, redeploy, then open
https://YOUR-SITE/.well-known/assetlinks.json to confirm it loads.
