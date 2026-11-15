// ── Shared Mock Data Store ────────────────────────────────────────────────────
// Acts as an in-memory "backend" shared between faculty and student pages.
// Faculty publish → students receive.

export const STUDENT = {
  id: 'S001',
  name: 'Ananya Sharma',
  roll: '22BCE1044',
  section: 'CSE-6A',
  degree: 'Bachelor of Technology (B.Tech)',
  department: 'Computer Science & Engineering',
  year: 3,
  semester: 6,
  mentor: { name: 'Dr. Ramesh Sundaram', subject: 'Operating Systems & Cloud Architecture', phone: '9876543210', email: 'ramesh.sundaram@eduflow.ac.in', available: 'Mon, Wed, Fri — 2 PM to 4 PM' },
  hostel: { block: 'Aryabhata Block C', room: '312', roommates: ['Sanjana Rao', 'Meera Krishnan'] },
  bus: { route: 'Campus Shuttle 4', stop: 'Tech Park Gate 2', busNo: 'KA-04-TR-5678', driver: 'M. Chennappa', phone: '9000012345' },
  section_students: ['Aarav Sharma','Ananya Sen','Devendra Patel','Ishaan Varma','Meera Krishnan','Nikhil Deshmukh','Priya Nambiar','Rohan Gupta','Sanjana Rao','Vikramaditya Singh','Aditya Kashyap','Karthik Rao','Sneha Nambiar','Varun Desai','Nisha Reddy','Tanvi Joshi','Deepak Nair'],
}

// ── Faculty-Published Assignments (shared between faculty creator & student viewer)
export const sharedAssignments = [
  { id: 1, title: 'eBPF Kernel Trace & Process Accounting Lab', subject: 'Operating Systems', section: 'CSE-6A', due: '2026-06-10', maxMarks: 25, faculty: 'Prof. Ramesh Sundaram', description: 'Write an eBPF kprobe program attached to sys_enter_execve to measure scheduler queue delays. Submit Git PR and analysis PDF.', status: 'active', publishedOn: '2026-05-28' },
  { id: 2, title: 'B+ Tree Page Split & Query Cost Planner', subject: 'Database Management Systems', section: 'CSE-6A', due: '2026-06-12', maxMarks: 20, faculty: 'Dr. Anupama Verma', description: 'Implement concurrency-safe slotted page allocation and leaf node splits with latch coupling in C++.', status: 'active', publishedOn: '2026-05-29' },
  { id: 3, title: 'TCP Cubic vs BBR Congestion Window Benchmark', subject: 'Computer Networks', section: 'CSE-6A', due: '2026-05-30', maxMarks: 20, faculty: 'Dr. S. K. Narayanan', description: 'Simulate high RTT packet drop topologies on Minikube and record throughput comparisons.', status: 'active', publishedOn: '2026-05-22' },
  { id: 4, title: 'Raft Consensus Heartbeat & Log Compaction', subject: 'Distributed Systems', section: 'CSE-6A', due: '2026-06-18', maxMarks: 25, faculty: 'Prof. K. Venkatesh', description: 'Implement leader lease renewal, snapshot installation RPCs, and cluster membership reconfiguration.', status: 'active', publishedOn: '2026-06-01' },
  { id: 5, title: 'LR(1) Parser Table Construction & Conflict Elimination', subject: 'Compiler Design', section: 'CSE-6A', due: '2026-05-20', maxMarks: 20, faculty: 'Dr. Priya Shenoy', description: 'Construct canonical collection of LR(1) items and resolve shift/reduce ambiguities.', status: 'closed', publishedOn: '2026-05-10' },
]

// Student's submission records keyed by assignment ID
export const studentSubmissions = {
  5: { submittedOn: '2026-05-19', score: 19, feedback: 'Clean grammar item set construction; correct precedence tables.' },
}

