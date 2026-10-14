# Google Play Store Publishing Checklist — EduFlow AI Mobile

> Application: **EduFlow AI — Institutional OS**  
> Package ID: `com.eduflow.eduflow_app`  
> Target Track: Production / Closed Testing (20 Testers)

---

## 1. Technical Prerequisites

- [ ] **Android App Bundle (.aab)**: Built via `flutter build appbundle --release`.
- [ ] **Target SDK**: Target API Level **34 (Android 14)** or higher.
- [ ] **Min SDK**: API Level **24 (Android 7.0)**.
- [ ] **64-bit Compliance**: Arm64-v8a and x86_64 binaries included.
- [ ] **ProGuard & R8**: `isMinifyEnabled = true` and `isShrinkResources = true` enabled in `build.gradle.kts`.
- [ ] **Cryptographic Signing**: Keystore created (`upload-keystore.jks`) and configured in `key.properties`.

---

## 2. Store Listing Assets

All store listing copy is maintained in `eduflow-core/mobile/store-listing/`:
- [x] **App Title**: `EduFlow AI — Institutional OS` (<= 30 characters)
- [x] **Short Description**: `AI-powered campus operations, attendance, academic schedules & student success.` (<= 80 characters)
- [x] **Full Description**: Comprehensive description detailing AI Officers, timetable, and attendance (<= 4000 characters)
- [ ] **App Icon**: 512 x 512 px 32-bit PNG with alpha channel.
- [ ] **Feature Graphic**: 1024 x 500 px JPG or 24-bit PNG (no alpha).
- [ ] **Phone Screenshots**: Minimum 4 screenshots (1080 x 2400 px, 16:9 or 9:16 aspect ratio):
  1. AI Officers Dashboard
  2. WhatsApp & Mobile Attendance
  3. Real-time Timetable & Conflict Resolution
  4. Fee Reminders & UPI Payment Gateway
- [ ] **Tablet Screenshots**: 7-inch and 10-inch screenshots for Dean/Principal tablet view.

---

## 3. Data Safety Form & Privacy Declarations

Under Google Play Data Safety policies and India's **DPDP Act 2023**:

| Data Category | Data Elements Collected | Purpose | Encrypted in Transit | Deletion Mechanism |
|---|---|---|---|---|
| **Personal Info** | Name, Email address, Student/Employee ID | App functionality, Account management | Yes (TLS 1.3) | Data principal erasure request in app / web |
| **Financial Info** | Tuition invoices, fee status, UTR numbers | Payment reconciliation & reminder notifications | Yes (TLS 1.3) | Retained per statutory tax mandate (7 yrs) |
| **Academic Records** | Course attendance, class schedule | Attendance tracking & NAAC compliance | Yes (TLS 1.3) | Managed by University Data Fiduciary |
| **Device & IDs** | FCM Push Token | Push notifications & emergency escalations | Yes (TLS 1.3) | Revoked on logout |

- **Third-Party Data Sharing**: **NONE**. Data is strictly processed for the student's enrolled educational institution.
- **Children's Privacy**: Directed at Higher Education students (18+ years). No data collected from children under 13 without institutional parental consent.

---

## 4. App Access Review Credentials for Google Reviewers

In Google Play Console under **Policy > App content > App access**:
- **Selection**: "All or some functionality is restricted"
- **Test Account Email**: `playreview@demo.edu`
- **Test Account Password**: `Review@EduFlow2026`
- **Demo Institution**: `Sri Siddhartha Institute of Technology (Demo)`
- **Instructions**: "Log in with the credentials provided to access the student/faculty campus dashboard."

---

## 5. Build & Submission Procedure

```bash
cd eduflow-core/mobile

# 1. Fetch dependencies and run static analysis
flutter pub get
flutter analyze

# 2. Build production Android App Bundle
flutter build appbundle --release

# 3. Output artifact location:
# build/app/outputs/bundle/release/app-release.aab
```
Upload `app-release.aab` to Google Play Console under **Release > Production > Create new release**.
