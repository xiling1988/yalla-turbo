import React from 'react'
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/ui/buttons'
import OTPInput from '@/components/forms/OTPInput'
import AuthFooter from './AuthFooter'

type EmailVerificationScreenProps = {
  code: string
  onCodeChange: (code: string) => void
  onVerify: () => void
  onResend: () => void
  cooldown: number
  error?: string | null
  codeLength?: number
}

export default function EmailVerificationScreen({
  code,
  onCodeChange,
  onVerify,
  onResend,
  cooldown,
  error,
  codeLength = 6,
}: EmailVerificationScreenProps) {
  return (
    <SafeAreaView className='flex-1 bg-white px-6 dark:bg-neutral-950'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <View className='flex-1 justify-center'>
          <View className='mb-4 items-center gap-2'>
            <Text className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
              Verify your email
            </Text>
            <Text className='text-center text-neutral-500 dark:text-neutral-400'>
              We&apos;ve sent a 6-digit code to your inbox. Enter it below.
            </Text>
          </View>

          <View className='rounded-2xl border border-neutral-200 bg-white px-5 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
            <View className='gap-4'>
              <OTPInput
                value={code}
                onChange={onCodeChange}
                length={codeLength}
                error={error}
              />

              <PrimaryButton
                onPress={onVerify}
                disabled={code.length !== codeLength}
              >
                Verify
              </PrimaryButton>

              <View className='flex-row items-center justify-center'>
                {cooldown > 0 ? (
                  <Text className='text-sm text-neutral-500 dark:text-neutral-400'>
                    Resend code in {cooldown}s
                  </Text>
                ) : (
                  <Text
                    onPress={onResend}
                    className='text-sm font-medium text-black underline decoration-2 underline-offset-4 dark:text-white'
                  >
                    Resend code
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View className='flex-1 justify-end pb-5'>
          <AuthFooter helpText='Having trouble? Check your spam folder or try resending the code.' />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

