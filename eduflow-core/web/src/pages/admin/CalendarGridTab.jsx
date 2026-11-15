import React from "react";
import { ChevronLeft, ChevronRight, CalendarCheck, ShieldAlert, Sparkles, Clock, AlertCircle } from "lucide-react";

export default function CalendarGridTab({
  currentMonthIndex,
  setCurrentMonthIndex,
  ACADEMIC_MONTHS,
  yStart,
  yEnd,
  holidays,
  events,
  vacations,
  compensatoryClasses,
  setShowAdjustModal,
  setAdjustForm,
  setShowOptionalModal,
  setOptionalForm,
}) {
  const curMonthInfo = ACADEMIC_MONTHS[currentMonthIndex] || ACADEMIC_MONTHS[0];
  const curMonthYear = curMonthInfo.isEven ? yEnd : yStart;
  const daysInCurMonth = new Date(curMonthYear, curMonthInfo.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(curMonthYear, curMonthInfo.month, 1).getDay();

  let monthlyTeachingCount = 0;
  let monthlyHolidayCount = 0;
  let monthlyExamCount = 0;
  let monthlyVacationCount = 0;

  for (let d = 1; d <= daysInCurMonth; d++) {
    const dateStr = curMonthYear + "-" + String(curMonthInfo.month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const dow = (firstDayOfWeek + d - 1) % 7;
    const isHoli = holidays.some((h) => h.date === dateStr);
    const isExam = events.some((e) => e.event_type === "EXAM" && e.start_date <= dateStr && (e.end_date || e.start_date) >= dateStr);
    const isVac = vacations.some((v) => v.startDate <= dateStr && v.endDate >= dateStr);
    const isComp = compensatoryClasses.some((c) => c.date === dateStr);

    if (isHoli) monthlyHolidayCount++;
    else if (isExam) monthlyExamCount++;
    else if (isVac) monthlyVacationCount++;
    else if (dow !== 0 || isComp) monthlyTeachingCount++;
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3 bg-light rounded-3 border gap-2">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-white border shadow-sm px-2.5 py-1"
            disabled={currentMonthIndex <= 0}
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="fw-bold fs-5 text-dark px-1">
            {curMonthInfo.name} {curMonthYear}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-white border shadow-sm px-2.5 py-1"
            disabled={currentMonthIndex >= ACADEMIC_MONTHS.length - 1}
            onClick={() => setCurrentMonthIndex((prev) => Math.min(ACADEMIC_MONTHS.length - 1, prev + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 text-center small">
          <span className="badge bg-primary px-2.5 py-1.5">
            Teaching: {monthlyTeachingCount} Days
          </span>
          <span className="badge bg-danger px-2.5 py-1.5">
            Holidays: {monthlyHolidayCount} Days
          </span>
          <span className="badge bg-warning text-dark px-2.5 py-1.5">
            Exams: {monthlyExamCount} Days
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle" style={{ borderColor: "#e2e8f0" }}>
          <thead className="table-light">
            <tr>
              <th className="text-danger">Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th className="text-primary">Sat</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows = [];
              let cells = [];
              for (let i = 0; i < firstDayOfWeek; i++) {
                cells.push(<td key={"empty-" + i} className="bg-light opacity-50"></td>);
              }

              for (let d = 1; d <= daysInCurMonth; d++) {
                const slot = cells.length;
                const isSunday = slot % 7 === 0;
                const isSaturday = slot % 7 === 6;
                const dateStr = curMonthYear + "-" + String(curMonthInfo.month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
                const holi = holidays.find((h) => h.date === dateStr);
                const isExam = events.some((e) => e.event_type === "EXAM" && e.start_date <= dateStr && (e.end_date || e.start_date) >= dateStr);

                cells.push(
                  <td key={"day-" + d} style={{ height: "70px", verticalAlign: "top", textAlign: "left", padding: "0.4rem" }}>
                    <div className="d-flex justify-content-between">
                      <span className={"fw-bold " + (isSunday ? "text-danger" : isSaturday ? "text-primary" : "text-dark")}>
                        {d}
                      </span>
                    </div>
                    {holi && <div className="badge bg-danger-subtle text-danger text-truncate d-block mt-1" style={{ fontSize: "0.65rem" }}>{holi.name}</div>}
                    {isExam && <div className="badge bg-warning-subtle text-warning text-truncate d-block mt-1" style={{ fontSize: "0.65rem" }}>Exam</div>}
                  </td>
                );

                if (cells.length === 7) {
                  rows.push(<tr key={"row-" + d}>{cells}</tr>);
                  cells = [];
                }
              }

              if (cells.length > 0) {
                while (cells.length < 7) {
                  cells.push(<td key={"empty-end-" + cells.length} className="bg-light opacity-50"></td>);
                }
                rows.push(<tr key="row-last">{cells}</tr>);
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
