# EzUp Upload Server

The tus endpoint at `/files/` accepts PNG, JPG/JPEG, and WEBP images up to 60 MiB
per upload. It checks the declared MIME type and filename extension when an upload
starts, then verifies the completed file signature. Other formats are rejected.

Uploads use tus resumable transfers and are stored in the mounted Fly volume.
Configure `ALLOWED_ORIGINS` to the website origin and `UPLOAD_DIR` to the mounted
volume path. The `/healthz` endpoint is used for Fly health checks.

Deployments run from this repository's `main` branch using the GitHub Actions
workflow. Set `FLY_API_TOKEN` as a repository Actions secret; never commit it.