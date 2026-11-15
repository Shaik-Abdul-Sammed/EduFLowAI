/**
 * EduFlow AI - Dean & Faculty Student Escalations Service
 * Shared persistent service connecting Student Escalation Desk and Dean/Faculty AI Console.
 */

const STORAGE_KEY = 'eduflow_dean_escalations'

export const INITIAL_ESCALATIONS = [
  {
    id: 'ESC-2026-1042',
    studentId: '22BCE1044',
    studentName: 'Ananya Sharma',
    department: 'Computer Science & Engineering',
    semester: '6th Semester (Section A)',
    recipient: 'Dean of Academic Affairs',
    category: 'Academic / Attendance',
    priority: 'High',
    subject: 'Duty Leave & Attendance Condonation for Smart India Hackathon Grand Finale',
    description: 'I represented our institute at the national SIH 2026 Grand Finale from Feb 20 to Feb 25 in New Delhi. The formal OD application signed by our Faculty Advisor was submitted to the department office, but my Operating Systems (CS301) attendance currently reflects absent for 6 lab hours, dropping me below 75%. Requesting official dean condonation before hall tickets are locked.',
    roomOrCourse: 'CS301 (OS Lab)',
    isAnonymous: false,
    status: 'Under Dean Review',
    submittedAt: '2026-03-01T09:30:00Z',
    aiAnalysis: {
      sentiment: 'Polite & Urgent',
      rootCause: 'Institutional representation OD credit not synchronized with faculty register.',
      suggestedAction: 'Approve 6 attendance condonation credits under Clause 4.2 (Co-curricular National Representation).',
      urgencyScore: 88,
      tags: ['SIH-2026', 'Attendance-Condonation', 'Dean-Academic', 'CS301']
    },
    deanRemarks: 'Verified with College Hackathon Coordinator Dr. Anupama. Condonation approved; forwarding instruction to Head of CSE.',
    updatedAt: '2026-03-01T14:15:00Z'
  },
  {
    id: 'ESC-2026-1043',
    studentId: '22BCE1019',
    studentName: 'Rohan Deshmukh',
    department: 'Computer Science & Engineering',
    semester: '6th Semester (Section B)',
    recipient: 'Dean of Student Welfare',
    category: 'Hostel & Campus Facilities',
    priority: 'Critical',
    subject: 'Block 4 Hostel Water Purifier Breakdown & Filter Contamination',
    description: 'The commercial RO drinking water plant on the 2nd floor of Block 4 hostel has been giving turbid water for 3 days. Multiple students have reported stomach upset. Sub-warden was informed verbally but technician has not visited. Urgent replacement of RO membrane and sanitization needed.',
    roomOrCourse: 'Hostel Block 4, Floor 2',
    isAnonymous: false,
    status: 'Action Taken',
    submittedAt: '2026-03-02T11:15:00Z',
    aiAnalysis: {
      sentiment: 'High Distress / Health Hazard',
      rootCause: 'Hostel RO water filtration maintenance overdue posing hygiene risk.',
      suggestedAction: 'Immediate dispatch of estate maintenance team and supply temporary bottled dispensers.',
      urgencyScore: 96,
      tags: ['Hostel-Welfare', 'Health-Safety', 'RO-Maintenance', 'Immediate-Dispatch']
    },
    deanRemarks: 'Estate officer summoned. Emergency bottled mineral water dispensers deployed on all Block 4 floors while filter replacement is underway.',
    updatedAt: '2026-03-02T13:40:00Z'
  },
  {
    id: 'ESC-2026-1044',
    studentId: '22BCE1058',
    studentName: 'Karthik Raja',
    department: 'Computer Science & Engineering',
    semester: '6th Semester (Section A)',
    recipient: 'Head of Department (HOD)',
    category: 'Infrastructure & Labs',
    priority: 'Medium',
    subject: 'High-Performance Computing Lab (Lab 3B) CUDA & PyTorch Driver Incompatibility',
    description: 'For our Distributed Deep Learning capstone project, workstations 12 through 24 in Lab 3B have conflicting NVIDIA driver 535 with CUDA 12.4, preventing GPU tensor acceleration on RTX 4090 nodes. Our model training milestone is due next week.',
    roomOrCourse: 'Lab 3B (Systems Lab)',
    isAnonymous: false,
    status: 'Submitted',
    submittedAt: '2026-03-03T16:20:00Z',
    aiAnalysis: {
      sentiment: 'Technical Blockers',
      rootCause: 'GPU workstation driver mismatch hindering B.Tech capstone progress.',
      suggestedAction: 'Assign lab systems administrator to run automated Ansible playbook for CUDA driver uniform update.',
      urgencyScore: 72,
      tags: ['Lab-3B', 'GPU-CUDA', 'Capstone-Milestone', 'SysAdmin']
    },
    deanRemarks: null,
    updatedAt: '2026-03-03T16:20:00Z'
  },
  {
    id: 'ESC-2026-1045',
    studentId: 'Anonymous',
    studentName: 'Confidential Student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    recipient: 'Dean of Academic Affairs',
    category: 'Academic / Evaluation',
    priority: 'Normal',
    subject: 'Continuous Internal Assessment (CIA-2) Answer Sheet Photocopy Delay',
    description: 'Our marks for Compiler Design (CS305) CIA-2 were published on the student portal, but the department notice specified 2 days for verification of physical answer sheets. When our class went to the staff room, faculty was on leave and no alternate provision was made.',
    roomOrCourse: 'CS305 (Compiler Design)',
    isAnonymous: true,
    status: 'Submitted',
    submittedAt: '2026-03-04T08:45:00Z',
    aiAnalysis: {
      sentiment: 'Concerned / Transparency',
      rootCause: 'Evaluation paper verification window missed due to faculty absence.',
      suggestedAction: 'Extend evaluation verification window by 48 hours and notify course coordinator.',
      urgencyScore: 64,
      tags: ['Evaluation-Transparency', 'CIA-Verification', 'CS305']
    },
    deanRemarks: null,
    updatedAt: '2026-03-04T08:45:00Z'
  }
]

