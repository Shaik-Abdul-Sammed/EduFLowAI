/**
 * EduFlow AI — Service Pricing Configuration
 * Maps automation_type to default price in INR (excluding GST).
 * Used by InvoiceController to auto-populate amounts and descriptions.
 */

export const SERVICE_PRICING = {
  accreditation:     { price: 50000, label: 'NAAC/NBA Accreditation Report Automation' },
  'student-success': { price: 15000, label: 'Student Dropout Risk Report' },
  timetable:         { price: 20000, label: 'Timetable Generator Service' },
  admissions:        { price: 15000, label: 'Admission Yield Predictor' },
  finance:           { price: 10000, label: 'Fee Reconciliation Service' },
  hostel:            { price: 25000, label: 'Hostel Occupancy Optimizer' },
  placement:         { price: 30000, label: 'Placement Readiness Report' },
  'fee-reconciliation': { price: 12000, label: 'Fee Reconciliation (Detailed) Service' },
}

export const VALID_AUTOMATION_TYPES = Object.keys(SERVICE_PRICING)

/**
 * Get invoice description for a given automation type and college name.
 * @param {string} automationType
 * @param {string} collegeName
 * @returns {string}
 */
export function getServiceDescription(automationType, collegeName) {
  const service = SERVICE_PRICING[automationType]
  if (!service) return `EduFlow AI Service - ${collegeName}`
  return `${service.label} - ${collegeName}`
}

/**
 * Get default price for an automation type.
 * @param {string} automationType
 * @returns {number} price in INR
 */
export function getServicePrice(automationType) {
  return SERVICE_PRICING[automationType]?.price ?? 10000
}
