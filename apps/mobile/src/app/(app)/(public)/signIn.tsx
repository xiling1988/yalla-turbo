import * as React from 'react'
import {
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSignIn } from '@clerk/clerk-expo'
import Input from '@/components/forms/Input'
import GoogleSignIn from '@/components/auth/GoogleSignIn'
import { PrimaryButton } from '@/components/ui/buttons'
import { normalizeClerkError } from '@/lib/clerk/normalizeClerkError'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthFooter from '@/components/auth/AuthFooter'
import PendingAttemptCard from '@/components/auth/PendingAttemptCard'
import Divider from '@/components/ui/Divider'

type FieldErrors = Record<string, string>

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [topError, setTopError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [loading, setLoading] = React.useState(false)
  const [pendingAttempt, setPendingAttempt] = React.useState<any | null>(null)

  const onSignInPress = async () => {
    if (!isLoaded) return
    setTopError(null)
    setFieldErrors({})
    setPendingAttempt(null)
    setLoading(true)

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // Save the attempt so the UI can offer a fallback path (e.g., use email instead)
        setPendingAttempt(signInAttempt)
        setTopError(
          'Your sign-in needs another step (e.g., passkey/OTP/OAuth). You can continue or switch methods.'
        )
      }
    } catch (err) {
      const norm = normalizeClerkError(err)
      setTopError(norm.message)
      if (norm.fieldErrors) setFieldErrors(norm.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  const resetToForm = () => {
    setPendingAttempt(null)
    setTopError(null)
  }

  // Sign up screen
  return (
    <SafeAreaView className='flex-1 bg-white px-6 dark:bg-neutral-950'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        {/* Header */}
        <View className='flex-1 justify-center mb-6'>
          <AuthHeader
            title='Welcome Back!'
            subtitle='Log in and continue your journey with Yallasana'
          />
        </View>

        {/* Body */}
        <View className='flex-1 justify-center'>
          {topError && (
            <View className='mb-3'>
              <View className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40'>
                <Text className='text-red-800 dark:text-red-200'>
                  {topError}
                </Text>
                <Link href='/forgotPassword' asChild>
                  <TouchableOpacity>
                    <Text className='text-sm text-neutral-500 underline'>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
          {pendingAttempt ? (
            <PendingAttemptCard onReset={resetToForm} />
          ) : (
            <View className='rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 my-3'>
              <View className='gap-3'>
                <Input
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  placeholder='Email address'
                  secureTextEntry={false}
                  keyboardType='email-address'
                  textContentType='emailAddress'
                />
                {fieldErrors.email && (
                  <Text className='text-xs text-red-600 dark:text-red-400'>
                    {fieldErrors.email}
                  </Text>
                )}
                <Input
                  keyboardType={'default'}
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Password'
                  secureTextEntry={true}
                  textContentType='password'
                />
                {fieldErrors.password && (
                  <Text className='text-xs text-red-600 dark:text-red-400'>
                    {fieldErrors.password}
                  </Text>
                )}
              </View>
              <View className='mt-4 gap-3'>
                <PrimaryButton
                  onPress={onSignInPress}
                  disabled={!emailAddress || !password}
                  loading={loading}
                >
                  Continue
                </PrimaryButton>
                {/* Optional: add a secondary action, e.g. Apple/Google later */}
                {/* <SecondaryButton onPress={() => {}}>Continue with Apple</SecondaryButton> */}
              </View>
            </View>
          )}
          <Divider />
          <GoogleSignIn />

          <View className='mt-4 flex-row items-center justify-center gap-1'>
            <Text className='text-neutral-600 dark:text-neutral-300'>
              New to Yallasana?
            </Text>
            <Link href='/signUp' asChild>
              <TouchableOpacity>
                <Text className='font-medium text-black underline decoration-2 underline-offset-4 dark:text-white'>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Footer */}
        <View className='flex-1 justify-end pb-5'>
          <AuthFooter />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
