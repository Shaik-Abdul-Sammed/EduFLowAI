import pool from '../db/pool.js';

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Meera', 'Karthik', 'Pooja', 'Sai', 'Divya',
  'Harsha', 'Nikhil', 'Varun', 'Swathi', 'Manisha', 'Arjun', 'Tanvi', 'Rahul', 'Kavya', 'Siddharth',
  'Ritu', 'Akash', 'Shruti', 'Gautam', 'Ishita', 'Manoj', 'Deepa', 'Pranav', 'Bhavna', 'Chetan',
  'Sunil', 'Neha', 'Vikas', 'Rashmi', 'Kunal', 'Preeti', 'Abhishek', 'Pallavi', 'Suresh', 'Ankita',
  'Mahesh', 'Sangeeta', 'Rajesh', 'Shweta', 'Dinesh', 'Komal', 'Tarun', 'Archana', 'Naveen', 'Gayatri'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Gupta', 'Nair', 'Iyer', 'Joshi', 'Charan', 'Sri',
  'Vardhan', 'Rao', 'Teja', 'Krishna', 'Das', 'Sen', 'Chopra', 'Varma', 'Naidu', 'Mehta',
  'Kulkarni', 'Bose', 'Pillai', 'Menon', 'Bhat', 'Deshmukh', 'Saxena', 'Choudhury', 'Malhotra', 'Pandey',
  'Mishra', 'Tripathi', 'Trivedi', 'Bhattacharya', 'Mukherjee', 'Chatterjee', 'Dubey', 'Shukla', 'Yadav', 'Singh',
  'Gowda', 'Shetty', 'Hegde', 'Kamath', 'Pai', 'Kaur', 'Dhillon', 'Sandhu', 'Gill', 'Sethi'
];

const DEPARTMENTS = [
  'CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AI', 'Mathematics', 'Physics', 'Chemistry', 'MBA'
];

const PROGRAMS = [
  'B.Tech CSE', 'B.Tech ECE', 'B.Tech EEE', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech IT', 'MBA', 'MCA'
];

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Capgemini', 'Deloitte', 'Amazon', 'Microsoft', 'Adobe'
];

const JOURNALS = [
  'IEEE Transactions on Education', 'Springer Computing', 'Elsevier Procedia', 'IJCA', 'IJCS',
  'IEEE Access', 'Springer Nature Applied Sciences', 'Elsevier Computer Science Review'
];

function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// In-memory store fallback
let memoryStudents = [];
let memoryFaculty = [];
let memoryCourses = [];
let memoryPlacements = [];
let memoryResearch = [];
let memoryInfrastructure = [];
let isInitialized = false;

