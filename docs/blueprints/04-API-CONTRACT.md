# EduFlow AI OS — Complete API Contract Reference

## 1. System Health & Diagnostics

| Method | Endpoint | Auth | Request Body | Success Response | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Public | None | `{"ok":true,"service":"eduflow-backend","version":"1.0.0"}` | 500 |
| `GET` | `/api/health/db` | Public | None | `{"mode":"postgres"\|"memory","persistent":true}` | 500 |

---

## 2. Authentication & Session Services (`/api/v1/auth`)

| Method | Endpoint | Auth | Request Body Schema | Success Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/login` | Public | `{"institutionId":number,"email":string,"password":string}` | `{"accessToken":string,"refreshToken":string,"user":object}` | 400, 401 |
| `POST` | `/register` | Public | `{"institutionId":number,"email":string,"password":string,"role":string}` | `{"accessToken":string,"user":object}` | 400, 409 |
| `GET` | `/default-institution` | Public | None | `{"id":number,"name":string}` | 404, 500 |
| `POST` | `/refresh` | Public | `{"refreshToken":string}` | `{"accessToken":string}` | 401 |

---

## 3. AI Officer Operations & Streaming (`/api/v1/officers`)

| Method | Endpoint | Auth | Request Body Schema | Output Response Type | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/accreditation/stream` | Admin/Faculty | `{"reportType":string}` | SSE Stream (`text/event-stream`) | 400, 401, 403 |
| `POST` | `/student-success/stream` | Admin/Faculty | `{"reportType":string}` | SSE Stream (`text/event-stream`) | 400, 401, 403 |
| `POST` | `/timetable/stream` | Admin/Faculty | `{"reportType":string}` | SSE Stream (`text/event-stream`) | 400, 401, 403 |
| `POST` | `/admissions/stream` | Admin/Faculty | `{"reportType":string}` | SSE Stream (`text/event-stream`) | 400, 401, 403 |
| `POST` | `/finance/stream` | Admin/Faculty | `{"reportType":string}` | SSE Stream (`text/event-stream`) | 400, 401, 403 |
| `POST` | `/:type/export-pdf` | Admin/Faculty | `{"text":string,"institutionName":string}` | Binary PDF (`application/pdf`) | 400, 401, 500 |

---

## 4. Automation Business & CRM Pipeline (`/api/v1/leads`)

| Method | Endpoint | Auth | Request Body Schema | Success Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/leads` | Public | `{"collegeName":string,"contactName":string,"email":string,"phone":string,"website":string?}` | `{"success":true,"leadId":number}` | 400, 500 |
| `GET` | `/api/v1/leads` | Admin | Query: `status`, `page`, `limit` | `{"leads":[],"total":number,"page":number}` | 401, 403 |
| `PATCH` | `/api/v1/leads/:id` | Admin | `{"status":string?,"notes":string?}` | `{"success":true,"lead":object}` | 401, 404 |
| `POST` | `/api/v1/leads/:id/send-pilot-offer` | Admin | None | `{"success":true,"message":string}` | 401, 404, 500 |

---

## 5. Report Delivery & Public Document Access

| Method | Endpoint | Auth | Request Body Schema | Success Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/reports/deliver` | Admin | `{"collegeName":string,"contactEmail":string,"reportContent":string}` | `{"success":true,"token":string,"viewUrl":string}` | 400, 401 |
| `GET` | `/api/v1/reports` | Admin | None | `{"reports":[],"total":number}` | 401 |
| `GET` | `/r/:token` | Public | None | Rendered HTML Document (View Count Incremented) | 404 |
| `GET` | `/r/:token/pdf` | Public | None | Binary PDF Stream (`application/pdf`) | 404, 500 |

---

## 6. Institutional Invoice Generation (`/api/v1/invoices`)

| Method | Endpoint | Auth | Request Body Schema | Success Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/invoices` | Admin | `{"institutionName":string,"contactEmail":string,"items":array}` | `{"success":true,"invoice":object}` | 400, 401 |
| `GET` | `/api/v1/invoices` | Admin | Query: `status`, `page`, `limit` | `{"invoices":[],"total":number}` | 401 |
| `GET` | `/api/v1/invoices/:id/pdf` | Public/Admin | None | Binary PDF Stream (`application/pdf`) | 404 |
| `PATCH` | `/api/v1/invoices/:id/mark-paid` | Admin | None | `{"success":true,"invoice":object}` | 401, 404 |
