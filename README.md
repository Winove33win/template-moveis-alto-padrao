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

Secrets are configured through your hosting provider's environment settings (or
your local shell) and must never be committed to the repository. The
`.env.example` file lists every variable consumed by the Express proxy, the API
server and the helper scripts:

1. Duplicate `.env.example` to `.env` only for local development. Keep the file
   untracked (see `.gitignore`) and overwrite every placeholder with values
   generated specifically for your workstation.
2. Production and test deployments must define the same variables via the cloud
   panel/secret manager (e.g., Render, Railway, Heroku, etc.). Store the
   database credentials and `JWT_SECRET`/`ADMIN_JWT_SECRET` there and rotate
   them whenever an engineer leaves the project or an env file is regenerated.
3. Generate fresh secrets before promoting new builds. For example,
   `openssl rand -hex 32` produces a strong `JWT_SECRET`, while MariaDB/MySQL
   credentials should be reset in the managed database console.

| Variable | Description | Default |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MariaDB connection settings consumed by the catalog API. | — |
| `DB_SOCKET_PATH` | Optional Unix socket path for MySQL/MariaDB. When set, `DB_HOST`/`DB_PORT` become optional. | — |
| `DB_POOL_LIMIT`, `DB_QUEUE_LIMIT` | Fine tune the MySQL connection pool (connections and pending queue). | `10`, `0` |
| `DB_CONNECT_RETRIES`, `DB_CONNECT_RETRY_DELAY_MS` | Control how many times (and how often) the server retries the DB handshake before aborting. | `5`, `2000` |
| `DATABASE_URL` | Prisma connection string. When omitted, the server derives it from the `DB_*` variables (including socket paths). | — |
| `SERVER_PORT` | Port used by the catalog API (`server/`). | `4000` |
| `CATALOG_API_URL` | Origin used by the Express proxy (`app.js`) and Vite dev server to forward `/api` requests to the catalog backend. **Production deployments must set this to the live Catalog API origin.** | `http://localhost:4000` |
| `VITE_API_PROXY_TARGET` | Optional override for the Vite dev server proxy target. | Uses `CATALOG_API_URL`/`http://localhost:4000` |
| `VITE_API_BASE_URL` | Base URL embedded in the front-end bundle for catalog/admin requests. Leave it as `/api` (the Express proxy) or set it to the public Catalog API origin. | `/api` |
| `JWT_SECRET` / `ADMIN_JWT_SECRET` | Secret used to sign and validate admin JWTs. **One of them must be defined or the Express server terminates on boot.** | — |

If you run the catalog API locally (`npm install && npm run dev` inside the
`server/` folder), the defaults above will let the front-end communicate with it
immediately.

### Preparing admin credentials

The helper script `npm run create-admin` (which executes
`scripts/create-admin.js`) ensures an administrator account exists in the
database. Before running it:

1. Export the database connection variables (or create a local `.env` file) so
   the script can connect to MariaDB/MySQL.
2. Provide `ADMIN_EMAIL` and `ADMIN_PASSWORD` through the environment. For
   example:

   ```bash
   ADMIN_EMAIL=admin@example.com \
   ADMIN_PASSWORD="StrongPass#2024" \
   npm run create-admin
   ```

   When the script runs in a development terminal (`NODE_ENV=development` or no
   `NODE_ENV` set) and both stdin/stdout are TTYs, it prompts for any missing
   values instead of silently falling back to unsafe defaults. Production
   environments must always set the variables explicitly.

### Health check endpoint

Production deploys can monitor `GET /healthz`, which performs a simple
`SELECT 1` against the configured database. The route returns `{ "status": "ok" }`
when the pool is healthy or `500` with `status: "error"` if the database is not
reachable, making it suitable for uptime monitors and Passenger health checks.

### Production deployment tips

- Build-time env files such as `.env.production` should keep `VITE_API_BASE_URL`
  pointing to `/api` (or your public Catalog API origin). Using
  `http://localhost:4000` here forces browsers to call the visitor's localhost
  instead of the Express proxy.
- When hosting the Express proxy, configure `CATALOG_API_URL` to the real
  Catalog API origin (or the internal hostname where it runs) so that the `/api`
  routes reach the right backend service.
- Always define `JWT_SECRET` (or `ADMIN_JWT_SECRET`) along with your database
  credentials. The server validates these variables during boot and aborts if
  any are missing, leading to Passenger/Nginx showing a generic error page.
