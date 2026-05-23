import React from 'react'
import { Text, View } from 'react-native'
import { PrimaryButton } from '@/components/ui/buttons'

type PendingAttemptCardProps = {
  onReset: () => void
}

export default function PendingAttemptCard({
  onReset,
}: PendingAttemptCardProps) {
  return (
    <View className='rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 my-3'>
      <View className='gap-3'>
        <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
          Continue sign in
        </Text>
        <Text className='text-neutral-600 dark:text-neutral-300'>
          We need one more step to finish signing you in (e.g.,
          passkey/OTP/OAuth). If this is stuck on your device, you can switch
          methods.
        </Text>
        <PrimaryButton onPress={onReset}>
          Use email &amp; password instead
        </PrimaryButton>
        {/* Optionally, render buttons to resume the pending flow if available on the attempt */}
        {/* e.g., pendingAttempt?.startPasskeyFlow?.() */}
      </View>
    </View>
  )
}