export function generateAllDemoData(institutionId = 1) {
  const students = [];
  const faculty = [];
  const courses = [];
  const placements = [];
  const research = [];
  const infrastructure = [];

  // 1. Faculty: exactly 85 records, 40 PhD holders (47%), publications 0-25
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor'];
  for (let i = 1; i <= 85; i++) {
    const isPhd = i <= 40;
    const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
    const fName = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const designation = isPhd
      ? (i <= 20 ? 'Professor' : 'Associate Professor')
      : 'Assistant Professor';
    const pubs = Math.floor(pseudoRandom(i * 11) * 26); // 0 to 25
    const exp = 3 + Math.floor(pseudoRandom(i * 13) * 25);
    const joinedYear = 2024 - Math.min(exp, 15);

    faculty.push({
      id: i,
      institution_id: institutionId,
      employee_id: `EMP${String(i).padStart(4, '0')}`,
      full_name: `${isPhd ? 'Dr. ' : 'Prof. '}${fName} ${lName}`,
      designation,
      department: dept,
      qualification: isPhd ? 'Ph.D.' : 'M.Tech',
      specialization: `${dept} Systems & Applied Research`,
      experience_years: exp,
      publications_count: pubs,
      phd_guided: isPhd ? Math.floor(pseudoRandom(i * 17) * 6) : 0,
      is_phd_holder: isPhd,
      joined_year: joinedYear,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@demo.edu`,
      created_at: new Date().toISOString(),
    });
  }

  // 2. Students: exactly 1250 records
  const batches = [2021, 2022, 2023, 2024];
  const scholarshipCategories = ['SC', 'ST', 'OBC', 'EWS', 'Minority', 'None'];
  for (let i = 1; i <= 1250; i++) {
    const roll = `23SSIT${String(i).padStart(4, '0')}`;
    const fName = FIRST_NAMES[(i * 2) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 5) % LAST_NAMES.length];
    const batch = batches[(i - 1) % batches.length];
    const currentSem = (2025 - batch) * 2;
    const prog = PROGRAMS[(i - 1) % PROGRAMS.length];
    const dept = prog.replace('B.Tech ', '');

    const rand1 = pseudoRandom(i * 7);
    const rand2 = pseudoRandom(i * 13);
    const cgpa = Number((5.5 + rand1 * 4.3).toFixed(2)); // 5.5 to 9.8
    const attendance = Number((55.0 + rand2 * 43.0).toFixed(2)); // 55% to 98%
    const isFirstGen = pseudoRandom(i * 19) < 0.15; // 15%
    const feePaid = pseudoRandom(i * 23) < 0.90; // 90% paid
    const category = scholarshipCategories[(i - 1) % scholarshipCategories.length];
    const gender = (i % 2 === 0) ? 'Female' : 'Male';

    students.push({
      id: i,
      institution_id: institutionId,
      roll_number: roll,
      full_name: `${fName} ${lName}`,
      email: `${roll.toLowerCase()}@demo.edu`,
      phone: `9${String(100000000 + (i * 7321) % 900000000)}`,
      gender,
      category,
      program: prog,
      department: dept,
      batch_year: batch,
      current_semester: Math.min(8, Math.max(1, currentSem)),
      cgpa,
      attendance_percentage: attendance,
      fee_status: feePaid ? 'PAID' : 'PENDING',
      placement_status: 'NOT_PLACED',
      scholarship: category !== 'None' ? `${category} Merit Scholarship` : 'None',
      is_first_generation: isFirstGen,
      created_at: new Date().toISOString(),
    });
  }

  // 3. Courses: 45 records (8 UG programs, 5 PG programs across curriculum options)
  const allProgs = [
    { name: 'B.Tech Computer Science and Engineering', level: 'UG', dept: 'CSE', seats: 240, fee: 125000 },
    { name: 'B.Tech Electronics & Communication Engineering', level: 'UG', dept: 'ECE', seats: 180, fee: 110000 },
    { name: 'B.Tech Electrical & Electronics Engineering', level: 'UG', dept: 'EEE', seats: 120, fee: 95000 },
    { name: 'B.Tech Mechanical Engineering', level: 'UG', dept: 'Mechanical', seats: 120, fee: 85000 },
    { name: 'B.Tech Civil Engineering', level: 'UG', dept: 'Civil', seats: 60, fee: 75000 },
    { name: 'B.Tech Information Technology', level: 'UG', dept: 'IT', seats: 120, fee: 115000 },
    { name: 'B.Tech Artificial Intelligence & Data Science', level: 'UG', dept: 'AI', seats: 120, fee: 135000 },
    { name: 'B.Tech Robotics and Automation', level: 'UG', dept: 'Mechanical', seats: 60, fee: 105000 },
    { name: 'M.Tech Computer Science & Engineering', level: 'PG', dept: 'CSE', seats: 30, fee: 90000 },
    { name: 'M.Tech VLSI & Embedded Systems', level: 'PG', dept: 'ECE', seats: 24, fee: 85000 },
    { name: 'M.Tech Power Systems', level: 'PG', dept: 'EEE', seats: 18, fee: 80000 },
    { name: 'Master of Business Administration (MBA)', level: 'PG', dept: 'MBA', seats: 120, fee: 100000 },
    { name: 'Master of Computer Applications (MCA)', level: 'PG', dept: 'CSE', seats: 60, fee: 85000 },
  ];

  for (let i = 1; i <= 45; i++) {
    const template = allProgs[(i - 1) % allProgs.length];
    const isHonors = i > 25;
    const pName = isHonors ? `${template.name} (Honors/Minor)` : template.name;
    const seats = template.seats;
    const filled = Math.round(seats * (0.85 + pseudoRandom(i * 3) * 0.14));

    courses.push({
      id: i,
      institution_id: institutionId,
      program_name: pName,
      program_level: template.level,
      department: template.dept,
      duration_years: template.level === 'UG' ? 4.0 : 2.0,
      total_seats: seats,
      filled_seats: filled,
      fee_per_year: template.fee,
      curriculum_type: 'CBCS / Outcome Based',
      has_internship: true,
      created_at: new Date().toISOString(),
    });
  }

  // 4. Placements: 780 records (62% of 1250 students placed, packages 3.5 to 28 LPA)
  for (let i = 1; i <= 780; i++) {
    const student = students[i - 1];
    student.placement_status = 'PLACED';
    const comp = COMPANIES[(i - 1) % COMPANIES.length];
    const rand = pseudoRandom(i * 29);
    let pkg = 3.5 + rand * 12.0;
    if (rand > 0.85) pkg = 15.0 + rand * 13.0; // Tier 1 offers up to 28 LPA
    pkg = Number(pkg.toFixed(2));

    placements.push({
      id: i,
      institution_id: institutionId,
      student_id: student.id,
      company_name: comp,
      package_lpa: pkg,
      placement_year: 2024,
      offer_type: pkg >= 10 ? 'Dream Offer' : 'Standard Offer',
      created_at: new Date().toISOString(),
    });
  }

  // 5. Research publications: 450 records
  // 60% Scopus (270), 20% UGC CARE (90), 10% Web of Science (45)
  for (let i = 1; i <= 450; i++) {
    const fac = faculty[(i - 1) % faculty.length];
    const isScopus = i <= 270;
    const isUgcCare = i > 270 && i <= 360;
    const isWos = i > 360 && i <= 405;
    const jName = JOURNALS[(i - 1) % JOURNALS.length];
    const yr = 2020 + (i % 5);
    const cites = Math.floor(pseudoRandom(i * 31) * 45);
    const impact = Number((1.2 + pseudoRandom(i * 37) * 4.8).toFixed(2));

    research.push({
      id: i,
      institution_id: institutionId,
      faculty_id: fac.id,
      title: `Advances in ${fac.department} Computing and Experimental Intelligence #${i}`,
      journal_name: jName,
      year: yr,
      citations: cites,
      impact_factor: impact,
      is_scopus: isScopus,
      is_ugc_care: isUgcCare,
      is_web_of_science: isWos,
      created_at: new Date().toISOString(),
    });
  }

  // 6. Infrastructure: 25 records
  const infraTemplates = [
    { name: 'Smart Academic Classrooms', type: 'Classroom', count: 120, area: 90000, capacity: 60, built: 2012 },
    { name: 'Advanced Engineering Laboratories', type: 'Laboratory', count: 45, area: 54000, capacity: 30, built: 2014 },
    { name: 'Central Knowledge Resource Library', type: 'Library', count: 1, area: 12000, capacity: 400, built: 2010 },
    { name: 'Boys Hostel Complex (Block A & B)', type: 'Hostel', count: 2, area: 45000, capacity: 500, built: 2015 },
    { name: 'Girls Hostel Complex (Block C)', type: 'Hostel', count: 1, area: 30000, capacity: 300, built: 2017 },
    { name: 'Central Auditorium', type: 'Auditorium', count: 1, area: 8500, capacity: 600, built: 2016 },
    { name: 'Outdoor Sports Complex & Track', type: 'Sports', count: 2, area: 65000, capacity: 1000, built: 2013 },
    { name: 'Indoor Sports & Fitness Arena', type: 'Sports', count: 3, area: 15000, capacity: 250, built: 2018 },
    { name: 'Computing Research & Data Center', type: 'IT', count: 4, area: 8000, capacity: 200, built: 2020 },
    { name: 'Innovation & Incubation Hub', type: 'Incubation', count: 1, area: 6000, capacity: 120, built: 2021 },
    { name: 'Campus Cafeteria & Food Court', type: 'Facility', count: 2, area: 10000, capacity: 450, built: 2015 },
    { name: 'Health & Medical Center', type: 'Medical', count: 1, area: 2500, capacity: 20, built: 2016 },
    { name: 'Seminar Hall Complex', type: 'Seminar', count: 4, area: 12000, capacity: 180, built: 2015 },
  ];

  for (let i = 1; i <= 25; i++) {
    const t = infraTemplates[(i - 1) % infraTemplates.length];
    infrastructure.push({
      id: i,
      institution_id: institutionId,
      name: `${t.name} (Unit ${Math.ceil(i / infraTemplates.length)})`,
      type: t.type,
      count: t.count,
      area_sqft: t.area,
      capacity: t.capacity,
      year_built: t.built,
      created_at: new Date().toISOString(),
    });
  }

  return { students, faculty, courses, placements, research, infrastructure };
}