// ── Attendance Data
export const attendanceData = {
  overall: 84,
  subjects: [
    { name: 'Operating Systems & Concurrency',        classes: 48, attended: 44, pct: 92, faculty: 'Prof. Ramesh Sundaram' },
    { name: 'Database Management Systems',            classes: 46, attended: 41, pct: 89, faculty: 'Dr. Anupama Verma' },
    { name: 'Computer Networks & Protocols',          classes: 44, attended: 38, pct: 86, faculty: 'Dr. S. K. Narayanan' },
    { name: 'Distributed Systems & Microservices',    classes: 42, attended: 33, pct: 78, faculty: 'Prof. K. Venkatesh' },
    { name: 'Compiler Design & Automata',             classes: 40, attended: 26, pct: 65, faculty: 'Dr. Priya Shenoy' },
  ],
  // Weekly attendance: 1=present, 0=absent, null=holiday
  heatmap: [
    // Week 1 (Mon–Sat)
    [1,1,1,0,1,1],
    // Week 2
    [1,0,1,1,1,1],
    // Week 3
    [1,1,0,1,1,0],
    // Week 4
    [1,1,1,1,0,1],
    // Week 5
    [1,1,1,null,1,1],
  ],
}

// ── Marks Data
export const marksData = [
  { subject: 'Operating Systems & Concurrency',        internal: 19, midterm: 46, final: 91, max: { internal: 20, midterm: 50, final: 100 }, classAvg: { internal: 16, midterm: 38, final: 76 }, rank: 2 },
  { subject: 'Database Management Systems',            internal: 18, midterm: 44, final: 87, max: { internal: 20, midterm: 50, final: 100 }, classAvg: { internal: 15, midterm: 37, final: 74 }, rank: 4 },
  { subject: 'Computer Networks & Protocols',          internal: 17, midterm: 42, final: 84, max: { internal: 20, midterm: 50, final: 100 }, classAvg: { internal: 14, midterm: 35, final: 71 }, rank: 5 },
  { subject: 'Distributed Systems & Microservices',    internal: 18, midterm: 40, final: 81, max: { internal: 20, midterm: 50, final: 100 }, classAvg: { internal: 15, midterm: 36, final: 73 }, rank: 6 },
  { subject: 'Compiler Design & Automata',             internal: 16, midterm: 36, final: 74, max: { internal: 20, midterm: 50, final: 100 }, classAvg: { internal: 14, midterm: 33, final: 68 }, rank: 9 },
]

// ── Timetable
export const timetable = {
  periods: ['9:00–10:00', '10:00–11:00', '11:15–12:15', '12:15–1:15', '1:15–2:00', '2:00–3:00', '3:00–4:00', '4:00–5:00'],
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  schedule: [
    // Monday
    ['Operating Systems','DBMS','Computer Networks','Compiler Design',null,'Operating Systems Lab','Operating Systems Lab','Operating Systems Lab'],
    // Tuesday
    ['Distributed Systems','Operating Systems','DBMS','Computer Networks',null,'DBMS Practical','DBMS Practical',null],
    // Wednesday
    ['Compiler Design','Computer Networks','Distributed Systems','Operating Systems',null,'Cloud Computing','Cloud Computing',null],
    // Thursday
    ['DBMS','Distributed Systems','Computer Networks','Compiler Design',null,'Network Systems Lab','Network Systems Lab','Network Systems Lab'],
    // Friday
    ['Operating Systems','DBMS','Distributed Systems','Computer Networks',null,'Compiler Design','Project Lab',null],
    // Saturday
    ['Distributed Systems','Operating Systems','Technical Seminar',null,null,null,null,null],
  ],
  subjectColors: {
    'Operating Systems': '#2563EB',
    'DBMS':              '#10B981',
    'Computer Networks': '#F59E0B',
    'Distributed Systems': '#8B5CF6',
    'Compiler Design':   '#06B6D4',
    'Cloud Computing':   '#EC4899',
    'Operating Systems Lab': '#3B82F6',
    'DBMS Practical':    '#059669',
    'Network Systems Lab': '#D97706',
    'Project Lab':       '#7C3AED',
    'Technical Seminar': '#64748B'
  }
}

