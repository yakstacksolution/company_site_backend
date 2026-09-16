# company_site_backend

Backend API for the Yak Stack Solution company site.

## Local development

```bash
npm ci
cp .env.example .env
npm run dev
```

Health endpoints:

- `/api/health`
- `/api/ready`

## Production

The app starts with:

```bash
npm start
```

For cPanel CI/CD setup, see [docs/cpanel-deployment.md](docs/cpanel-deployment.md).
