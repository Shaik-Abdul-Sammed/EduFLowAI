/**
 * Presence Classifier Service
 * Replaces binary >=80% dwell with 3-band confidence classification.
 */

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

export default { classifyPresence }
