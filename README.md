# Modelo Evento

Landing page template powered by Vite/React and served by an Express proxy. The
project also bundles a catalog API (see the `server/` directory) that feeds the
front-end components.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173)
and automatically proxies catalog requests to your configured API origin (see
`VITE_API_PROXY_TARGET` and `CATALOG_API_URL` below).

To build the static assets and preview them locally, run:

```bash
npm run build
npm run preview
```

To serve the production bundle with Express:

```bash
npm run build
npm start
```

## Environment variables

Environment variables can be stored in the root `.env` file.

| Variable | Description | Default |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MariaDB connection settings consumed by the catalog API. | — |
| `DATABASE_URL` | Prisma connection string derived from the values above. | — |
| `SERVER_PORT` | Port used by the catalog API (`server/`). | `4000` |
| `CATALOG_API_URL` | Origin used by the Express proxy (`app.js`) and Vite dev server to forward `/api` requests to the catalog backend. **Production deployments must set this to the live Catalog API origin.** | `http://localhost:4000` |
| `VITE_API_PROXY_TARGET` | Optional override for the Vite dev server proxy target. | Uses `CATALOG_API_URL`/`http://localhost:4000` |

If you run the catalog API locally (`npm install && npm run dev` inside the
`server/` folder), the defaults above will let the front-end communicate with it
immediately.
