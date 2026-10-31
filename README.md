# EzUp

EzUp resizes and compresses images entirely in the browser. The frontend can be
opened locally or deployed to GitHub Pages; it needs no build step or package
installation.

## Project files

- `index.html` — page structure and CDN dependencies
- `styles.css` — custom styles and the hero background
- `script.js` — presets, image compression, folder handling, and downloads
- `tailwind.config.js` — Tailwind CDN theme configuration
- `upload-config.js` — tus upload endpoint
- `server/` — Fly.io tus server, Dockerfile, and deployment configuration
- `.github/workflows/deploy.yaml` — GitHub Actions deployment to Fly.io
- `blue-image.png` — title background image

Keep the frontend files together when deploying or opening `index.html`.

## Resumable uploads

The browser uploads compressed images only after the user selects **Upload**. Folder
uploads can be sent as a ZIP. `script.js` uses tus-js-client to resume interrupted
transfers automatically while the page remains open.

`upload-config.js` points to `https://ezup-tusio.fly.dev/files/`. The server limits
uploads to 25 MB and allows the GitHub Pages origin configured in `server/fly.toml`.

## Deploy the server to Fly.io

The server stores active tus upload state on a machine-local Fly Volume. It needs one
machine and one volume in the same region; separate machines do not share upload
state.

1. In the Fly dashboard, make sure app `ezup-tusio` has one machine in region `ams`.
2. In **Volumes**, create one 1 GB volume named exactly `uploads` in `ams`, unless
   one already exists. The `server/fly.toml` mount attaches it at `/data`.
3. In the GitHub repository, add a Fly deploy token as an Actions secret named
   `FLY_API_TOKEN` under **Settings → Secrets and variables → Actions**. The workflow
   reads it from the secret; do not put the token in the workflow file.
4. Push to `main`. The workflow in `.github/workflows/deploy.yaml` deploys the server
   from `server/` with `--ha=false`; no local Fly CLI is needed.

The Fly app configuration and Dockerfile are `server/fly.toml` and
`server/Dockerfile`.

The app's `/` page shows its status, and `https://ezup-tusio.fly.dev/healthz` should
return `ok`. Uploads remain on the volume until removed, so add access controls and a
retention policy before exposing this endpoint publicly. CORS only restricts browsers;
it does not prevent direct uploads from other clients.

If the page is refreshed or closed during an upload, the browser needs the file again
to resume it. Automatic retries handle connection interruptions while the page stays
open.