export function initInMemoryDemoData(institutionId = 1) {
  if (!isInitialized) {
    const data = generateAllDemoData(institutionId);
    memoryStudents = data.students;
    memoryFaculty = data.faculty;
    memoryCourses = data.courses;
    memoryPlacements = data.placements;
    memoryResearch = data.research;
    memoryInfrastructure = data.infrastructure;
    isInitialized = true;
  }
}

// Auto initialize memory fallback
initInMemoryDemoData(1);

export class DemoDataRepository {
  static async getStats(institutionId = 1) {
    initInMemoryDemoData(institutionId);
    try {
      const studentRes = await pool.query(
        'SELECT COUNT(*) as total, AVG(cgpa) as avg_cgpa, AVG(attendance_percentage) as avg_attendance FROM demo_students WHERE institution_id = $1',
        [institutionId]
      );
      const facultyRes = await pool.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_phd_holder = true) as phd_count FROM demo_faculty WHERE institution_id = $1',
        [institutionId]
      );
      const placementRes = await pool.query(
        'SELECT COUNT(*) as total, AVG(package_lpa) as avg_pkg, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package_lpa) as median_pkg FROM demo_placements WHERE institution_id = $1',
        [institutionId]
      );
      const researchRes = await pool.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_scopus = true) as scopus_count FROM demo_research WHERE institution_id = $1',
        [institutionId]
      );
      const infraRes = await pool.query(
        'SELECT COUNT(*) as total, SUM(area_sqft) as total_area FROM demo_infrastructure WHERE institution_id = $1',
        [institutionId]
      );

      const totalStudents = parseInt(studentRes.rows[0]?.total || 0, 10);
      const totalFaculty = parseInt(facultyRes.rows[0]?.total || 0, 10);
      const phdFaculty = parseInt(facultyRes.rows[0]?.phd_count || 0, 10);
      const totalPlacements = parseInt(placementRes.rows[0]?.total || 0, 10);

      if (totalStudents > 0) {
        return {
          totalStudents,
          totalFaculty,
          phdFaculty,
          phdRatio: totalFaculty > 0 ? Number(((phdFaculty / totalFaculty) * 100).toFixed(1)) : 0,
          averageCgpa: Number(parseFloat(studentRes.rows[0]?.avg_cgpa || 0).toFixed(2)),
          averageAttendance: Number(parseFloat(studentRes.rows[0]?.avg_attendance || 0).toFixed(1)),
          placementPercentage: totalStudents > 0 ? Number(((totalPlacements / totalStudents) * 100).toFixed(1)) : 0,
          medianPackageLpa: Number(parseFloat(placementRes.rows[0]?.median_pkg || placementRes.rows[0]?.avg_pkg || 5.5).toFixed(1)),
          totalResearch: parseInt(researchRes.rows[0]?.total || 0, 10),
          scopusResearch: parseInt(researchRes.rows[0]?.scopus_count || 0, 10),
          totalInfrastructure: parseInt(infraRes.rows[0]?.total || 0, 10),
        };
      }
    } catch {
      // In-memory fallback
    }

    const totalStudents = memoryStudents.length;
    const totalFaculty = memoryFaculty.length;
    const phdFaculty = memoryFaculty.filter((f) => f.is_phd_holder).length;
    const totalPlacements = memoryPlacements.length;
    const avgCgpa = memoryStudents.reduce((sum, s) => sum + s.cgpa, 0) / (totalStudents || 1);
    const avgAtt = memoryStudents.reduce((sum, s) => sum + s.attendance_percentage, 0) / (totalStudents || 1);
    const scopusCount = memoryResearch.filter((r) => r.is_scopus).length;

    return {
      totalStudents,
      totalFaculty,
      phdFaculty,
      phdRatio: Number(((phdFaculty / (totalFaculty || 1)) * 100).toFixed(1)),
      averageCgpa: Number(avgCgpa.toFixed(2)),
      averageAttendance: Number(avgAtt.toFixed(1)),
      placementPercentage: Number(((totalPlacements / (totalStudents || 1)) * 100).toFixed(1)),
      medianPackageLpa: 5.5,
      totalResearch: memoryResearch.length,
      scopusResearch: scopusCount,
      totalInfrastructure: memoryInfrastructure.length,
    };
  }

  static async getStudents({ limit = 50, page = 1, department } = {}) {
    initInMemoryDemoData();
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 50);
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
      let query = 'SELECT * FROM demo_students';
      const params = [];
      if (department) {
        query += ' WHERE LOWER(department) = LOWER($1)';
        params.push(department);
      }
      query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parsedLimit, offset);

      const res = await pool.query(query, params);
      const countQuery = department
        ? 'SELECT COUNT(*) as total FROM demo_students WHERE LOWER(department) = LOWER($1)'
        : 'SELECT COUNT(*) as total FROM demo_students';
      const countRes = await pool.query(countQuery, department ? [department] : []);
      const total = parseInt(countRes.rows[0]?.total || 0, 10);

      if (total > 0) {
        return { students: res.rows, total, page: parsedPage, limit: parsedLimit };
      }
    } catch {
      // In-memory fallback
    }

    let filtered = memoryStudents;
    if (department) {
      filtered = filtered.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }
    const paginated = filtered.slice(offset, offset + parsedLimit);
    return {
      students: paginated,
      total: filtered.length,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  static async getFaculty({ limit = 50, page = 1, department } = {}) {
    initInMemoryDemoData();
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 50);
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
      let query = 'SELECT * FROM demo_faculty';
      const params = [];
      if (department) {
        query += ' WHERE LOWER(department) = LOWER($1)';
        params.push(department);
      }
      query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parsedLimit, offset);

      const res = await pool.query(query, params);
      const countQuery = department
        ? 'SELECT COUNT(*) as total FROM demo_faculty WHERE LOWER(department) = LOWER($1)'
        : 'SELECT COUNT(*) as total FROM demo_faculty';
      const countRes = await pool.query(countQuery, department ? [department] : []);
      const total = parseInt(countRes.rows[0]?.total || 0, 10);

      if (total > 0) {
        return { faculty: res.rows, total, page: parsedPage, limit: parsedLimit };
      }
    } catch {
      // In-memory fallback
    }

    let filtered = memoryFaculty;
    if (department) {
      filtered = filtered.filter((f) => f.department.toLowerCase() === department.toLowerCase());
    }
    const paginated = filtered.slice(offset, offset + parsedLimit);
    return {
      faculty: paginated,
      total: filtered.length,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  static async getCourses({ department } = {}) {
    initInMemoryDemoData();
    try {
      let query = 'SELECT * FROM demo_courses';
      const params = [];
      if (department) {
        query += ' WHERE LOWER(department) = LOWER($1)';
        params.push(department);
      }
      query += ' ORDER BY id ASC';
      const res = await pool.query(query, params);
      if (res.rows.length > 0) return res.rows;
    } catch {
      // In-memory fallback
    }

    if (department) {
      return memoryCourses.filter((c) => c.department.toLowerCase() === department.toLowerCase());
    }
    return memoryCourses;
  }

  static async getPlacements({ company } = {}) {
    initInMemoryDemoData();
    try {
      let query = 'SELECT * FROM demo_placements';
      const params = [];
      if (company) {
        query += ' WHERE LOWER(company_name) = LOWER($1)';
        params.push(company);
      }
      query += ' ORDER BY id ASC';
      const res = await pool.query(query, params);
      if (res.rows.length > 0) return res.rows;
    } catch {
      // In-memory fallback
    }

    if (company) {
      return memoryPlacements.filter((p) => p.company_name.toLowerCase() === company.toLowerCase());
    }
    return memoryPlacements;
  }

  static async getResearch({ isScopus } = {}) {
    initInMemoryDemoData();
    try {
      let query = 'SELECT * FROM demo_research';
      const params = [];
      if (typeof isScopus === 'boolean') {
        query += ' WHERE is_scopus = $1';
        params.push(isScopus);
      }
      query += ' ORDER BY id ASC';
      const res = await pool.query(query, params);
      if (res.rows.length > 0) return res.rows;
    } catch {
      // In-memory fallback
    }

    if (typeof isScopus === 'boolean') {
      return memoryResearch.filter((r) => r.is_scopus === isScopus);
    }
    return memoryResearch;
  }

  static async getInfrastructure({ type } = {}) {
    initInMemoryDemoData();
    try {
      let query = 'SELECT * FROM demo_infrastructure';
      const params = [];
      if (type) {
        query += ' WHERE LOWER(type) = LOWER($1)';
        params.push(type);
      }
      query += ' ORDER BY id ASC';
      const res = await pool.query(query, params);
      if (res.rows.length > 0) return res.rows;
    } catch {
      // In-memory fallback
    }

    if (type) {
      return memoryInfrastructure.filter((i) => i.type.toLowerCase() === type.toLowerCase());
    }
    return memoryInfrastructure;
  }
}

export default DemoDataRepository;
