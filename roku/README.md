# Roku channel starter notes

Roku channels use BrightScript and SceneGraph, not ordinary HTML websites.
This folder is a minimal structural starting point, not a complete packaged app.

Create the app in Roku's official sample-project structure, then add:
- a screen identifier (`lobby` or `sanctuary`)
- HTTPS fetch of that screen's content JSON
- image display and timed playlist rotation
- announcement ticker
- polling/refresh and error handling

Do not place any Supabase service-role credentials in the Roku app. A public read-only endpoint/key is appropriate only when its RLS policies expose display content and nothing private.

Official developer setup: https://developer.roku.com/dev/docs/developer-setup
