/**
 * Presence Classifier Service
 * Replaces binary >=80% dwell with 3-band confidence classification,
 * per-room RSSI calibration, and AP-to-Room physical mapping.
 */

export const roomCalibrations = new Map()
export const apRoomMap = new Map()

export function registerApRoomMapping(apBssid, roomId, defaultTxPower = 20.0, notes = '') {
  if (!apBssid || !roomId) {
    throw new Error('apBssid and roomId are required')
  }
  const normalizedBssid = String(apBssid).trim().toLowerCase()
  const mapping = {
    apBssid: normalizedBssid,
    roomId: String(roomId).trim(),
    defaultTxPower: Number(defaultTxPower) || 20.0,
    notes: notes || '',
    updatedAt: new Date().toISOString()
  }
  apRoomMap.set(normalizedBssid, mapping)
  return mapping
}

export function matchApToSessionRoom({ apBssid, sessionRoomId } = {}) {
  if (!apBssid) {
    return { status: 'unknown_ap', confidence: 'low', reason: 'missing_ap_bssid' }
  }
  const normalizedBssid = String(apBssid).trim().toLowerCase()
  const mapping = apRoomMap.get(normalizedBssid)
  if (!mapping) {
    return { status: 'unknown_ap', confidence: 'low', reason: 'unmapped_ap', apBssid }
  }
  if (mapping.roomId === sessionRoomId) {
    return { status: 'accepted', confidence: 'high', reason: 'room_matched', roomId: mapping.roomId }
  }
  return {
    status: 'wrong_room',
    confidence: 'low',
    reason: 'ap_belongs_to_different_room',
    mappedRoomId: mapping.roomId,
    sessionRoomId
  }
}

export function computeCalibration(samples) {
  if (!Array.isArray(samples) || samples.length < 10) {
    const err = new Error('Calibration requires at least 10 samples')
    err.statusCode = 400
    throw err
  }
  const rssiValues = samples.map(s => (typeof s === 'number' ? s : s?.rssi)).filter(r => typeof r === 'number')
  if (rssiValues.length < 10) {
    const err = new Error('Calibration requires at least 10 valid numeric RSSI samples')
    err.statusCode = 400
    throw err
  }
  const n = rssiValues.length
  const mean = rssiValues.reduce((a, b) => a + b, 0) / n
  const variance = rssiValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
  const stddev = Math.sqrt(variance)

  // minDbm = mean - 2*stddev, maxDbm = mean + stddev
  const minDbm = parseFloat((mean - 2 * stddev).toFixed(2))
  const maxDbm = parseFloat((mean + stddev).toFixed(2))

  return {
    meanDbm: parseFloat(mean.toFixed(2)),
    stddevDbm: parseFloat(stddev.toFixed(2)),
    minDbm,
    maxDbm,
    sampleCount: n
  }
}

export function isRssiInRoom({ roomId, rssi, fallbackMinDbm = -75, fallbackMaxDbm = -30, logger } = {}) {
  if (roomId && roomCalibrations.has(roomId)) {
    const cal = roomCalibrations.get(roomId)
    return {
      inRoom: rssi >= cal.minDbm && rssi <= cal.maxDbm,
      calibrated: true,
      minDbm: cal.minDbm,
      maxDbm: cal.maxDbm
    }
  }

  // Fallback to configurable global default with warning
  const warnMsg = `Room ${roomId || 'UNKNOWN'} is not calibrated. Falling back to global default RSSI threshold.`
  if (logger && typeof logger.warn === 'function') {
    logger.warn(warnMsg)
  } else {
    console.warn(`[WARN] ${warnMsg}`)
  }

  return {
    inRoom: rssi >= fallbackMinDbm && rssi <= fallbackMaxDbm,
    calibrated: false,
    minDbm: fallbackMinDbm,
    maxDbm: fallbackMaxDbm,
    warning: warnMsg
  }
}

export function classifyPresence({ dwellSeconds = 0, sessionSeconds = 3600, inRoomRssi = true, validCodeCount = 0 } = {}) {
  const session = sessionSeconds > 0 ? sessionSeconds : 3600
  const ratio = dwellSeconds / session

  // 1. Physical signal out-of-bounds (RSSI out of room zone)
  if (inRoomRssi === false) {
    return { status: 'absent', confidence: 'high', reason: 'out_of_zone' }
  }

  // 2. Missing human proof (session code) -> not auto-absent, requires faculty review with low confidence
  if (!validCodeCount || validCodeCount <= 0) {
    return { status: 'needs_review', confidence: 'low', reason: 'no_session_code' }
  }

  // 3. High confidence dwell >= 80%
  if (ratio >= 0.80) {
    return { status: 'present', confidence: 'high', reason: 'dwell_ok' }
  }

  // 4. Medium confidence dwell 40% - 79%
  if (ratio >= 0.40) {
    return { status: 'needs_review', confidence: 'medium', reason: 'partial_dwell' }
  }

  // 5. Low dwell (< 40%) but with valid session code
  return { status: 'needs_review', confidence: 'low', reason: 'weak_dwell' }
}

export default {
  roomCalibrations,
  apRoomMap,
  registerApRoomMapping,
  matchApToSessionRoom,
  computeCalibration,
  isRssiInRoom,
  classifyPresence
}
