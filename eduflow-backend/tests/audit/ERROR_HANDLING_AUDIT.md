# EduFlow AI — Error Handling Audit Report

Total potential gaps identified: 49

File: eduflow-backend/src/controllers/SmartCampusController.js
Line: 15
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/HostelController.js
Line: 15
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 179
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 283
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 295
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 307
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 319
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/OfficerController.js
Line: 331
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/TransportController.js
Line: 15
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/controllers/InvoiceController.js
Line: 71
Issue: JSON.parse called without try/catch block
Risk: Medium
Suggested Fix: Wrap JSON.parse in try/catch or use safe parser

File: eduflow-backend/src/controllers/InvoiceController.js
Line: 86
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-backend/src/controllers/InvoiceController.js
Line: 87
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-backend/src/controllers/InvoiceController.js
Line: 88
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-backend/src/controllers/InvoiceController.js
Line: 244
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-backend/src/services/CacheService.js
Line: 52
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/services/CacheService.js
Line: 57
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/services/email/emailService.js
Line: 15
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-backend/src/models/InvoiceRepository.js
Line: 8
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-backend/src/models/InvoiceRepository.js
Line: 118
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/ai/AITerminal.jsx
Line: 129
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/admin/examSetup.jsx
Line: 88
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/LeadManagementPage.jsx
Line: 61
Issue: fetch() call without error handling or try/catch block
Risk: High
Suggested Fix: Add try/catch with error toast or error notification

File: eduflow-core/web/src/pages/admin/studentManagement.jsx
Line: 98
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/feeCollection.jsx
Line: 23
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/backupManagement.jsx
Line: 54
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/admin/backupManagement.jsx
Line: 60
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/admin/backupManagement.jsx
Line: 65
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/admin/ReportDeliveryPage.jsx
Line: 69
Issue: fetch() call without error handling or try/catch block
Risk: High
Suggested Fix: Add try/catch with error toast or error notification

File: eduflow-core/web/src/pages/admin/ReportDeliveryPage.jsx
Line: 122
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/InvoiceGeneratorPage.jsx
Line: 94
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/InvoiceGeneratorPage.jsx
Line: 95
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/InvoiceGeneratorPage.jsx
Line: 283
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/InvoiceGeneratorPage.jsx
Line: 349
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/InvoiceGeneratorPage.jsx
Line: 452
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/admin/auditLogs.jsx
Line: 28
Issue: fetch() call without error handling or try/catch block
Risk: High
Suggested Fix: Add try/catch with error toast or error notification

File: eduflow-core/web/src/pages/admin/__tests__/backupManagement.test.jsx
Line: 29
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/admin/__tests__/backupManagement.test.jsx
Line: 39
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/pages/public/LeadIntakePage.jsx
Line: 66
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/public/LeadIntakePage.jsx
Line: 112
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/public/EntryPage.jsx
Line: 41
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/pages/faculty/questionBankUpload.jsx
Line: 37
Issue: Numeric conversion without explicit NaN / bounds validation
Risk: Low
Suggested Fix: Validate with Number.isNaN() or provide default fallback

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 41
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 44
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 53
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 56
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 66
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 69
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 87
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

File: eduflow-core/web/src/hooks/__tests__/useAuth.test.js
Line: 90
Issue: Async function definition missing try/catch boundary
Risk: Medium
Suggested Fix: Wrap entire function body in try/catch block