export function getEscalations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ESCALATIONS))
      return INITIAL_ESCALATIONS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed reading escalations from storage:', err)
    return INITIAL_ESCALATIONS
  }
}

export function saveEscalations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eduflow_escalations_updated', { detail: list }))
    }
  } catch (err) {
    console.error('Failed saving escalations:', err)
  }
}

export function aiCategorizeIssue(text, subject = '') {
  const combined = `${subject} ${text}`.toLowerCase()

  let category = 'Academic / Evaluation'
  let priority = 'Normal'
  let urgencyScore = 60
  const tags = []

  if (combined.includes('water') || combined.includes('food') || combined.includes('mess') || combined.includes('hostel') || combined.includes('room') || combined.includes('washroom')) {
    category = 'Hostel & Campus Facilities'
    tags.push('Hostel-Welfare')
    urgencyScore = 80
  } else if (combined.includes('gpu') || combined.includes('lab') || combined.includes('server') || combined.includes('system') || combined.includes('wifi') || combined.includes('computer') || combined.includes('internet')) {
    category = 'Infrastructure & Labs'
    tags.push('Lab-Infrastructure')
    urgencyScore = 75
  } else if (combined.includes('fee') || combined.includes('scholarship') || combined.includes('receipt') || combined.includes('payment') || combined.includes('dues')) {
    category = 'Scholarships & Fees'
    tags.push('Finance-Support')
    urgencyScore = 70
  } else if (combined.includes('urgent') || combined.includes('ragging') || combined.includes('harass') || combined.includes('hospital') || combined.includes('medical') || combined.includes('mental')) {
    category = 'Wellbeing & Urgent Support'
    priority = 'Critical'
    urgencyScore = 95
    tags.push('Urgent-Care')
  }

  if (combined.includes('exam') || combined.includes('clash') || combined.includes('attendance') || combined.includes('condonation') || combined.includes('75%') || combined.includes('grade')) {
    tags.push('Academic-Integrity')
    if (combined.includes('75%') || combined.includes('condonation')) priority = 'High'
  }

  return {
    category,
    suggestedPriority: priority,
    urgencyScore,
    sentiment: urgencyScore > 85 ? 'High Distress / Urgent' : urgencyScore > 70 ? 'Concerned / Action-Required' : 'Informative / Constructive',
    rootCause: `Automated NLP detected core concern around ${category.toLowerCase()}.`,
    suggestedAction: priority === 'Critical' ? 'Immediate escalation to Dean & Emergency Contact team.' : `Forward ticket to ${category.split('/')[0].trim()} leadership for direct resolution.`,
    tags
  }
}

