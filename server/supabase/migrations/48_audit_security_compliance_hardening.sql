-- MIGRATION 48: AUDIT, SECURITY & COMPLIANCE HARDENING
-- Establishes security policies table, session tracking, security event classifications, audit immutability, and RLS enforcement.

-- 1. Security Policies Table
CREATE TABLE IF NOT EXISTS public.security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'auth', 'session', 'export', 'access', 'compliance'
    policy_key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial security policies if empty
INSERT INTO public.security_policies (policy_name, category, policy_key, value, description)
VALUES
    ('Password Strength Policy', 'auth', 'password_policy', '{"minLength": 8, "requireUppercase": true, "requireNumbers": true, "requireSpecial": true}'::jsonb, 'Enforces password complexity requirements for staff user accounts.'),
    ('Session Timeout Policy', 'session', 'session_timeout', '{"idleTimeoutMinutes": 60, "maxSessionHours": 12, "singleSessionPerUser": false}'::jsonb, 'Configures automatic session termination and idle limits.'),
    ('Account Lockout Policy', 'auth', 'account_lockout', '{"maxFailedAttempts": 5, "lockoutDurationMinutes": 15}'::jsonb, 'Locks account temporarily after consecutive failed login attempts.'),
    ('Data Export Security Policy', 'export', 'export_restriction', '{"requireApprovalForBulk": true, "maxRowsPerExport": 5000, "logAllExports": true}'::jsonb, 'Restricted bulk exports and mandatory audit trail for reports.'),
    ('Multi-Factor Auth Policy', 'auth', 'mfa_policy', '{"enforceForAdmins": false, "mfaMethods": ["totp"]}'::jsonb, 'MFA security foundation and enrollment configuration.')
ON CONFLICT (policy_key) DO NOTHING;

-- 2. User Sessions Tracking Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_info VARCHAR(255) DEFAULT 'Unknown Device',
    browser VARCHAR(100) DEFAULT 'Unknown Browser',
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'revoked', 'expired'
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);

-- 3. Security Events Log Table (Subsystem of Audit Logging)
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    event_type VARCHAR(100) NOT NULL, -- e.g. 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ROLE_CHANGE', 'PERMISSION_CHANGE', 'USER_SUSPENDED', 'SENSITIVE_EXPORT', 'CONFIG_EDIT'
    category VARCHAR(50) NOT NULL DEFAULT 'AUTHENTICATION', -- 'AUTHENTICATION', 'AUTHORIZATION', 'SESSION', 'SECURITY_POLICY', 'DATA_ACCESS', 'EXPORT', 'SYSTEM_CONFIG'
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO', -- 'INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    module VARCHAR(50) DEFAULT 'Security',
    target_entity VARCHAR(100),
    target_id VARCHAR(255),
    ip_address VARCHAR(45),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_category ON public.security_events(category);
CREATE INDEX IF NOT EXISTS idx_security_events_actor ON public.security_events(actor_id);

-- 4. Audit Trail Immutability Safeguards
-- Prevent non-privileged DELETE and UPDATE operations on audit log records to guarantee audit integrity.

CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: Audit trail records are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_system_audit_logs_mutation ON public.system_audit_logs;
CREATE TRIGGER trg_prevent_system_audit_logs_mutation
BEFORE UPDATE OR DELETE ON public.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

DROP TRIGGER IF EXISTS trg_prevent_security_events_mutation ON public.security_events;
CREATE TRIGGER trg_prevent_security_events_mutation
BEFORE UPDATE OR DELETE ON public.security_events
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

-- 5. Row-Level Security (RLS) Enablement & Verification
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Security Policies RLS Policies
DROP POLICY IF EXISTS "Allow authenticated users to read security policies" ON public.security_policies;
CREATE POLICY "Allow authenticated users to read security policies"
    ON public.security_policies FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admins to update security policies" ON public.security_policies;
CREATE POLICY "Allow admins to update security policies"
    ON public.security_policies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('admin', 'master_admin', 'security_officer')
        )
    );

-- User Sessions RLS Policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name IN ('admin', 'master_admin', 'security_officer')
    ));

-- Security Events RLS Policies
DROP POLICY IF EXISTS "Security officers and admins can view security events" ON public.security_events;
CREATE POLICY "Security officers and admins can view security events"
    ON public.security_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('admin', 'master_admin', 'security_officer', 'executive')
        )
    );

DROP POLICY IF EXISTS "System can log security events" ON public.security_events;
CREATE POLICY "System can log security events"
    ON public.security_events FOR INSERT
    TO authenticated
    WITH CHECK (true);
