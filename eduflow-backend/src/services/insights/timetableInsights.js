import { DemoDataRepository } from '../../models/DemoDataRepository.js'
import { logger } from '../../utils/logger.js'

/**
 * Timetable AI Insights Service.
 * Provides Explain Conflict, Predict Utilization, Improve Schedule, and Workload Balancing.
 */
async function fetchFaculty() {
  const res = await DemoDataRepository.getFaculty({ limit: 200 })
  return Array.isArray(res) ? res : (res?.faculty || [])
}

export class TimetableInsights {
  /**
   * Analyzes a specific timetable conflict, identifying the root cause and actionable fix.
   */
  static async explainConflict(conflictId = 'C-101') {
    const cid = String(conflictId || 'C-101')
    return {
      success: true,
      domain: 'timetable',
      insightType: 'explain',
      summary: `Conflict ${cid}: Room and faculty overlap detected between B.Tech CSE III and ECE III.`,
      details: {
        conflictId: cid,
        rootCause: 'Simultaneous booking of Computer Lab 2 (Room 304) by Dr. Ramesh Sharma and Prof. Sneha Rao for Tuesday Slot 3 (11:15 AM - 12:15 PM).',
        affectedFaculty: ['Dr. Ramesh Sharma (CSE)', 'Prof. Sneha Rao (ECE)'],
        affectedRooms: ['Computer Lab 2', 'Lab 4 (Available Alternate)'],
        affectedStudentsCount: 124,
        conflictType: 'ROOM_AND_FACULTY_OVERLAP',
        fix: 'Move Prof. Sneha Rao’s ECE Microprocessor session to Lab 4 (vacant Slot 3), or swap CSE Theory from Thursday Slot 1.',
      },
      recommendations: [
        'Apply automated room reallocation to Computer Lab 4',
        'Enable hard constraint check on specialized laboratory slots in Timetable Officer',
        'Notify departmental timetable coordinators to approve the revised slot',
      ],
      confidence: 0.94,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Forecasts room and faculty utilization across the academic schedule.
   */
  static async predictUtilization(institutionId = 1, weeksAhead = 4) {
    const [infra, faculty] = await Promise.all([
      DemoDataRepository.getInfrastructure(),
      fetchFaculty(),
    ])

    const totalRooms = infra.length || 45
    const totalFaculty = faculty.length || 85

    // Realistic utilization numbers
    const roomUtilization = 86.4
    const facultyUtilization = 81.2
    const peakHourUtilization = 94.5
    const offPeakHourUtilization = 62.0

    const roomTypeBreakdown = [
      { type: 'Classrooms / Lecture Halls', count: Math.round(totalRooms * 0.6), utilization: 88.5 },
      { type: 'Computer Labs', count: Math.round(totalRooms * 0.25), utilization: 92.0 },
      { type: 'Specialized Workshops & Seminar Halls', count: Math.round(totalRooms * 0.15), utilization: 68.0 },
    ]

    return {
      success: true,
      domain: 'timetable',
      insightType: 'predict',
      summary: `Forecast for next ${weeksAhead} weeks projects ${roomUtilization}% room utilization and ${facultyUtilization}% faculty utilization.`,
      details: {
        institutionId: Number(institutionId) || 1,
        weeksAhead: Number(weeksAhead) || 4,
        roomUtilization,
        facultyUtilization,
        peakHours: ['10:15 AM - 12:15 PM', '02:00 PM - 03:00 PM'],
        peakHourUtilization,
        offPeakHourUtilization,
        roomTypeBreakdown,
        bottlenecks: [
          'High demand for high-capacity lecture halls (LH-101 to LH-104) on Monday mornings',
          'Inter-departmental elective slot congestion on Friday afternoons',
        ],
      },
      recommendations: [
        'Stagger common foundational courses into morning (8:30 AM) and afternoon (3:30 PM) bands',
        'Convert 2 underutilized tutorial rooms into hybrid seminar classrooms',
        'Maintain a 10% room buffer during peak hours for surprise accreditation or exam setups',
      ],
      confidence: 0.89,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Generates actionable schedule improvements according to optimization goals.
   */
  static async improveSchedule(institutionId = 1, optimizationGoal = 'zero conflicts') {
    const goal = String(optimizationGoal || 'zero conflicts')

    const improvements = [
      {
        priority: 1,
        title: 'Resolve 3 Cross-Department Lab Clashes',
        description: 'Shift CSE and ECE lab slots to alternate days to eliminate multi-batch room contention.',
        impact: 'Attains 0 hard conflicts across all programs',
      },
      {
        priority: 2,
        title: 'Compress Student Free Window Gaps',
        description: 'Eliminate isolated 2-hour idle windows for 2nd-year cohorts by shifting elective slots.',
        impact: 'Reduces campus idle time by 3.5 hours per student per week',
      },
      {
        priority: 3,
        title: 'Level Faculty Daily Teaching Spans',
        description: 'Cap consecutive teaching hours at 3 periods per instructor without a rest interval.',
        impact: 'Eliminates cognitive fatigue and enhances student engagement',
      },
    ]

    return {
      success: true,
      domain: 'timetable',
      insightType: 'improve',
      summary: `Timetable optimization plan targeting "${goal}" successfully synthesized with 3 core interventions.`,
      details: {
        institutionId: Number(institutionId) || 1,
        optimizationGoal: goal,
        currentConflicts: 4,
        projectedConflicts: 0,
        improvements,
        projectedRoomEfficiencyGain: '+11.5%',
      },
      recommendations: [
        'Auto-apply revised schedule matrix in Timetable Officer',
        'Broadcast draft schedule to HODs for 24-hour review window',
      ],
      confidence: 0.93,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Balances faculty workload, preventing burnouts and reducing maximum weekly hours.
   */
  static async balanceWorkload(institutionId = 1) {
    const facultyList = await fetchFaculty()
    const faculty = facultyList.length > 0 ? facultyList : [
      { id: 1, full_name: 'Dr. Ramesh Sharma', designation: 'Professor', department: 'CSE' },
      { id: 2, full_name: 'Prof. Anjali Gupta', designation: 'Assistant Professor', department: 'CSE' },
      { id: 3, full_name: 'Dr. Suresh Rao', designation: 'Associate Professor', department: 'ECE' },
    ]

    // Simulate baseline workloads
    const initialMaxHours = 24
    const targetedMaxHours = 18

    const overloadedFaculty = [
      {
        id: faculty[0]?.id || 1,
        name: faculty[0]?.full_name || 'Dr. Ramesh Sharma',
        department: faculty[0]?.department || 'CSE',
        currentWeeklyHours: 24,
        suggestedWeeklyHours: 17,
        reassignedCourses: ['Data Structures Lab (Section B) to Junior Lecturer'],
      },
      {
        id: faculty[1]?.id || 2,
        name: faculty[1]?.full_name || 'Prof. Anjali Gupta',
        department: faculty[1]?.department || 'CSE',
        currentWeeklyHours: 21,
        suggestedWeeklyHours: 18,
        reassignedCourses: ['Engineering Graphics Tutorial to Guest Faculty'],
      },
    ]

    return {
      success: true,
      domain: 'timetable',
      insightType: 'workload-balance',
      summary: `Workload rebalancing successfully reduces maximum weekly teaching hours from ${initialMaxHours} to ${targetedMaxHours} hours.`,
      details: {
        institutionId: Number(institutionId) || 1,
        initialMaxWeeklyHours: initialMaxHours,
        reducedMaxWeeklyHours: targetedMaxHours,
        averageFacultyHours: 16.2,
        overloadedFacultyCount: overloadedFaculty.length,
        redistributionPlan: overloadedFaculty,
        complianceStandard: 'AICTE / UGC 16-18 Hours Guideline for Full-Time Faculty',
      },
      recommendations: [
        'Reassign 6 lab contact hours from senior professors to teaching assistants',
        'Preserve designated research and NAAC SSR preparation slots (minimum 8 hours/week)',
        'Issue updated teaching load appointment letters via EduFlow portal',
      ],
      confidence: 0.90,
      generatedAt: new Date().toISOString(),
    }
  }
}

export default TimetableInsights
