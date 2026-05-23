import { Clerk } from '@clerk/clerk-expo'

// Your Clerk JWT template name
const JWT_TEMPLATE = 'yallasana'

// Error types (nice for discriminated unions)
export class SessionExpiredError extends Error {
  constructor(msg = 'Your session expired. Please sign in again.') {
    super(msg)
    this.name = 'SessionExpiredError'
  }
}

export async function getApiToken(): Promise<string> {
  // Clerk.session is available outside React components
  const token =
    (await Clerk.session?.getToken({ template: JWT_TEMPLATE })) ??
    (await Clerk.session?.getToken()) // fall back if template misconfigured

  if (!token) throw new SessionExpiredError()
  return token
}
