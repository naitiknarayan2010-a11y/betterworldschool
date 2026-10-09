BETTER WORLD SCHOOL - PWA package
=================================
Upload ALL files in this folder to the ROOT of your Netlify site (drag the whole folder, or the unzipped contents):

  index.html        the app (includes the new Attendance system)
  manifest.json     app name, colours, icons
  sw.js             service worker (makes updates automatic - do not rename)
  _headers          tells Netlify not to cache the app page (needed for instant updates)
  icon-*.png        app icons (bigger logo)

After this one-time upload, future updates are just: upload the new index.html -> done.
Users only need to open or refresh the app. No uninstall / reinstall.
(Optional: if you also want existing phones to switch to the new worker sooner, nothing to do - browsers check by themselves within about a day.)
