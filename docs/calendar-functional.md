# Academic Calendar Functional Specification & Verification Criteria

## Expected Behaviors & Invariants

### 1. Multi-Role Event Visibility
- **Admin & HOD**: Can create, inspect, edit, reschedule, and delete events.
- **Faculty & Students**: Can view all published calendar events, examination blocks, semester start/end dates, and public holidays.
- **Audience Role Filtering**: If an event defines `audienceRoles: ['student', 'faculty']`, it appears in both student and faculty calendar feeds. If scoped to specific departments (e.g. `CSE`), HODs of other departments do not see it in their primary departmental view.

### 2. Timezone & Date Range Validation
- `endDate` MUST be greater than or equal to `startDate`. A payload where `endDate < startDate` must reject with HTTP 400 Bad Request (`"endDate cannot precede startDate"`).
- All event dates are stored in UTC ISO format (or standard `YYYY-MM-DD` date without timezone distortion) and rendered consistently in Indian Standard Time (IST / UTC+05:30).

### 3. Holiday Engine & Second Saturday Rules
- Gazetted central and state holidays for Karnataka (KA), Andhra Pradesh (AP), Telangana (TS), Maharashtra (MH), and Tamil Nadu (TN) are accurately populated.
- When `stateCode === 'AP'` or `stateCode === 'TS'` or `applySecondSaturday: true`, the second Saturday of each calendar month is automatically tagged as a mandatory state gazetted holiday.

### 4. Dynamic Holiday & Exam Adjustments
- Rescheduling an event via `/api/v1/calendar/:calendarId/adjust` updates the date bounds and appends an entry to the `calendar_adjustments` audit log with the initiating user's ID and mandatory textual justification.

### 5. UI Resilience
- Skeletons render during calendar network fetch.
- Empty states gracefully prompt administrators to generate or import events when the schedule is blank.
