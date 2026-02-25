-- ═══════════════════════════════════════════════════════════════════════════
--  Pre-Market Trading Dashboard — Supabase Schema V1
--  Instructions : Dashboard Supabase → SQL Editor → coller → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Watchlist ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS watchlist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL DEFAULT 'local',
  symbol       TEXT NOT NULL,
  label        TEXT NOT NULL,
  asset_type   TEXT NOT NULL CHECK (asset_type IN ('stock','index','fx','commodity')),
  tv_symbol    TEXT NOT NULL,
  is_enabled   BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_symbol ON watchlist_items(user_id, symbol);

INSERT INTO watchlist_items (user_id, symbol, label, asset_type, tv_symbol, sort_order)
VALUES
  ('local', 'NAS100',  'NAS100',   'index',     'CAPITALCOM:US100', 0),
  ('local', 'US500',   'US500',    'index',     'CAPITALCOM:US500', 1),
  ('local', 'EURUSD',  'EUR/USD',  'fx',        'FX:EURUSD',        2),
  ('local', 'XAUUSD',  'XAU/USD',  'commodity', 'TVC:GOLD',         3),
  ('local', 'NVDA',    'NVIDIA',   'stock',     'NASDAQ:NVDA',      4),
  ('local', 'TSLA',    'TESLA',    'stock',     'NASDAQ:TSLA',      5),
  ('local', 'AAPL',    'APPLE',    'stock',     'NASDAQ:AAPL',      6),
  ('local', 'MSFT',    'MICROSOFT','stock',     'NASDAQ:MSFT',      7)
ON CONFLICT DO NOTHING;

-- ─── Daily Watchlist State ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_watchlist_state (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL DEFAULT 'local',
  trade_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  symbols      TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, trade_date)
);

-- ─── Trading Journal ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journal_imports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL DEFAULT 'local',
  filename     TEXT NOT NULL,
  row_count    INTEGER NOT NULL DEFAULT 0,
  imported_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_trades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL DEFAULT 'local',
  import_id     UUID REFERENCES journal_imports(id) ON DELETE CASCADE,
  trade_date    DATE NOT NULL,
  symbol        TEXT NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('long','short')),
  entry_price   NUMERIC(18,6) NOT NULL DEFAULT 0,
  exit_price    NUMERIC(18,6) NOT NULL DEFAULT 0,
  quantity      NUMERIC(18,6) NOT NULL DEFAULT 1,
  pnl           NUMERIC(12,2) NOT NULL DEFAULT 0,
  pnl_r         NUMERIC(8,4),
  setup         TEXT,
  timeframe     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journal_trades_user_date ON journal_trades(user_id, trade_date DESC);

-- ─── Checklist ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS checklist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL DEFAULT 'local',
  label        TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO checklist_items (user_id, label, sort_order) VALUES
  ('local', 'Vérifier le calendrier économique — events HIGH impact', 0),
  ('local', 'Analyser DXY + VIX + US10Y', 1),
  ('local', 'Identifier les zones clés H4/D1 sur chaque actif watchlist', 2),
  ('local', 'Lire le briefing IA du jour', 3),
  ('local', 'Définir le biais directionnel par actif', 4),
  ('local', 'Vérifier spreads et liquidité pré-marché', 5),
  ('local', 'Poser alertes sur les niveaux clés', 6),
  ('local', 'Vérifier corrélations inter-marchés (DXY ↔ EURUSD, VIX ↔ NAS100)', 7)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS checklist_completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL DEFAULT 'local',
  item_id        UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, completed_date)
);

-- ─── AI Briefing Cache ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS briefing_cache (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL DEFAULT 'local',
  briefing_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  payload        JSONB NOT NULL,
  generated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, briefing_date)
);

-- ─── Journal Notes (Erreurs récurrentes) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS journal_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL DEFAULT 'local',
  category     TEXT NOT NULL DEFAULT 'recurring_error',
  content      TEXT NOT NULL DEFAULT '',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO journal_notes (user_id, category, content) VALUES
  ('local', 'recurring_error', '')
ON CONFLICT DO NOTHING;

-- ─── RLS (Row Level Security) — désactivé pour MVP sans auth ─────────────────
-- À activer en V2 quand auth sera ajoutée
ALTER TABLE watchlist_items       DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_watchlist_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_imports       DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_trades        DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items       DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_cache        DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_notes         DISABLE ROW LEVEL SECURITY;
