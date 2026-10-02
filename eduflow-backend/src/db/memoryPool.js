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
    auditLogs: []
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

      if (sql.includes('leads') || sql.includes('invoices') || sql.includes('delivered_reports')) {
        throw new Error('Table queries handled by repository in-memory fallback')
      }

      // Fallback for mock generic query
      return { rows: [], rowCount: 0 }
    },
    async end() {
      state.recentSearches = []
    },
  }
}