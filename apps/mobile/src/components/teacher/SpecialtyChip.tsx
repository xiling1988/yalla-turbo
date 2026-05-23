import React from 'react'
import { Text, View } from 'react-native'

type SpecialtyChipProps = {
  specialty: string
}

export default function SpecialtyChip({ specialty }: SpecialtyChipProps) {
  return (
    <View className='rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1'>
      <Text className='text-xs font-medium text-emerald-700'>{specialty}</Text>
    </View>
  )
}

