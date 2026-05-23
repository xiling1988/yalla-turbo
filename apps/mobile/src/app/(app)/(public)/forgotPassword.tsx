import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSignIn } from '@clerk/clerk-expo'
import Input from '@/components/forms/Input'
import { PrimaryButton } from '@/components/ui/buttons'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sendResetCode = async () => {
    if (!isLoaded) return
    setError(null)
    setLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setStep('verify')
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!isLoaded) return
    setError(null)
    setLoading(true)
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      })

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.replace('/')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Invalid code or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className='flex-1 justify-center px-6 bg-white dark:bg-neutral-950'>
      {step === 'email' ? (
        <View className='gap-4'>
          <Text className='text-2xl font-semibold'>Reset your password</Text>
          <Input
            placeholder='Email address'
            keyboardType='email-address'
            autoCapitalize='none'
            value={email}
            onChangeText={setEmail}
          />
          {error && <Text className='text-red-600 dark:text-red-400'>{error}</Text>}
          <PrimaryButton onPress={sendResetCode} disabled={loading}>
            {loading ? 'Sending...' : 'Send reset code'}
          </PrimaryButton>
        </View>
      ) : (
        <View className='gap-4'>
          <Text className='text-2xl font-semibold'>
            Enter code & new password
          </Text>
          <Input
            placeholder='Verification code'
            value={code}
            onChangeText={setCode}
          />
          <Input
            placeholder='New password'
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          {error && <Text className='text-red-600 dark:text-red-400'>{error}</Text>}
          <PrimaryButton onPress={resetPassword} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </PrimaryButton>
        </View>
      )}
    </SafeAreaView>
  )
}
