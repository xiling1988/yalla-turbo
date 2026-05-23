import '../global.css'
import { getClerkInstance, ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { Slot, useRouter } from 'expo-router'
import { tokenCache } from '@/lib/clerk/tokenCache'
import { createResourceCache } from '@/lib/clerk/resourceCache'
import queryClient from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useRef } from 'react'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import * as Clipboard from 'expo-clipboard'
import { setUnauthorizedHandler } from '@/lib/api'
import { Alert, Platform, ToastAndroid } from 'react-native'

function UnauthorizedHandler() {
  const router = useRouter()
  const Clerk = getClerkInstance()
  const { isSignedIn, isLoaded } = useAuth()
  const handlerCalledRef = useRef<Map<string, number>>(new Map())
  const DEBOUNCE_MS = 2000 // Prevent multiple dialogs within 2 seconds

  useEffect(() => {
    setUnauthorizedHandler(async (reason) => {
      // Only handle ACTUAL server auth errors, not initialization states
      // Don't redirect based on !isSignedIn - let Stack.Protected guards handle routing

      // Debounce: prevent multiple handler calls within DEBOUNCE_MS
      const now = Date.now()
      const lastCalled = handlerCalledRef.current.get(reason) || 0

      // Skip if same reason called recently
      if (now - lastCalled < DEBOUNCE_MS) {
        return
      }

      // Record this call
      handlerCalledRef.current.set(reason, now)

      const say = (msg: string) => {
        if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.LONG)
        else Alert.alert('Authentication', msg)
      }

      if (reason === 'clockSkew') {
        say(
          "We couldn't validate your session. Please ensure your device time is set automatically."
        )
        return
      }
      if (reason === 'forbidden') {
        say("You don't have access to that.")
        return
      }

      // expired / unknown → Only handle if Clerk is fully loaded AND user is signed in
      // This means we got an actual 401/403 from the server (real auth error)
      // If !isSignedIn, don't redirect - Stack.Protected guards will handle it
      if (isLoaded && isSignedIn) {
        try {
          await Clerk.signOut()
        } catch {
          // Ignore sign out errors
        }
        say('Your session expired. Please sign in again.')
        router.replace('/signIn')
      }
      // If !isSignedIn, don't redirect here - let Stack.Protected guards show sign-in screen
      // This prevents false redirects during initialization when session is restoring
    })
  }, [router, isSignedIn, isLoaded, Clerk])

  return null
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function Layout() {
  // Define your copy function based on your platform
  const onCopy = async (text: string) => {
    try {
      // For Expo:
      await Clipboard.setStringAsync(text)

      return true
    } catch {
      return false
    }
  }

  console.log('[Root Layout] Rendering with tokenCache:', !!tokenCache)
  console.log(
    '[Root Layout] Rendering with resourceCache:',
    !!createResourceCache
  )
  console.log('[Root Layout] resourceCache type:', typeof createResourceCache)
  console.log(
    '[Root Layout] resourceCache is function:',
    typeof createResourceCache === 'function'
  )
  console.log('[Root Layout] Platform.OS:', Platform.OS)

  // Wrap createResourceCache to add logging when Clerk calls it
  // IMPORTANT: This must be called BEFORE Clerk instance is created
  // Clerk uses singleton pattern - if instance exists, resourceCache won't be used
  const wrappedResourceCache = () => {
    console.log(
      '[Root Layout] 🚨 WRAPPED createResourceCache() called by Clerk!'
    )
    console.log('[Root Layout] Platform at call time:', Platform.OS)
    const result = createResourceCache()
    console.log('[Root Layout] ✅ Wrapped function returned:', !!result)
    return result
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      __experimental_resourceCache={wrappedResourceCache}
      publishableKey={publishableKey}
    >
      <QueryClientProvider client={queryClient}>
        <UnauthorizedHandler />
        <Slot />
        <DevToolsBubble
          onCopy={onCopy}
          queryClient={queryClient}
          bubbleStyle={{
            left: 16,
            right: undefined,
          }}
        />
      </QueryClientProvider>
    </ClerkProvider>
  )
}
