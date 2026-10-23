# Roku Church Signage CMS — starter

This is a starter project, not a finished production app. It contains:
- A static admin dashboard scaffold for GitHub Pages
- Supabase schema and setup notes for authenticated content management
- Roku BrightScript/SceneGraph starter files for a custom Roku channel

## Architecture
- Dashboard: GitHub Pages (free static hosting)
- Content database + image storage: Supabase free tier (check current quotas)
- TV player: Roku channel built with Roku's supported BrightScript + SceneGraph SDK

## Important Roku limitations
1. Roku developer mode is for sideloading/testing. Roku generally allows only one sideloaded development app at a time per device; re-uploading replaces it.
2. The Roku player must be launched after a reboot or power event; don't assume it will always auto-launch.
3. A Roku channel cannot guarantee physical TV power control. Network power commands depend on model/TV capabilities and should be tested separately.
4. GitHub Pages alone is static hosting; it is not a database or secure upload API.
5. Never put a Supabase service-role key or other secret in the dashboard. Use only the public anon key with Row Level Security and authenticated users.

## Setup outline
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create a Storage bucket named `signage` and configure authenticated upload policies. For public display images, public-read access may be used; do not store private files there.
4. In `dashboard/config.js`, enter your Supabase project URL and anon/public key.
5. Implement/enable Supabase Auth in the dashboard before using it beyond a local prototype.
6. Publish the `dashboard/` folder through a GitHub Pages repository.
7. Build the Roku app with Roku's SDK tools and sideload it to each Roku in Developer Mode.
8. Configure a unique `screen_id` for each TV, such as `lobby` and `sanctuary`.

## Suggested staged build
- Stage 1: display slides and refresh content remotely for two distinct screen IDs.
- Stage 2: playlist scheduling and scrolling announcement ticker.
- Stage 3: TV power management, only if the specific Roku/TV combination supports it reliably.

See Roku's official docs:
- https://developer.roku.com/dev/docs/developer-setup
- https://developer.roku.com/dev/docs/getting-started
- https://developer.roku.com/dev/docs/external-control-api
