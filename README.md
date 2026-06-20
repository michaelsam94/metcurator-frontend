# Met Curator Frontend

React + TypeScript frontend for the Met Curator API.

## Setup

```sh
npm install
cp .env.example .env
npm run dev
```

By default the app expects the backend at:

```sh
VITE_API_BASE_URL=http://localhost:8787
```

The frontend is intentionally separate from the Worker backend repo so it can deploy independently to Cloudflare Pages.
