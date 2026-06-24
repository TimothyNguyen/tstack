CREATE TABLE IF NOT EXISTS urls (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  url        TEXT NOT NULL,
  hits       INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urls_code ON urls(code);
