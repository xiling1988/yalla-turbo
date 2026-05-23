// src/lib/apiClient.ts
import { getApiToken, SessionExpiredError } from './authTokens'
import {
  markTokenFreshness,
  maybeClockSkew,
  PossibleClockSkewError,
} from './clockSkew'
import axios from 'axios'

// Allow the app shell to provide a handler (navigation/toast/etc.)
type UnauthorizedHandler = (
  reason: 'expired' | 'forbidden' | 'clockSkew' | 'unknown'
) => void
let onUnauthorized: UnauthorizedHandler | null = null
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

// We'll attach a marker to each request so we can detect "fresh token → immediate 401"
api.interceptors.request.use(async (config) => {
  try {
    const token = await getApiToken()
    if (!config.headers) {
      config.headers = {} as any
    }
    ;(config.headers as any).Authorization = `Bearer ${token}`
    // mark how fresh the token was when we issued this request
    ;(config as any).__tokenFetchedAt = markTokenFreshness()
  } catch (e) {
    // If we can't get a token, fail fast with a controlled error
    if (e instanceof SessionExpiredError) throw e
    // Unknown token retrieval failure — let the response handler deal with it
  }
  return config
})

// Centralized error handling
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status as number | undefined

    // Clock skew hint: fresh token + immediate 401/403
    const tokenFetchedAt = (err?.config as any)?.__tokenFetchedAt as
      | number
      | undefined
    if (tokenFetchedAt && maybeClockSkew(tokenFetchedAt, status)) {
      onUnauthorized?.('clockSkew')
      return Promise.reject(new PossibleClockSkewError())
    }

    if (status === 401) {
      onUnauthorized?.('expired') // soft sign-out + route to sign-in
    } else if (status === 403) {
      onUnauthorized?.('forbidden') // show “no access” and/or route
    } else if (err instanceof SessionExpiredError) {
      onUnauthorized?.('expired')
    } else if (!status) {
      // network or CORS-ish
      onUnauthorized?.('unknown')
    }

    return Promise.reject(err)
  }
)
