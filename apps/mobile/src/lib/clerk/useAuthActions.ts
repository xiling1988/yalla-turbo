// src/features/auth/useAuthActions.ts
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-expo'
import { normalizeClerkError } from './normalizeClerkError'

export function useAuthActions() {
  const { signIn, setActive } = useSignIn()
  const { signUp } = useSignUp()
  const { signOut } = useAuth()

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      })

      // Some flows require second factor/verification:
      // attempt.status could be "complete" or a "needs_..." state.
      if (attempt.status === 'complete') {
        await setActive!({ session: attempt.createdSessionId })
        return { ok: true as const }
      }

      // e.g. passkey/sso/otp step pending
      return { ok: false as const, next: attempt }
    } catch (e) {
      return { ok: false as const, error: normalizeClerkError(e) }
    }
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      const attempt = await signUp.create({ emailAddress: email, password })
      // Send verification (email code) if needed:
      if (attempt.status !== 'complete') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      }
      return { ok: true as const, next: attempt }
    } catch (e) {
      return { ok: false as const, error: normalizeClerkError(e) }
    }
  }

  const verifyEmailCode = async (code: string) => {
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        // Create session from signUp
        // @ts-ignore: createdSessionId exists when complete
        await setActive!({ session: result.createdSessionId })
        return { ok: true as const }
      }
      return { ok: false as const, next: result }
    } catch (e) {
      return { ok: false as const, error: normalizeClerkError(e) }
    }
  }

  const signOutEverywhere = async () => {
    try {
      await signOut()
      return { ok: true as const }
    } catch (e) {
      return { ok: false as const, error: normalizeClerkError(e) }
    }
  }

  return {
    signInWithEmailPassword,
    signUpWithEmailPassword,
    verifyEmailCode,
    signOutEverywhere,
  }
}
