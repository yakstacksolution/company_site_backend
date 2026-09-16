# cPanel Deployment

This backend is a Node.js/Express app. It has no build step; deployments need the source files, `package-lock.json`, production dependencies, and a configured `.env` on the server.

## Branches

Deployment branches:

- `staging`: deploys to the staging cPanel Node.js app.
- `production`: deploys to the production cPanel Node.js app.

Push to `staging` for the staging server and push to `production` for the production server. The workflow can also be run manually from the Actions tab by choosing a target.

## cPanel Node.js App

Create one Node.js app in cPanel for staging and one for production. Each app should have:

- Node.js version: `22.x` when available, otherwise the newest LTS cPanel provides
- Application root: the same directory used for that environment's remote path secret
- Application startup file: `src/server.js`
- Application mode: `production`
- Application URL: your API subdomain or path

Create a separate server-side `.env` in each application root. Staging and production should use separate URLs, databases, and storage buckets. Do not commit `.env` to Git.

## Required GitHub Secrets

Add these in GitHub repository settings under `Secrets and variables -> Actions`:

- `STAGING_CPANEL_SSH_HOST`: staging cPanel SSH host, for example `server.example.com`
- `STAGING_CPANEL_SSH_PORT`: staging SSH port, usually `22`
- `STAGING_CPANEL_SSH_USER`: staging cPanel username
- `STAGING_CPANEL_SSH_PRIVATE_KEY`: private key allowed to SSH into staging cPanel
- `STAGING_CPANEL_REMOTE_PATH`: staging app directory, for example `/home/username/yak-stack-backend-staging`
- `STAGING_CPANEL_NODE_ACTIVATE`: optional staging Node activation script, for example `/home/username/nodevenv/yak-stack-backend-staging/22/bin/activate`
- `PRODUCTION_CPANEL_SSH_HOST`: production cPanel SSH host
- `PRODUCTION_CPANEL_SSH_PORT`: production SSH port, usually `22`
- `PRODUCTION_CPANEL_SSH_USER`: production cPanel username
- `PRODUCTION_CPANEL_SSH_PRIVATE_KEY`: private key allowed to SSH into production cPanel
- `PRODUCTION_CPANEL_REMOTE_PATH`: production app directory, for example `/home/username/yak-stack-backend`
- `PRODUCTION_CPANEL_NODE_ACTIVATE`: optional production Node activation script, for example `/home/username/nodevenv/yak-stack-backend/22/bin/activate`

## Server Environment

Required in production:

- `NODE_ENV=production`
- `PORT` if cPanel gives you one; otherwise keep `5001`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `SITE_URL`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BUCKET`
- `S3_PRIVATE_BUCKET`
- `ANALYTICS_SALT`

Recommended on cPanel:

- `TRUST_PROXY=true`
- `UPLOAD_DIR=uploads`
- `PRIVATE_UPLOAD_DIR=private-uploads`

Use `.env.example` as the template. Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Deployment Behavior

The CI/CD pipeline:

1. Installs dependencies in GitHub Actions.
2. Runs `npm run smoke`.
3. Uploads changed files to cPanel with `rsync`.
4. Preserves `.env`, `uploads`, and `private-uploads` on the server.
5. Runs `npm ci --omit=dev` on cPanel.
6. Validates production env vars with `npm run check:production-env`.
7. Restarts the cPanel Node.js app by touching `tmp/restart.txt`.

After deployment, check:

- `https://your-api-domain.com/api/health`
- `https://your-api-domain.com/api/ready`