export function createEscalation(data) {
  const all = getEscalations()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const id = `ESC-2026-${randomSuffix}`

  const aiAnalysis = aiCategorizeIssue(data.description, data.subject)

  const newIssue = {
    id,
    studentId: data.isAnonymous ? 'Anonymous' : (data.studentId || '22BCE1044'),
    studentName: data.isAnonymous ? 'Confidential Student' : (data.studentName || 'Ananya Sharma'),
    department: data.department || 'Computer Science & Engineering',
    semester: data.semester || '6th Semester (Section A)',
    recipient: data.recipient || 'Dean of Academic Affairs',
    category: data.category || aiAnalysis.category,
    priority: data.priority || aiAnalysis.suggestedPriority,
    subject: data.subject,
    description: data.description,
    roomOrCourse: data.roomOrCourse || 'General Academic',
    isAnonymous: Boolean(data.isAnonymous),
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    aiAnalysis,
    deanRemarks: null,
    updatedAt: new Date().toISOString()
  }

  const updated = [newIssue, ...all]
  saveEscalations(updated)
  return newIssue
}

export function updateEscalationStatus(id, newStatus, deanRemarks = null) {
  const all = getEscalations()
  const updated = all.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        deanRemarks: deanRemarks !== null ? deanRemarks : item.deanRemarks,
        updatedAt: new Date().toISOString()
      }
    }
    return item
  })
  saveEscalations(updated)
  return updated.find(i => i.id === id)
}

export function aiDraftDeanResponse(issue) {
  const { recipient, studentName, subject, category } = issue
  return `MEMORANDUM / DIRECTIVE

From: Office of the ${recipient}
To: ${studentName} (${issue.department})
Ref: Ticket ${issue.id} - ${subject}

Dear Student,

We acknowledge receipt of your formal escalation regarding ${category.toLowerCase()}. 

1. Administrative Assessment:
The details submitted have been reviewed alongside our departmental records and infrastructure status. 

2. Executive Action Ordered:
The relevant division (Course Coordinator / Estate Officer / Lab Superintendent) has been instructed to remediate this immediately without prejudice to your academic standing.

3. Resolution Assurance:
Should this issue require physical verification, our office remains open between 3:00 PM and 5:00 PM on working days.

Sincerely,
Dr. V. Ramanathan
Dean of Academic & Institutional Governance`
}

export function aiSummarizeAll(escalations) {
  const total = escalations.length
  const pending = escalations.filter(e => e.status === 'Submitted').length
  const underReview = escalations.filter(e => e.status === 'Under Dean Review').length
  const critical = escalations.filter(e => e.priority === 'Critical').length

  const categories = {}
  escalations.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + 1
  })

  return {
    total,
    pending,
    underReview,
    critical,
    categoryBreakdown: categories,
    executiveSummary: `Institutional Dean Briefing: Out of ${total} recorded student tickets, ${pending} are pending triage and ${critical} require immediate executive intervention. Academic condonation and hostel infrastructure form the top 70% of student escalations this cycle. Automated sentiment indicates urgency around semester examinations.`,
    recommendedDirectives: [
      'Issue immediate blanket OD attendance credits for university-approved hackathon contingents.',
      'Order emergency inspection of Block 4 water filtration units by Estate Maintenance by 5:00 PM.',
      'Deploy uniform CUDA 12.4 configuration across Lab 3B before evening capstone batch.'
    ]
  }
}
