import { useAuth, getClerkInstance } from '@clerk/clerk-expo'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Spinner from '@/components/utilities/Spinner'
import { useOnboarding } from '@/hooks/useOnboarding'
import { PrimaryButton } from '@/components/ui/buttons'
import * as SecureStore from 'expo-secure-store'

function Layout() {
  const { isLoaded, isSignedIn } = useAuth()
  // Use lazy getter to avoid premature Clerk initialization
  const getClerk = () => getClerkInstance()
  const [sessionStateReady, setSessionStateReady] = useState(false)
  const [onboardingTimeout, setOnboardingTimeout] = useState(false)

  // Check SecureStore directly for Clerk's session data (both tokenCache and resourceCache keys)
  useEffect(() => {
    if (!isLoaded) return

    const checkSecureStore = async () => {
      try {
        // Clerk uses these keys:
        // 1. "__clerk_client_jwt" - for tokenCache (JWT tokens)
        // 2. "__clerk_cache_client_XXXXX" - for ClientResourceCache (session data)
        // 3. "__clerk_cache_session_jwt_XXXXX" - for SessionJWTCache
        // 4. "__clerk_cache_environment_XXXXX" - for EnvironmentResourceCache

        const publishableKey =
          process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
        const keySuffix = publishableKey.slice(-5) // Last 5 chars of publishableKey

        const keysToCheck = [
          '__clerk_client_jwt', // tokenCache
          `__clerk_cache_client_${keySuffix}`, // ClientResourceCache - THIS is what stores session!
          `__clerk_cache_session_jwt_${keySuffix}`, // SessionJWTCache
          `__clerk_cache_environment_${keySuffix}`, // EnvironmentResourceCache
        ]

        console.log(
          '[SecureStore] Checking for Clerk data with keys:',
          keysToCheck
        )

        for (const key of keysToCheck) {
          try {
            const value = await SecureStore.getItemAsync(key)
            if (value) {
              console.log(
                '[SecureStore] ✅ Found data! Key:',
                key,
                'Length:',
                value.length,
                'Preview:',
                value.substring(0, 100) + '...'
              )
            } else {
              console.log('[SecureStore] ❌ No data for key:', key)
            }
          } catch {
            console.log("[SecureStore] Error reading key (doesn't exist):", key)
          }
        }
      } catch (error) {
        console.error('[SecureStore] Error checking SecureStore:', error)
      }
    }

    const Clerk = getClerk()
    if (isLoaded && !isSignedIn && !Clerk.session) {
      checkSecureStore()
    }
  }, [isLoaded, isSignedIn])

  // Wait for Clerk to finish loading, then proceed
  // Once Clerk is loaded, isSignedIn from useAuth() hook will be accurate
  // If isSignedIn is already true, proceed immediately
  // Otherwise, give a brief moment for session restoration to complete
  // Stack.Protected guards will handle routing based on isSignedIn
  useEffect(() => {
    console.log(
      '[Session Check] Effect running - isLoaded:',
      isLoaded,
      'isSignedIn:',
      isSignedIn,
      'sessionStateReady:',
      sessionStateReady
    )

    if (!isLoaded) {
      setSessionStateReady(false)
      return
    }

    // If isSignedIn is already true, we're ready immediately
    if (isSignedIn) {
      console.log(
        '[Session Ready] ✅ User is signed in, marking ready immediately'
      )
      setSessionStateReady(true)
      return
    }

    // Otherwise, wait a short moment for session restoration
    // then mark ready - Stack.Protected guards will handle routing
    console.log(
      '[Session Check] Clerk is loaded but user not signed in, waiting briefly for session restoration...'
    )

    // Give Clerk a moment to restore session from cache (500ms should be enough)
    const timeout = setTimeout(() => {
      console.log(
        '[Session Ready] ✅ Timeout reached, marking ready - proceeding to render Stack - isSignedIn:',
        isSignedIn
      )
      setSessionStateReady(true)
    }, 500)

    return () => {
      console.log('[Session Check] Cleaning up timeout')
      clearTimeout(timeout)
    }
  }, [isLoaded, isSignedIn, sessionStateReady]) // Depend on both - if isSignedIn becomes true, proceed immediately

  // Only enable onboarding query when both loaded AND we've confirmed session state
  const shouldFetchOnboarding = isLoaded && sessionStateReady && isSignedIn

  const {
    progress,
    isLoading: onboardingLoading,
    error: onboardingError,
    refetchProgress,
  } = useOnboarding(shouldFetchOnboarding)

  // Set a timeout for onboarding query - if it takes too long, allow rendering anyway
  // This prevents infinite spinner if the API call hangs
  useEffect(() => {
    if (!shouldFetchOnboarding || !onboardingLoading || progress) {
      setOnboardingTimeout(false)
      return
    }

    console.log('[Layout] ⏱️ Starting onboarding timeout (10s)...')
    const timeout = setTimeout(() => {
      console.log(
        '[Layout] ⚠️ Onboarding query timeout - allowing render anyway'
      )
      setOnboardingTimeout(true)
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [shouldFetchOnboarding, onboardingLoading, progress])

  // Show spinner while Clerk is loading OR while waiting for session state to stabilize
  if (!isLoaded || !sessionStateReady) {
    console.log(
      '[Layout] 🔄 Showing spinner - isLoaded:',
      isLoaded,
      'sessionStateReady:',
      sessionStateReady
    )
    return <Spinner />
  }

  // Calculate needsOnboarding, but if we timed out or errored and have no progress data,
  // default to NOT needing onboarding (show tabs) to prevent redirect loop
  const hasValidProgress = !!progress
  const isTimedOutOrErrored =
    onboardingTimeout || (onboardingError && !progress)

  const needsOnboarding =
    Boolean(isSignedIn) &&
    hasValidProgress &&
    progress.profileStatus !== 'COMPLETED' &&
    !isTimedOutOrErrored

  console.log('[Layout] 📊 State check:', {
    isLoaded,
    sessionStateReady,
    isSignedIn,
    onboardingLoading,
    onboardingError: !!onboardingError,
    hasProgress: !!progress,
    onboardingTimeout,
    isTimedOutOrErrored,
    needsOnboarding,
  })

  // Only show spinner for onboarding if we have no progress data yet AND haven't timed out
  // If we have progress data (even if stale) or timeout occurred, we can render based on that
  // This prevents infinite spinner if the API call hangs
  if (isSignedIn && onboardingLoading && !progress && !onboardingTimeout) {
    console.log(
      '[Layout] 🔄 Showing spinner - onboarding loading and no progress data yet'
    )
    return <Spinner />
  }

  // Log if we're proceeding despite loading state
  if (isSignedIn && onboardingLoading && !progress && onboardingTimeout) {
    console.log(
      '[Layout] ⚠️ Proceeding despite onboarding loading (timeout) - will render with no progress'
    )
  }

  // Show error screen if there's an error AND no progress data
  // If we have progress data, we can proceed despite errors
  // If we've timed out, proceed to render Stack instead of showing error screen
  if (isSignedIn && onboardingError && !progress && !onboardingTimeout) {
    const errorMessage =
      onboardingError instanceof Error
        ? onboardingError.message
        : String(onboardingError)
    const isNetworkError =
      onboardingError instanceof Error &&
      (onboardingError.name === 'NetworkError' ||
        onboardingError.name === 'ConfigurationError' ||
        errorMessage.includes('connect') ||
        errorMessage.includes('network') ||
        errorMessage.includes('Network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out'))

    return (
      <View className='flex-1 items-center justify-center gap-4 bg-white p-6 dark:bg-black'>
        <Text className='text-center text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
          {isNetworkError
            ? 'Connection Error'
            : "We couldn't load your onboarding progress."}
        </Text>
        <Text className='text-center text-sm text-neutral-600 dark:text-neutral-400'>
          {isNetworkError
            ? 'Unable to connect to the server. Please check your connection and try again.'
            : errorMessage}
        </Text>
        <PrimaryButton onPress={() => refetchProgress()}>
          Try again
        </PrimaryButton>
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn && needsOnboarding}>
        <Stack.Screen name='onboarding' options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn && !needsOnboarding}>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name='(public)/signIn' options={{ headerShown: false }} />
        <Stack.Screen name='(public)/signUp' options={{ headerShown: false }} />
        <Stack.Screen
          name='(public)/forgotPassword'
          options={{ headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  )
}

export default Layout
