-- 026_row_level_security.sql: Database-Enforced Multi-Tenant Row-Level Security (RLS)

-- 1. Helper function to set current session institution
CREATE OR REPLACE FUNCTION set_current_institution(inst_id INTEGER) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_institution_id', inst_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- 2. Create restricted application role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'eduflow_app') THEN
    CREATE ROLE eduflow_app WITH LOGIN;
  END IF;
END
$$;

-- 3. Enable RLS and apply tenant_isolation_policy on multi-tenant tables
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'users',
    'students',
    'faculty',
    'courses',
    'leads',
    'invoices',
    'officer_sessions',
    'audit_logs',
    'attendance_records',
    'academic_calendar',
    'calendar_events',
    'staff_permissions',
    'support_tickets',
    'monitoring_events'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
      EXECUTE format(
        'CREATE POLICY tenant_isolation_policy ON %I
         FOR ALL
         TO PUBLIC
         USING (
           institution_id = NULLIF(current_setting(''app.current_institution_id'', true), '''信::INTEGER
           OR current_setting(''app.bypass_rls'', true) = ''on''
         );', tbl
      );
    END IF;
  END LOOP;
END
$$;