// ── Exam Schedule
export const examSchedule = [
  { id: 1, name: 'Mid-Term Assessment 1', subject: 'All Engineering Subjects', date: '2026-08-24', time: '9:30 AM', hall: 'Exam Block Hall 4', duration: '3 hrs', type: 'midterm', upcoming: true },
  { id: 2, name: 'Operating Systems Lab Viva', subject: 'Operating Systems', date: '2026-08-30', time: '1:30 PM', hall: 'CS Lab 304', duration: '3 hrs', type: 'practical', upcoming: true },
  { id: 3, name: 'DBMS Indexing & SQL Practical', subject: 'DBMS', date: '2026-09-04', time: '10:00 AM', hall: 'Database Lab 2', duration: '3 hrs', type: 'practical', upcoming: true },
  { id: 4, name: 'End-Semester Theory Examination', subject: 'All Engineering Subjects', date: '2026-11-16', time: '9:30 AM', hall: 'Main Examination Hall', duration: '3 hrs', type: 'final', upcoming: true },
]

// ── Weekly Exams / Tests
export const weeklyTests = [
  { week: 'Week 20', date: '2026-05-17', subject: 'Physics',     score: 17, max: 20, rank: 3,  classAvg: 14.2 },
  { week: 'Week 20', date: '2026-05-17', subject: 'Chemistry',   score: 15, max: 20, rank: 7,  classAvg: 13.8 },
  { week: 'Week 21', date: '2026-05-24', subject: 'Mathematics', score: 19, max: 20, rank: 1,  classAvg: 15.1 },
  { week: 'Week 21', date: '2026-05-24', subject: 'English',     score: 18, max: 20, rank: 2,  classAvg: 15.5 },
  { week: 'Week 22', date: '2026-05-31', subject: 'Physics',     score: 16, max: 20, rank: 4,  classAvg: 14.0 },
  { week: 'Week 22', date: '2026-05-31', subject: 'Chemistry',   score: 14, max: 20, rank: 9,  classAvg: 13.5 },
  { week: 'Week 22', date: '2026-05-31', subject: 'Mathematics', score: 20, max: 20, rank: 1,  classAvg: 15.8 },
]

// ── Fee Data
export const feeData = {
  totalFee: 120000,
  paidAmount: 85000,
  pendingAmount: 35000,
  nextDue: '2026-07-01',
  nextDueAmount: 35000,
  transactions: [
    { id: 'TXN001', date: '2026-01-10', description: 'Term 1 Tuition Fee',    amount: 45000, method: 'Online',  status: 'paid', receipt: 'RCP001' },
    { id: 'TXN002', date: '2026-01-15', description: 'Hostel Fee – Semester 1', amount: 25000, method: 'DD',   status: 'paid', receipt: 'RCP002' },
    { id: 'TXN003', date: '2026-03-05', description: 'Lab Fee',               amount: 8000,  method: 'Online',  status: 'paid', receipt: 'RCP003' },
    { id: 'TXN004', date: '2026-04-02', description: 'Exam Fee',              amount: 2000,  method: 'Cash',    status: 'paid', receipt: 'RCP004' },
    { id: 'TXN005', date: '2026-05-01', description: 'Library Deposit',       amount: 5000,  method: 'Online',  status: 'paid', receipt: 'RCP005' },
    { id: 'TXN006', date: '2026-07-01', description: 'Term 2 Tuition Fee',   amount: 35000, method: '—',       status: 'pending', receipt: null },
  ]
}

// ── Scholarship
export const scholarshipData = {
  name: 'Jagananna Vidya Deevena',
  amount: 15000,
  disbursedAmount: 15000,
  status: 'disbursed', // applied | verified | approved | disbursed
  stages: [
    { label: 'Applied',   date: '2026-01-05', done: true },
    { label: 'Verified',  date: '2026-01-20', done: true },
    { label: 'Approved',  date: '2026-02-10', done: true },
    { label: 'Disbursed', date: '2026-02-28', done: true },
  ],
  eligibility: [
    { criterion: 'Family income < ₹2.5 LPA', met: true },
    { criterion: 'Attendance ≥ 75%', met: true },
    { criterion: 'No arrear papers', met: true },
    { criterion: 'First-generation learner', met: false },
  ],
  documents: ['Aadhaar Card', 'Income Certificate', 'Previous Marks Card', 'Bank Passbook'],
}

