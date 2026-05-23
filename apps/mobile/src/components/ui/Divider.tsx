import React from 'react'
import { Text, View } from 'react-native'

type DividerProps = {
  label?: string
}

export default function Divider({ label = 'or' }: DividerProps) {
  return (
    <View className='flex-row items-center justify-center gap-4'>
      <View className='h-px flex-1 bg-neutral-200 dark:bg-neutral-800' />
      <Text className='text-neutral-600 dark:text-neutral-300'>{label}</Text>
      <View className='h-px flex-1 bg-neutral-200 dark:bg-neutral-800' />
    </View>
  )
}

