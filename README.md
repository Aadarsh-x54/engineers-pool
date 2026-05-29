# Engineers Pool

[![Netlify Status](https://api.netlify.com/api/v1/badges/0563376a-23e3-4e0b-b4d1-63e5b12dc2fb/deploy-status)](https://app.netlify.com/sites/engineers-pool-frontend-1315932840/deploys)

**Live Production URL:** [https://engineers-pool-frontend-1315932840.netlify.app](https://engineers-pool-frontend-1315932840.netlify.app)

Engineers Pool is a production-oriented full-stack notes platform for engineering students, with RGPV-first catalog navigation and an admin-only upload workflow.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, ShadCN-style components, Framer Motion, AMOLED glass UI.
- Backend: Java 17+, Spring Boot 3, Spring Security JWT, Spring Data JPA, PostgreSQL, Flyway, Swagger/OpenAPI.
- Storage: file storage abstraction with a local adapter now and a cloud adapter seam for S3/Cloudinary.
- Database: PostgreSQL relations for University -> Semester -> Branch -> Subject -> Notes and Category -> Programming Topic -> Notes.

## Project Structure

```text
backend/
  src/main/java/com/engineerspool/
    config/ controller/ dto/ entity/ repository/ service/
    security/ storage/ exception/ mapper/ util/
  src/main/resources/db/migration/
frontend/
  src/app/
  src/components/
  src/lib/
  src/types/
docker-compose.yml
```

## Backend Setup

1. Start PostgreSQL:

```bash
docker compose up -d postgres
```

2. Configure env values from `backend/.env.example`.

3. Run the backend:

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

Swagger UI is available at:

```text
http://localhost:8080/swagger-ui.html
```

Default local admin credentials are controlled by env:

```text
ENGINEERS_POOL_ADMIN_EMAIL=admin@engineerspool.local
ENGINEERS_POOL_ADMIN_PASSWORD=0000
```

Change them before production use.

## Frontend Setup

1. Configure env:

```bash
cd frontend
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Public Flows

- `/` Home, global search, contribution card, recent notes, popular downloads.
- `/rgpv` Semester options plus common documents.
- `/rgpv/[semesterId]` Branch selection.
- `/rgpv/[semesterId]/[branchId]` Subject-grouped RGPV note cards.
- `/programming` Programming notes grouped by admin category order.
- `/common` Common documents.

## Admin Flows

- `/admin/login` JWT admin login.
- `/admin` Dashboard statistics.
- `/admin/upload/rgpv` Upload RGPV notes.
- `/admin/upload/programming` Upload programming notes.
- `/admin/notes` Search/filter notes, publish/unpublish, edit metadata, replace files, delete, and upload common documents.
- `/admin/catalog` Manage semesters, branches, subjects, and programming categories.
- `/admin/settings` Manage WhatsApp contribution number and change admin password.

## API Highlights

Public:

- `GET /api/notes/rgpv/semesters`
- `GET /api/notes/rgpv/semesters/{semesterId}/branches`
- `GET /api/notes/rgpv?semester=&branch=&subject=`
- `GET /api/notes/programming`
- `GET /api/notes/programming/{category}`
- `GET /api/notes/common`
- `GET /api/notes/search?q=`
- `GET /api/notes/{id}`
- `GET /api/notes/{id}/download`
- `GET /api/notes/{id}/preview`
- `GET /api/settings/whatsapp`

Admin:

- `POST /api/admin/auth/login`
- `POST /api/admin/notes/rgpv`
- `POST /api/admin/notes/programming`
- `POST /api/admin/notes/common`
- `PUT /api/admin/notes/{id}`
- `DELETE /api/admin/notes/{id}`
- `PATCH /api/admin/notes/{id}/publish`
- `GET /api/admin/dashboard`
- CRUD: `/api/admin/semesters`, `/api/admin/branches`, `/api/admin/subjects`, `/api/admin/programming-categories`
- `PUT /api/admin/settings/whatsapp`

## Seed Data

Flyway seeds:

- RGPV university.
- Semesters 1-8.
- All requested branch options.
- Programming categories in fixed display order, preventing mixed topic ordering.
- Starter subjects for first year and CSE examples.
- WhatsApp setting placeholder.

## Production Notes

- Set a strong `ENGINEERS_POOL_JWT_SECRET`.
- Put uploaded files on durable storage before real deployment. Implement another `FileStorageService` adapter for S3 or Cloudinary and set `STORAGE_PROVIDER`.
- Keep `CORS_ALLOWED_ORIGINS` restricted to trusted frontend domains.
- Put the backend behind HTTPS.
- Replace the local in-memory download limiter with Redis if running multiple backend replicas.
- Keep PostgreSQL backups and monitor `download_logs` growth.
- As of this build, `npm audit` reports advisories in the Next.js 14 line whose automated fix is a semver-major upgrade to Next 16. The app stays on Next.js 14 because that was an explicit stack requirement; reassess before deploying to the public internet.
