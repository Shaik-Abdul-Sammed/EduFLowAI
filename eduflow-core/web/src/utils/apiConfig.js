/**
 * Proxy module re-exporting canonical API configuration from config/apiConfig.js
 * Ensures backwards compatibility across all student, faculty, and admin portal modules.
 */

export * from '../config/apiConfig.js'
import defaultExport from '../config/apiConfig.js'
export default defaultExport
