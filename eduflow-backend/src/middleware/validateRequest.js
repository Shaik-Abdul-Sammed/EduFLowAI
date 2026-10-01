import { z } from 'zod'

/**
 * Express middleware that validates req.body against a Zod schema.
 * Returns HTTP 400 with { error: "Validation failed", details: [...] } on failure.
 *
 * @param {import('zod').ZodSchema} schema
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        error: 'Validation failed',
        details,
      })
    }

    req.body = result.data
    next()
  }
}

// Pre-defined schemas for core production endpoints
export const loginSchema = z.object({
  institutionId: z.union([z.string(), z.number()]).optional(),
  email: z.string().email('Invalid email address').or(z.string().min(1)).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
}).refine((data) => Boolean(data.email || data.username), {
  message: 'Either email or username is required',
  path: ['email'],
})

export const registerUserSchema = z.object({
  institutionId: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').or(z.string().min(1)).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Role is required'),
}).refine((data) => Boolean(data.email || data.username), {
  message: 'Email or username is required',
  path: ['email'],
})

export const registerInstitutionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  institutionName: z.string().min(1).optional(),
  subdomain: z.string().min(1, 'Subdomain is required'),
  adminName: z.string().optional(),
  adminEmail: z.string().email('Invalid admin email').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
}).refine((data) => Boolean(data.name || data.institutionName), {
  message: 'Institution name is required',
  path: ['name'],
}).refine((data) => Boolean(data.adminEmail || data.email), {
  message: 'Admin email is required',
  path: ['adminEmail'],
})

export const officerPromptSchema = z.object({
  prompt: z.string().max(5000, 'Prompt cannot exceed 5000 characters').optional(),
  reportType: z.string().max(5000).optional(),
  action: z.string().max(5000).optional(),
  actionType: z.string().optional(),
  messages: z.array(z.any()).optional(),
  digitalTwin: z.any().optional(),
})

export const aiChatSchema = z.object({
  message: z.string().max(5000, 'Message cannot exceed 5000 characters').optional(),
  messages: z.array(z.any()).optional(),
  institutionId: z.string().optional(),
  digitalTwin: z.any().optional(),
}).refine((data) => Boolean(data.message || (data.messages && data.messages.length > 0)), {
  message: 'Either message or messages array is required',
  path: ['message'],
})

export default validateRequest
