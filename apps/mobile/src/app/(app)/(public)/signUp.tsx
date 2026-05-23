import { KeyboardAvoidingView, Text, TouchableOpacity, View, Platform } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSignUp } from '@clerk/clerk-expo'
import Input from '@/components/forms/Input'
import GoogleSignIn from '@/components/auth/GoogleSignIn'
import { PrimaryButton } from '@/components/ui/buttons'
import { useEffect, useRef, useState } from 'react'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthFooter from '@/components/auth/AuthFooter'
import Divider from '@/components/ui/Divider'
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen'

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const length = 6 // OTP code length
  const [cooldown, setCooldown] = useState(30)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!pendingVerification) return
    // start resend cooldown
    setCooldown(30)
    cooldownRef.current && clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [pendingVerification])

  const onResend = async () => {
    if (!isLoaded || cooldown > 0) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setCooldown(30)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle the submission of the sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // --- PENDING VERIFICATION SCREEN ---
  if (pendingVerification) {
    return (
      <EmailVerificationScreen
        code={code}
        onCodeChange={setCode}
        onVerify={onVerifyPress}
        onResend={onResend}
        cooldown={cooldown}
        error={null}
        codeLength={length}
      />
    )
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
            title='Welcome to Yallasana!'
            subtitle='Register and start your journey with Yallasana'
          />
        </View>

        {/* Body */}
        <View className='flex-1 justify-center'>
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
              <Input
                keyboardType={'default'}
                value={password}
                onChangeText={setPassword}
                placeholder='Password'
                secureTextEntry={true}
                textContentType='password'
              />
            </View>
            <View className='mt-4 gap-3'>
              <PrimaryButton onPress={onSignUpPress}>Continue</PrimaryButton>
              {/* Optional: add a secondary action, e.g. Apple/Google later */}
              {/* <SecondaryButton onPress={() => {}}>Continue with Apple</SecondaryButton> */}
            </View>
          </View>
          <Divider />
          <GoogleSignIn />
          <View className='mt-4 flex-row items-center justify-center gap-1'>
            <Text className='text-neutral-600 dark:text-neutral-300'>
              Already have an account?
            </Text>
            <Link href='/signIn' asChild>
              <TouchableOpacity>
                <Text className='font-medium text-black underline decoration-2 underline-offset-4 dark:text-white'>
                  Sign In
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
