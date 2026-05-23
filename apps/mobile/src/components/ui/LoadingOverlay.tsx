import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

type LoadingOverlayProps = {
  message?: string
  secondaryMessage?: string
}

export default function LoadingOverlay({
  message,
  secondaryMessage,
}: LoadingOverlayProps) {
  return (
    <View className='absolute inset-0 z-20 items-center justify-center bg-white/80'>
      <ActivityIndicator size='large' />
      {message && (
        <Text className='mt-3 text-sm text-neutral-600'>{message}</Text>
      )}
      {secondaryMessage && (
        <Text className='mt-1 text-xs text-neutral-500'>{secondaryMessage}</Text>
      )}
    </View>
  )
}

