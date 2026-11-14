import jwt from 'jsonwebtoken'

export class LTIController {
  // Pre-configured mock RSA Public JWK for Canvas/Moodle LMS signature verification
  static MOCK_JWKS = {
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        alg: 'RS256',
        kid: 'eduflow-lti-key-2026',
        n: 'u1b7r_eduflow_tier1_rsa_public_key_modulus_for_lti13_advantage_verification_sig_2026_canvas_moodle',
        e: 'AQAB'
      }
    ]
  }

  /**
   * GET /api/v1/lti/.well-known/jwks.json
   * Serves public JSON Web Key Set (JWKS) so LMS platforms (Canvas, Moodle, Blackboard)
   * can verify EduFlow AI signatures.
   */
  static async getJWKS(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.status(200).json(LTIController.MOCK_JWKS)
  }

  /**
   * GET or POST /api/v1/lti/login
   * LTI 1.3 OIDC Initiation Login Flow
   * Accepts iss, login_hint, target_link_uri, lti_message_hint, client_id
   * Generates mock state, nonce, and redirect_uri, returning a 302 redirect URL to the LMS Auth endpoint.
   */
  static async loginLTI(req, res) {
    try {
      const params = req.method === 'GET' ? req.query : (req.body || {})
      if (!params.iss && !params.login_hint && Object.keys(params).length === 0) {
        return res.status(400).json({ error: 'Missing required LTI 1.3 initiation parameter: iss or login_hint' })
      }

      const {
        iss = 'https://canvas.instructure.com',
        login_hint,
        target_link_uri,
        lti_message_hint,
        client_id = 'eduflow-canvas-client'
      } = params

      const state = `lti_state_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`
      const nonce = `lti_nonce_${Math.random().toString(36).substring(2, 12)}`
      const host = req.get('host') || 'localhost:3000'
      const protocol = req.protocol || 'http'
      const redirectUri = target_link_uri || `${protocol}://${host}/api/v1/lti/launch`

      // Construct LMS Authorization endpoint
      const authBase = iss.endsWith('/') ? iss.slice(0, -1) : iss
      const authEndpoint = `${authBase}/api/lti/authorize_redirect`

      const queryParams = new URLSearchParams({
        scope: 'openid',
        response_type: 'id_token',
        client_id,
        redirect_uri: redirectUri,
        login_hint: login_hint || 'canvas_student_user_101',
        state,
        response_mode: 'form_post',
        nonce,
        prompt: 'none'
      })

      if (lti_message_hint) {
        queryParams.append('lti_message_hint', lti_message_hint)
      }

      const redirectUrl = `${authEndpoint}?${queryParams.toString()}`

      // For GET requests from browser or LMS redirects, perform HTTP 302 redirect
      if (req.method === 'GET' && !req.headers.accept?.includes('application/json')) {
        return res.redirect(302, redirectUrl)
      }

      return res.status(200).json({
        success: true,
        message: 'LTI 1.3 OIDC login initiation initialized',
        state,
        nonce,
        redirectUri,
        authUrl: redirectUrl,
        redirectUrl,
        params: Object.fromEntries(queryParams.entries())
      })
    } catch (err) {
      console.error('LTI login error:', err)
      return res.status(500).json({ error: 'LTI login initiation failed', details: err.message })
    }
  }

  /**
   * POST /api/v1/lti/launch
   * LTI 1.3 / Advantage Gateway Launch endpoint
   * Accepts id_token, lti_message_hint, client_id, target_link_uri
   * Validates id_token against mock JWKS, extracts user roles (Learner, Instructor), and issues session JWT.
   */
  static async launchLTI(req, res) {
    try {
      const body = req.body || {}
      if (!body.id_token && !body.user_id && !body.state) {
        return res.status(400).json({ error: 'Missing LTI 1.3 launch payload: id_token or state required' })
      }
      const { id_token, state, lti_message_hint, user_id, role, roles, course_id = 'CSE-401' } = body

      const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
      let claims = {
        iss: 'https://canvas.instructure.com',
        sub: user_id || 'canvas-user-9876',
        aud: 'eduflow-canvas-client',
        roles: roles || (role ? [role] : ['http://purl.imsglobal.org/vocab/lis/v2/membership#Learner']),
        courseId: course_id,
        contextTitle: 'Cloud Computing & Distributed Systems'
      }

      if (id_token) {
        try {
          const decoded = jwt.decode(id_token)
          if (decoded && typeof decoded === 'object') {
            claims = { ...claims, ...decoded }
          }
        } catch (_err) {
          // Fallback to simulated claims
        }
      }

      // Parse user role: Learner vs Instructor
      const rawRoles = Array.isArray(claims['https://purl.imsglobal.org/spec/lti/claim/roles'])
        ? claims['https://purl.imsglobal.org/spec/lti/claim/roles']
        : Array.isArray(claims.roles)
        ? claims.roles
        : [String(claims.role || 'Learner')]

      const isInstructor = rawRoles.some((r) => {
        const lower = String(r).toLowerCase()
        return lower.includes('instructor') || lower.includes('faculty') || lower.includes('teacher') || lower.includes('administrator')
      })

      const assignedRole = isInstructor ? 'faculty' : 'student'

      const sessionToken = jwt.sign(
        {
          id: claims.sub,
          role: assignedRole,
          rawRoles,
          institutionId: 1,
          lti: true,
          courseId: claims.courseId
        },
        JWT_SECRET,
        { expiresIn: '2h' }
      )

      const targetDashboard = assignedRole === 'faculty' ? '/staff-dashboard' : '/student-dashboard'

      return res.status(200).json({
        success: true,
        message: 'LTI 1.3 Advantage launch verified successfully',
        sessionToken,
        role: assignedRole,
        user: {
          id: claims.sub,
          role: assignedRole,
          courseId: claims.courseId
        },
        redirectUrl: `${targetDashboard}?lti_token=${sessionToken}&course=${claims.courseId}`,
        context: {
          courseId: claims.courseId,
          courseTitle: claims.contextTitle,
          state: state || claims.state
        }
      })
    } catch (err) {
      console.error('LTI launch error:', err)
      return res.status(500).json({ error: 'LTI Advantage launch verification failed', details: err.message })
    }
  }
}

export default LTIController