// ── Digital Materials (shared from faculty)
export const digitalMaterials = [
  { id: 1, title: 'Wave Optics — Lecture Notes',    subject: 'Physics',     type: 'PDF',   faculty: 'Dr. Ravi Kumar',   size: '2.4 MB', uploadedOn: '2026-05-28', isNew: true },
  { id: 2, title: 'Integration Methods — Slides',   subject: 'Mathematics', type: 'PPT',   faculty: 'Dr. Kavitha Sharma', size: '5.1 MB', uploadedOn: '2026-05-27', isNew: true },
  { id: 3, title: 'Organic Chemistry Lab Manual',   subject: 'Chemistry',   type: 'PDF',   faculty: 'Dr. Sujata Rao',   size: '3.2 MB', uploadedOn: '2026-05-22', isNew: false },
  { id: 4, title: 'Thermodynamics Video Lecture',   subject: 'Physics',     type: 'Video', faculty: 'Dr. Ravi Kumar',   size: '145 MB', uploadedOn: '2026-05-20', isNew: false },
  { id: 5, title: 'Differential Equations Notes',   subject: 'Mathematics', type: 'PDF',   faculty: 'Dr. Kavitha Sharma', size: '1.8 MB', uploadedOn: '2026-05-18', isNew: false },
  { id: 6, title: 'Grammar & Writing Skills',       subject: 'English',     type: 'PDF',   faculty: 'Mrs. Anitha Reddy', size: '0.9 MB', uploadedOn: '2026-05-15', isNew: false },
  { id: 7, title: 'Electrochemistry Reference Sheet', subject: 'Chemistry', type: 'PDF',   faculty: 'Dr. Sujata Rao',   size: '1.1 MB', uploadedOn: '2026-06-01', isNew: true },
]

// ── References Hub
export const references = [
  { subject: 'Mathematics', title: 'NCERT Class 12 Maths Part I & II', type: 'Book', link: '#' },
  { subject: 'Mathematics', title: 'RD Sharma Solutions', type: 'Online', link: '#' },
  { subject: 'Physics', title: 'NCERT Physics Part I & II', type: 'Book', link: '#' },
  { subject: 'Physics', title: 'HC Verma – Concepts of Physics', type: 'Book', link: '#' },
  { subject: 'Chemistry', title: 'NCERT Chemistry Part I & II', type: 'Book', link: '#' },
  { subject: 'Chemistry', title: 'OP Tandon Organic Chemistry', type: 'Book', link: '#' },
  { subject: 'English', title: 'Wren & Martin English Grammar', type: 'Book', link: '#' },
  { subject: 'JEE/NEET', title: 'Khan Academy – Free Video Lessons', type: 'Online', link: '#' },
  { subject: 'JEE/NEET', title: 'PW (Physics Wallah) Channel', type: 'Online', link: '#' },
]

// ── Mentor Messages
export const mentorMessages = [
  { id: 1, from: 'mentor', text: 'Hello Arjun! How are your preparations going for the upcoming unit test?', time: '2026-05-28 10:15 AM' },
  { id: 2, from: 'student', text: 'Hello Sir! I am doing well. I have completed Wave Optics and Integration chapters. A bit worried about Organic Chemistry.', time: '2026-05-28 10:18 AM' },
  { id: 3, from: 'mentor', text: 'Don\'t worry. Focus on the reaction mechanisms — that is the key. Do you need extra help sessions?', time: '2026-05-28 10:22 AM' },
  { id: 4, from: 'student', text: 'Yes, that would be great! When are you available?', time: '2026-05-28 10:25 AM' },
  { id: 5, from: 'mentor', text: 'I will be available Wednesday 3 PM in Room 204. Bring your Chemistry notebook.', time: '2026-05-28 10:30 AM' },
]

