import { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { api } from '@/lib/api'
import { PrimaryButton } from '@/components/ui/buttons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function Profile() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { resetOnboarding, isSaving, refetchProgress } = useOnboarding()

  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const pingPublic = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api<{ message?: string }>('', { method: 'GET' })
      setResult(data?.message ?? JSON.stringify(data))
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const pingProtected = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api<{ id: string; email: string }>('users/me', {
        method: 'GET',
        auth: true, // <-- this is all you need
      })
      setResult(`Hello ${data.email}`)
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will delete all your profile data and reset onboarding. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setError(null)
              await resetOnboarding()
              await refetchProgress()
              setResult(
                'Onboarding reset successfully! You will be redirected to onboarding.'
              )
            } catch (e: any) {
              setError(e.message || 'Failed to reset onboarding')
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className='flex-1'>
      <View className='flex-1 bg-white px-6 py-6 dark:bg-neutral-950'>
        <Text className='text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
          {user?.firstName ?? 'User'}
        </Text>
        <Text className='text-neutral-500 dark:text-neutral-400'>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        <View className='mt-6 gap-3'>
          <PrimaryButton onPress={pingPublic} disabled={loading}>
            {loading ? 'Checking…' : 'Test Public'}
          </PrimaryButton>
          <PrimaryButton onPress={pingPublic} disabled={loading}>
            {loading ? 'Checking…' : 'MOBILE CI IS ALIVE'}
          </PrimaryButton>
          <PrimaryButton onPress={pingProtected} disabled={loading}>
            {loading ? 'Checking…' : 'Test Protected /me'}
          </PrimaryButton>
          <PrimaryButton
            onPress={handleResetOnboarding}
            disabled={loading || isSaving}
          >
            {isSaving ? 'Resetting…' : 'Reset Onboarding (Test)'}
          </PrimaryButton>
        </View>

        {result ? (
          <Text className='mt-4 text-green-700 dark:text-green-400'>
            {result}
          </Text>
        ) : null}
        {error ? (
          <Text className='mt-2 text-red-600 dark:text-red-400'>{error}</Text>
        ) : null}

        <View className='mt-auto'>
          <PrimaryButton onPress={() => signOut()}>Sign out</PrimaryButton>
        </View>
      </View>
    </SafeAreaView>
  )
}
