# Northstar Customer Portal

A responsive enterprise customer workspace built with React, Vite, and TypeScript. Includes a dashboard with data-derived metrics and charts, searchable/filterable customer directory, CSV export, customer profiles, and a validated customer creation flow.

## Get started

Requires Node.js 22.12+ (or a newer supported LTS release) and npm.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**. Start your backend separately at **http://localhost:4000/api**. The frontend does not include or start a backend.

The default is **live API mode**. If the backend is unavailable, an error with a retry action is shown; the app never silently substitutes sample records. Choose **Explore with demo data** or **API settings → Demo workspace** for a standalone presentation. Set `VITE_DEMO_MODE=true` to start in demo mode.

Demo records and newly created demo customers live only in memory for the current tab. Switching to live mode uses a separate API service; demo writes never reach the backend.

## API connection and authentication

Configure `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:4000/api`), then restart Vite. Vite variables are public build-time configuration: **never put tokens or secrets in them**.

Open **API settings**, select **Live API**, paste a JWT access token without the `Bearer` prefix, and save. Requests include `Authorization: Bearer <token>` when a token is present. Tokens are held only in React memory, not local/session storage, URLs, source code, or logs, and are cleared on refresh. Emptying the field removes the token. This demo accepts a token issued by your backend; it does not implement login, token issuance, or refresh.

The backend must enable CORS for the frontend origin, allow `GET`, `POST`, and `OPTIONS`, and allow `Authorization` and `Content-Type` headers. For deployment, use HTTPS for both the frontend and API; the localhost HTTP default is for development only.

### Expected API contract

| Method | Endpoint         | Response                                                       |
| ------ | ---------------- | -------------------------------------------------------------- |
| GET    | `/customers`     | `Customer[]` or `{ "data": Customer[] }`                       |
| GET    | `/customers/:id` | `Customer` or `{ "data": Customer }`                           |
| POST   | `/customers`     | Created `Customer` or `{ "data": Customer }` with HTTP 200/201 |

```ts
interface Customer {
  id: string | number
  name: string
  email: string
  company: string
  status: 'active' | 'pending' | 'inactive'
  createdAt: string // ISO 8601 date/time
  phone?: string
  industry?: string
}
```

POST sends `name`, `email`, `company`, `phone`, `industry`, and `status` as JSON; the backend assigns `id` and `createdAt`. Optional form fields are sent as empty strings. The backend remains responsible for authorization, validation, uniqueness, and persistence. Response shapes are validated at the service boundary; incompatible payloads produce a visible error. Adapt `src/services/customers.ts` if your backend uses different field names or pagination.

This demo expects a complete customer collection. Search, filters, pagination (8 records per page), CSV export, and dashboard aggregation run client-side. CSV export includes all filtered records, not just the current page, and escapes spreadsheet formula prefixes. Charts show actual creation counts over calendar months, not fabricated growth or revenue.

HTTP errors, missing/expired authentication, malformed responses, network/CORS failures, empty results, and loading states have explicit UI. Read requests are canceled on navigation or connection changes; writes are not automatically retried to avoid duplicate creation.

## Commands

| Command              | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the Vite development server                 |
| `npm run build`      | Type-check and create production files in `dist/` |
| `npm run preview`    | Preview the production build locally              |
| `npm run typecheck`  | Check TypeScript                                  |
| `npm run lint`       | Run ESLint                                        |
| `npm test`           | Run service and UI tests once                     |
| `npm run test:watch` | Run tests in watch mode                           |
| `npm run format`     | Format source and configuration                   |

## Architecture

```text
src/
  components/    Shared states, customer table, badges, connection dialog
  data/          Explicit, isolated in-memory demo service
  hooks/         Abortable asynchronous resource lifecycle
  pages/         Dashboard, customer directory, details, creation
  services/      Fetch client, Bearer authentication, customer API adapter
  state/         Connection settings and service selection
  test/          Shared test setup
  types/         Customer domain model and service interface
```

Pages depend on the `CustomerService` interface rather than transport details. The API client centralizes headers and errors; the customer adapter validates domain responses. The demo adapter implements the same interface, so presentation code is identical in either mode.

Routes: `/`, `/customers`, `/customers/new`, and `/customers/:id`. Unknown routes show a 404 screen. For production hosting, serve `dist/` and configure an SPA fallback to `index.html` for deep links. Set the production API URL **before** building; Vite's preview server is not a production server.

The UI uses semantic forms/tables, native keyboard-accessible dialogs, visible focus states, reduced-motion support, responsive navigation, and horizontal table scrolling on smaller screens. DM Sans and Manrope are self-hosted through Fontsource, with no external font requests.

## Scope

Designed for architecture demonstrations, not as a complete production identity or CRM system. Login/SSO, server-side pagination, editing/deleting, role management, audit logging, and backend infrastructure are intentionally outside this frontend's scope.
