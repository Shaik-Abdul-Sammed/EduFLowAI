import bcrypt from 'bcryptjs'

function normalizeSql(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function cloneRecentSearch(row) {
  return {
    id: row.id,
    role: row.role,
    query: row.query,
    routePath: row.routePath,
    createdAt: row.createdAt,
  }
}

export function createMemoryPool() {
  const defaultInstId = 'default-inst-001'
  
  // Pre-hashed passwords for demo credentials
  const demoUsers = [
    {
      id: 'user-admin-001',
      institution_id: defaultInstId,
      role: 'admin',
      username: 'admin',
      email: 'admin@eduflow.edu',
      password_hash: bcrypt.hashSync('admin123', 8),
      name: 'System Administrator',
      metadata: {},
      created_at: new Date().toISOString()
    },
    {
      id: 'user-admin-002',
      institution_id: defaultInstId,
      role: 'admin',
      username: 'admin',
      email: 'admin@demo.edu',
      password_hash: bcrypt.hashSync('Demo@2026', 10),
      name: 'System Administrator',
      metadata: {},
      created_at: new Date().toISOString()
    },
    {
      id: 'user-dean-001',
      institution_id: defaultInstId,
      role: 'admin',
      username: 'dean',
      email: 's9010150809@gmail.com',
      password_hash: bcrypt.hashSync('Demo@2026', 10),
      name: 'Dean Demo',
      first_name: 'Dean',
      last_name: 'Demo',
      metadata: { phone: '9010150809' },
      created_at: new Date().toISOString()
    },
    {
      id: 'user-faculty-001',
      institution_id: defaultInstId,
      role: 'faculty',
      username: 'faculty',
      email: 'faculty@eduflow.edu',
      password_hash: bcrypt.hashSync('faculty123', 8),
      name: 'Dr. Ramesh Kumar',
      metadata: { department: 'Computer Science' },
      created_at: new Date().toISOString()
    },
    {
      id: 'user-student-001',
      institution_id: defaultInstId,
      role: 'student',
      username: 'ss26',
      email: 'student@eduflow.edu',
      password_hash: bcrypt.hashSync('student123', 8),
      name: 'Ananya Sharma',
      metadata: { rollNumber: 'SS26', branch: 'MPC' },
      created_at: new Date().toISOString()
    },
    {
      id: 'user-parent-001',
      institution_id: defaultInstId,
      role: 'parent',
      username: 'parent',
      email: 'parent@eduflow.edu',
      password_hash: bcrypt.hashSync('parent123', 8),
      name: 'Suresh Sharma',
      metadata: { childId: 'SS26' },
      created_at: new Date().toISOString()
    }
  ]

  const state = {
    nextId: 1,
    recentSearches: [],
    institutions: [
      {
        id: defaultInstId,
        name: 'EduFlow Campus',
        slug: 'eduflow',
        subdomain: 'eduflow',
        short_code: 'eduflow',
        subscription_tier: 'enterprise',
        primary_color: '#2563EB',
        secondary_color: '#1E40AF',
        logo_url: '/logo.png',
        created_at: new Date().toISOString()
      }
    ],
    users: [...demoUsers],
    refreshTokens: [],
    auditLogs: [],
    currentInstitutionId: null,
    bypassRls: false,
    invoices: [
      { id: 101, institution_id: 1, invoice_number: 'EDU-2026-0041', institution_name: 'Sri Siddhartha Institute of Technology', contact_person: 'Rahul Sharma (Roll: 1ST22CS089)', contact_email: 'rahul.s@ssit.edu.in', contact_phone: '+919876543201', total_amount: 59000, currency: 'INR', status: 'UNPAID', due_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0] },
      { id: 102, institution_id: 1, invoice_number: 'EDU-2026-0042', institution_name: 'Sri Siddhartha Institute of Technology', contact_person: 'Pooja Hegde (Roll: 1ST22EC045)', contact_email: 'pooja.h@ssit.edu.in', contact_phone: '+919876543202', total_amount: 54000, currency: 'INR', status: 'UNPAID', due_date: new Date(Date.now() - 16 * 86400000).toISOString().split('T')[0] },
      { id: 103, institution_id: 1, invoice_number: 'EDU-2026-0043', institution_name: 'Sri Siddhartha Institute of Technology', contact_person: 'Karthik V (Roll: 1ST22ME022)', contact_email: 'karthik.v@ssit.edu.in', contact_phone: '+919876543203', total_amount: 48000, currency: 'INR', status: 'UNPAID', due_date: new Date(Date.now() - 38 * 86400000).toISOString().split('T')[0] },
      { id: 104, institution_id: 1, invoice_number: 'EDU-2026-0044', institution_name: 'Sri Siddhartha Institute of Technology', contact_person: 'Ananya Deshmukh (Roll: 1ST21CS014)', contact_email: 'ananya.d@ssit.edu.in', contact_phone: '+919876543204', total_amount: 62000, currency: 'INR', status: 'UNPAID', due_date: new Date(Date.now() - 72 * 86400000).toISOString().split('T')[0] },
      { id: 201, institution_id: 2, invoice_number: 'INV-201', institution_name: 'Inst 2', contact_person: 'Inst 2 Student', contact_email: 'student2@demo.edu', contact_phone: '+919876543205', total_amount: 75000, currency: 'INR', status: 'UNPAID', due_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0] }
    ]
  }

  function readRecentSearches(role, limit) {
    return state.recentSearches
      .filter((row) => row.role === role)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, limit)
      .map(cloneRecentSearch)
  }

  function trimRecentSearches(role, limit) {
    const ordered = state.recentSearches
      .filter((row) => row.role === role)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

    const keepIds = new Set(ordered.slice(0, limit).map((row) => row.id))
    state.recentSearches = state.recentSearches.filter((row) => row.role !== role || keepIds.has(row.id))
  }

  return {
    async query(text, params = []) {
      const sql = normalizeSql(text)

      // Transaction queries
      if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
        return { rows: [], rowCount: 0 }
      }

      // 1. Search queries
      if (sql === 'select role, query, route_path as "routepath", created_at as "createdat" from recent_searches where role = $1 order by created_at desc limit 6') {
        const role = String(params[0] || '').trim().toLowerCase()
        const rows = readRecentSearches(role, 6)
        return { rows, rowCount: rows.length }
      }

      if (sql === 'select role, query, route_path as "routepath", created_at as "createdat" from recent_searches order by created_at desc limit 25') {
        const rows = state.recentSearches
          .slice()
          .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
          .slice(0, 25)
          .map(cloneRecentSearch)
        return { rows, rowCount: rows.length }
      }

      if (sql === 'insert into recent_searches (role, query, route_path) values ($1, $2, $3) on conflict (role, route_path) do update set query = excluded.query, created_at = now()') {
        const role = String(params[0] || '').trim().toLowerCase()
        const query = String(params[1] || '').trim()
        const routePath = String(params[2] || '').trim()

        const existing = state.recentSearches.find((row) => row.role === role && row.routePath === routePath)
        if (existing) {
          existing.query = query
          existing.createdAt = new Date().toISOString()
        } else {
          state.recentSearches.push({
            id: state.nextId,
            role,
            query,
            routePath,
            createdAt: new Date().toISOString(),
          })
          state.nextId += 1
        }

        return { rows: [], rowCount: 1 }
      }

      if (sql === 'delete from recent_searches where id in ( select id from recent_searches where role = $1 order by created_at desc offset 6 )') {
        const role = String(params[0] || '').trim().toLowerCase()
        const beforeCount = state.recentSearches.length
        trimRecentSearches(role, 6)
        return { rows: [], rowCount: beforeCount - state.recentSearches.length }
      }

      // 2. Default institution query
      if (sql.includes('from institutions limit 1') || sql === 'select id, name from institutions limit 1') {
        const inst = state.institutions[0]
        return { rows: inst ? [inst] : [], rowCount: inst ? 1 : 0 }
      }

      // 3. Institution by subdomain or short_code
      if (sql.includes('from institutions where subdomain = $1')) {
        const sub = String(params[0] || '').toLowerCase()
        const match = state.institutions.filter(i => (i.subdomain || '').toLowerCase() === sub)
        return { rows: match, rowCount: match.length }
      }

      if (sql.includes('from institutions where short_code = $1')) {
        const code = String(params[0] || '').toLowerCase()
        const match = state.institutions.filter(i => (i.short_code || '').toLowerCase() === code)
        return { rows: match, rowCount: match.length }
      }

      // 4. Insert institution
      if (sql.includes('insert into institutions')) {
        const name = params[0] || 'Institution'
        const subdomain = params[1] || `inst-${Date.now()}`
        const newInst = {
          id: `inst-${Date.now()}`,
          name,
          subdomain,
          short_code: subdomain,
          subscription_tier: 'free',
          primary_color: '#2563EB',
          secondary_color: '#1E40AF',
          logo_url: '',
          created_at: new Date().toISOString()
        }
        state.institutions.push(newInst)
        return { rows: [newInst], rowCount: 1 }
      }

      // 5. User lookup by institution & email/username
      if (sql.includes('from users u') && sql.includes('join institutions i')) {
        let instId = null
        let ident = ''
        if (params.length >= 2) {
          instId = String(params[0] || '')
          ident = String(params[1] || '').toLowerCase()
        } else {
          ident = String(params[0] || '').toLowerCase()
        }
        const user = state.users.find(
          u => (!instId || String(u.institution_id) === instId || instId === defaultInstId) &&
               ((u.username && u.username.toLowerCase() === ident) || (u.email && u.email.toLowerCase() === ident))
        )
        if (user) {
          const inst = state.institutions.find(i => String(i.id) === String(user.institution_id)) || state.institutions[0]
          const combined = {
            ...user,
            inst_name: inst.name,
            subscription_tier: inst.subscription_tier,
            primary_color: inst.primary_color,
            secondary_color: inst.secondary_color,
            logo_url: inst.logo_url
          }
          return { rows: [combined], rowCount: 1 }
        }
        return { rows: [], rowCount: 0 }
      }

      // 6. User lookup by ID
      if (sql.includes('from users where id = $1')) {
        const id = String(params[0] || '')
        const user = state.users.find(u => String(u.id) === id)
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
      }

      // 6b. User lookup by email / username
      if (sql.includes('from users where email = $1') || sql.includes('from users where lower(email) = lower($1)')) {
        const email = String(params[0] || '').toLowerCase()
        const user = state.users.find(u => u.email && u.email.toLowerCase() === email)
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
      }
      if (sql.includes('from users where username = $1') || sql.includes('from users where lower(username) = lower($1)')) {
        const ident = String(params[0] || '').toLowerCase()
        const user = state.users.find(u => (u.username && u.username.toLowerCase() === ident) || (u.email && u.email.toLowerCase() === ident))
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
      }

      // 7. Insert user
      if (sql.includes('insert into users')) {
        let institution_id, role, username, password_hash, name
        if (sql.includes("'admin'")) {
          institution_id = params[0]
          role = 'admin'
          username = params[1]
          password_hash = params[2]
          name = params[3]
        } else {
          institution_id = params[0]
          role = params[1] || 'student'
          username = params[2]
          password_hash = params[3]
          name = params[4]
        }
        const newUser = {
          id: `user-${Date.now()}`,
          institution_id,
          role,
          username,
          email: username.includes('@') ? username : `${username}@eduflow.edu`,
          password_hash,
          name,
          metadata: {},
          created_at: new Date().toISOString()
        }
        state.users.push(newUser)
        return { rows: [newUser], rowCount: 1 }
      }

      // 8. Refresh tokens & audit logs
      if (sql.includes('insert into refresh_tokens')) {
        state.refreshTokens.push({ userId: params[0], tokenHash: params[1], expiresAt: params[2] })
        return { rows: [], rowCount: 1 }
      }

      if (sql.includes('insert into audit_logs')) {
        state.auditLogs.push({ institutionId: params[0], userId: params[1], action: params[2], created_at: new Date().toISOString() })
        return { rows: [], rowCount: 1 }
      }

      if (sql.includes('update refresh_tokens set revoked = true')) {
        return { rows: [], rowCount: 1 }
      }

      // RLS Session Setting
      if (sql.includes('set_current_institution') || sql.includes('app.current_institution_id')) {
        const match = sql.match(/set_current_institution\s*\(\s*(\d+)\s*\)/)
        if (match) {
          state.currentInstitutionId = Number(match[1])
        } else if (params && params.length > 0 && params[0] !== undefined) {
          state.currentInstitutionId = Number(params[0])
        }
        return { rows: [], rowCount: 1 }
      }

      if (sql.includes("set app.bypass_rls = 'on'") || sql.includes("bypass_rls = 'on'")) {
        state.bypassRls = true
        return { rows: [], rowCount: 1 }
      }

      if (sql.includes("set app.bypass_rls = 'off'") || sql.includes("bypass_rls = 'off'")) {
        state.bypassRls = false
        return { rows: [], rowCount: 1 }
      }

      // RLS Invoices query
      if (sql.includes('from invoices')) {
        let rows = [...state.invoices]
        if (state.currentInstitutionId && !state.bypassRls) {
          rows = rows.filter(r => r.institution_id === state.currentInstitutionId)
        } else if (params && params.length > 0 && sql.includes('institution_id = $1')) {
          rows = rows.filter(r => r.institution_id === Number(params[0]))
        }
        if (sql.includes("status = 'unpaid'")) {
          rows = rows.filter(r => r.status === 'UNPAID')
        }
        return { rows, rowCount: rows.length }
      }

      if (sql.includes('leads') || sql.includes('delivered_reports') || sql.includes('naac_') || sql.includes('ai_insight_runs') || sql.includes('ai_prediction_snapshots') || sql.includes('nirf_') || sql.includes('staff_') || sql.includes('support_') || sql.includes('monitoring_') || sql.includes('onboarding_')) {
        throw new Error('Table queries handled by repository in-memory fallback')
      }

      // Fallback for mock generic query
      return { rows: [], rowCount: 0 }
    },
    setSessionInstitution(instId, bypass = false) {
      state.currentInstitutionId = instId ? Number(instId) : null
      state.bypassRls = Boolean(bypass)
    },
    async end() {
      state.recentSearches = []
    },
  }
}