# Engineers Pool

[![Netlify Status](https://api.netlify.com/api/v1/badges/0563376a-23e3-4e0b-b4d1-63e5b12dc2fb/deploy-status)](https://app.netlify.com/sites/engineers-pool-frontend-1315932840/deploys)

**Live Production URL:** [https://engineers-pool-frontend-1315932840.netlify.app](https://engineers-pool-frontend-1315932840.netlify.app)

Engineers Pool is a production-oriented full-stack notes platform for engineering students, with RGPV-first catalog navigation and an admin-only upload workflow.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, ShadCN-style components, Framer Motion, AMOLED glass UI.
- Backend: Java 17+, Spring Boot 3, Spring Security JWT, Spring Data JPA, PostgreSQL, Flyway, Swagger/OpenAPI.
- Storage: file storage abstraction with a local adapter now and a cloud adapter seam for S3/Cloudinary.
- Database: PostgreSQL relations for University -> Semester -> Branch -> Subject -> Notes and Category -> Programming Topic -> Notes.

## Local Backend

Run the backend without Docker or PostgreSQL:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The local profile uses a persistent H2 database in `backend/data/`, local uploads in `backend/uploads/`, and seeds the starter RGPV catalog. The default local admin credentials are `admin@engineerspool.local` / `0000`; change them with environment variables as needed. PostgreSQL remains the default outside this profile.
