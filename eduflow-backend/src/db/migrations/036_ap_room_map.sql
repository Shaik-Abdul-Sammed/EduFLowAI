-- 036_ap_room_map.sql: Physical AP-to-Room mapping replaces global zone blacklist

CREATE TABLE IF NOT EXISTS ap_room_map (
  id SERIAL PRIMARY KEY,
  ap_bssid VARCHAR(50) UNIQUE NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  default_tx_power REAL DEFAULT 20.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ap_room_map_bssid ON ap_room_map(ap_bssid);
CREATE INDEX IF NOT EXISTS idx_ap_room_map_room ON ap_room_map(room_id);
