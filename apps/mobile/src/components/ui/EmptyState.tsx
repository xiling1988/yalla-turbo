import React from 'react'
import { Text, View } from 'react-native'

type EmptyStateProps = {
  title: string
  message?: string
  position?: 'top' | 'bottom'
}

export default function EmptyState({
  title,
  message,
  position = 'bottom',
}: EmptyStateProps) {
  const containerClass = position === 'top' ? 'top-4' : 'bottom-32'

  return (
    <View
      className={`pointer-events-none absolute left-0 right-0 ${containerClass} z-30 items-center px-8`}
    >
      <View className='pointer-events-auto rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-sm'>
        <Text className='text-sm font-medium text-neutral-800'>{title}</Text>
        {message && (
          <Text className='mt-1 text-xs text-neutral-600'>{message}</Text>
        )}
      </View>
    </View>
  )
}

