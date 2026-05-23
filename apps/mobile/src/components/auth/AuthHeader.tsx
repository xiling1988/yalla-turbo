import React from 'react'
import { Text, View } from 'react-native'

type AuthHeaderProps = {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View className='items-center gap-3 mb-2'>
      {/* Replace source with your actual logo asset or remote uri */}
      <View className='h-14 w-14 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/10'>
        {/* Example logo placeholder circle; swap with <Image> below */}
        {/* <Image source={require('@/assets/logo.png')} className="h-14 w-14 rounded-2xl" resizeMode="contain" /> */}
        <View className='h-7 w-7 rounded-full bg-black/60 dark:bg-white/80' />
      </View>
      <Text className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
        {title}
      </Text>
      <Text className='text-center text-neutral-500 dark:text-neutral-400'>
        {subtitle}
      </Text>
    </View>
  )
}

