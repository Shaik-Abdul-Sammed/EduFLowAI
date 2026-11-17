-- 035_room_rssi_calibration.sql: Per-room RSSI calibration for Wi-Fi and BLE presence

CREATE TABLE IF NOT EXISTS room_rssi_calibration (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(50) UNIQUE NOT NULL,
  min_dbm REAL NOT NULL,
  max_dbm REAL NOT NULL,
  mean_dbm REAL,
  stddev_dbm REAL,
  sample_count INTEGER DEFAULT 0,
  calibrated_at TIMESTAMPTZ DEFAULT NOW(),
  calibrated_by VARCHAR(100),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_room_rssi_calibration_room ON room_rssi_calibration(room_id);
