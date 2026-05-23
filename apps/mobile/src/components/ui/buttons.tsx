import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

type PrimaryButtonProps = {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  loading?: boolean
}

export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`h-12 items-center justify-center rounded-xl bg-black dark:bg-white ${
        disabled || loading ? 'opacity-60' : ''
      }`}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color='white' />
      ) : (
        <Text className='text-base font-medium text-white dark:text-black'>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

type SecondaryButtonProps = {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
}

export function SecondaryButton({
  onPress,
  children,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className='h-12 items-center justify-center rounded-xl border border-neutral-300 dark:border-neutral-700'
      disabled={disabled}
    >
      <Text className='text-base font-medium text-neutral-800 dark:text-neutral-100'>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
