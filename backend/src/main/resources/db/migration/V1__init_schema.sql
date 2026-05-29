CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE universities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(260),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE semesters (
    id BIGSERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    university_id BIGINT REFERENCES universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    code VARCHAR(40),
    full_name VARCHAR(240),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    university_id BIGINT REFERENCES universities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    code VARCHAR(60),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    semester_id BIGINT REFERENCES semesters(id),
    branch_id BIGINT REFERENCES branches(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_subject_scope UNIQUE (slug, semester_id, branch_id)
);

CREATE TABLE programming_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(260),
    display_order INTEGER NOT NULL DEFAULT 100,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(220) NOT NULL,
    description TEXT,
    file_url VARCHAR(600) NOT NULL,
    storage_key VARCHAR(600) NOT NULL,
    file_name VARCHAR(260) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size BIGINT NOT NULL,
    note_type VARCHAR(40) NOT NULL,
    semester_id BIGINT REFERENCES semesters(id),
    branch_id BIGINT REFERENCES branches(id),
    subject_id BIGINT REFERENCES subjects(id),
    programming_category_id BIGINT REFERENCES programming_categories(id),
    download_count BIGINT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_note_type CHECK (note_type IN ('RGPV', 'PROGRAMMING', 'COMMON')),
    CONSTRAINT ck_file_type CHECK (file_type IN ('PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'ZIP'))
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag VARCHAR(80) NOT NULL
);

CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    ip_address VARCHAR(80),
    user_agent VARCHAR(400),
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_settings (
    setting_key VARCHAR(120) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_public_rgpv ON notes (is_published, note_type, semester_id, branch_id, subject_id);
CREATE INDEX idx_notes_programming_category ON notes (is_published, note_type, programming_category_id);
CREATE INDEX idx_notes_created ON notes (created_at DESC);
CREATE INDEX idx_notes_downloads ON notes (download_count DESC);
CREATE INDEX idx_download_logs_note ON download_logs (note_id);