// ── Library
export const libraryData = {
  borrowed: [
    { id: 'LB001', title: 'HC Verma – Concepts of Physics Vol 1', author: 'H.C. Verma',       dueDate: '2026-06-07', renewals: 1 },
    { id: 'LB002', title: 'NCERT Chemistry Part II',              author: 'NCERT Board',       dueDate: '2026-06-14', renewals: 0 },
    { id: 'LB003', title: 'RD Sharma Mathematics Class 12',       author: 'R.D. Sharma',       dueDate: '2026-05-29', renewals: 2 },
  ],
  finePerDay: 2,
  catalogue: [
    { title: 'Problems in General Physics', author: 'I.E. Irodov', available: true },
    { title: 'Arihant Physics JEE Advanced', author: 'DC Pandey',  available: false },
    { title: 'JD Lee Concise Inorganic Chemistry', author: 'J.D. Lee', available: true },
  ]
}

// ── Lab Bookings
export const labSlots = [
  { id: 1, lab: 'Physics Lab',     date: '2026-06-03', time: '2:00–4:00 PM', capacity: 20, booked: 15, myBooking: false },
  { id: 2, lab: 'Chemistry Lab',   date: '2026-06-03', time: '10:00 AM–12:00 PM', capacity: 18, booked: 18, myBooking: false },
  { id: 3, lab: 'Computer Lab',    date: '2026-06-04', time: '2:00–4:00 PM', capacity: 30, booked: 12, myBooking: true },
  { id: 4, lab: 'Biology Lab',     date: '2026-06-05', time: '10:00 AM–12:00 PM', capacity: 20, booked: 8,  myBooking: false },
  { id: 5, lab: 'Physics Lab',     date: '2026-06-06', time: '2:00–4:00 PM', capacity: 20, booked: 20, myBooking: false },
  { id: 6, lab: 'Chemistry Lab',   date: '2026-06-10', time: '10:00 AM–12:00 PM', capacity: 18, booked: 5,  myBooking: false },
]

// ── Transport
export const busSchedule = [
  { stop: 'Ramanthapur',     departure: '7:00 AM', arrival: '7:45 AM' },
  { stop: 'Uppal',           departure: '7:10 AM', arrival: '7:50 AM' },
  { stop: 'LB Nagar',        departure: '7:18 AM', arrival: '7:55 AM' },
  { stop: 'Nagole',          departure: '7:25 AM', arrival: '8:00 AM' },
  { stop: 'College Campus',  departure: '—',       arrival: '8:10 AM' },
]

// ── JEE Prep
export const jeeChapters = {
  Mathematics: [
    { chapter: 'Sets & Functions', done: true, score: 92 },
    { chapter: 'Limits & Continuity', done: true, score: 85 },
    { chapter: 'Differentiation', done: true, score: 78 },
    { chapter: 'Integration', done: false, score: null },
    { chapter: 'Differential Equations', done: false, score: null },
    { chapter: 'Vectors & 3D Geometry', done: false, score: null },
  ],
  Physics: [
    { chapter: 'Mechanics – Kinematics', done: true, score: 88 },
    { chapter: 'Laws of Motion', done: true, score: 82 },
    { chapter: 'Work, Energy & Power', done: true, score: 90 },
    { chapter: 'Rotational Motion', done: false, score: null },
    { chapter: 'Wave Optics', done: false, score: null },
    { chapter: 'Electrostatics', done: false, score: null },
  ],
  Chemistry: [
    { chapter: 'Atomic Structure', done: true, score: 75 },
    { chapter: 'Chemical Bonding', done: true, score: 80 },
    { chapter: 'Equilibrium', done: false, score: null },
    { chapter: 'Organic — Basic Concepts', done: false, score: null },
    { chapter: 'Electrochemistry', done: false, score: null },
  ],
}

// ── NEET Prep
export const neetChapters = {
  Biology: [
    { chapter: 'Cell Structure & Function', done: true, score: 88 },
    { chapter: 'Biomolecules', done: true, score: 82 },
    { chapter: 'Cell Division', done: true, score: 79 },
    { chapter: 'Plant Physiology', done: false, score: null },
    { chapter: 'Human Physiology', done: false, score: null },
    { chapter: 'Genetics & Evolution', done: false, score: null },
  ],
  Physics: [
    { chapter: 'Mechanics', done: true, score: 80 },
    { chapter: 'Optics', done: false, score: null },
    { chapter: 'Electromagnetism', done: false, score: null },
  ],
  Chemistry: [
    { chapter: 'Atomic Structure', done: true, score: 75 },
    { chapter: 'Chemical Bonding', done: true, score: 78 },
    { chapter: 'Organic Chemistry', done: false, score: null },
  ],
}

// ── MPC Curriculum
export const mpcCurriculum = {
  Mathematics: { faculty: 'Dr. Kavitha Sharma', totalChapters: 15, completed: 7, topics: ['Sets','Relations','Trigonometry','Complex Numbers','Matrices','Determinants','Differentiation','Integration','Differential Equations','Vectors','3D Geometry','Linear Programming','Probability','Statistics','Coordinate Geometry'] },
  Physics:     { faculty: 'Dr. Ravi Kumar',     totalChapters: 14, completed: 6, topics: ['Units & Measurement','Kinematics','Laws of Motion','Work & Energy','Rotational Motion','Gravitation','Properties of Matter','Heat & Thermodynamics','Waves','Electrostatics','Current Electricity','Magnetism','Optics','Modern Physics'] },
  Chemistry:   { faculty: 'Dr. Sujata Rao',     totalChapters: 16, completed: 5, topics: ['Atomic Structure','Chemical Bonding','States of Matter','Thermodynamics','Chemical Equilibrium','Redox','Hydrogen','Block Elements','Organic — IUPAC','Hydrocarbons','Haloalkanes','Alcohols','Aldehydes','Carboxylic Acids','Amines','Polymers'] },
}

// ── Hostel
export const hostelNotices = [
  { id: 1, title: 'Hostel Fee Due',      date: '2026-06-01', desc: 'Term 2 hostel fee of ₹25,000 due by June 30th. Pay at the accounts office.' },
  { id: 2, title: 'Power Shutdown',      date: '2026-05-30', desc: 'Block B will have no power on June 3rd from 9 AM to 1 PM for maintenance.' },
  { id: 3, title: 'Annual Sports Meet',  date: '2026-05-25', desc: 'Students interested in sports events must register by June 5th at the warden office.' },
]

export const messMenu = {
  Monday:    { breakfast: 'Idli, Sambar, Chutney', lunch: 'Rice, Dal, Vegetable Curry, Curd', dinner: 'Chapati, Paneer Sabzi, Rice, Dal' },
  Tuesday:   { breakfast: 'Poha, Tea', lunch: 'Rice, Sambar, Rasam, Papad', dinner: 'Fried Rice, Mixed Veg, Raita' },
  Wednesday: { breakfast: 'Upma, Tea', lunch: 'Rice, Rajma, Salad', dinner: 'Chapati, Dal Makhani, Rice' },
  Thursday:  { breakfast: 'Dosa, Chutney', lunch: 'Rice, Chole, Salad', dinner: 'Biryani, Raita, Salad' },
  Friday:    { breakfast: 'Bread, Omelette, Tea', lunch: 'Rice, Fish Curry, Curd', dinner: 'Chapati, Aloo Gobi, Dal' },
  Saturday:  { breakfast: 'Puri, Aloo Sabzi', lunch: 'Rice, Mutton Curry, Papad', dinner: 'Noodles, Soup' },
  Sunday:    { breakfast: 'Paratha, Pickle', lunch: 'Special Meals — Biryani, Gulab Jamun', dinner: 'Chapati, Dal, Kheer' },
}
