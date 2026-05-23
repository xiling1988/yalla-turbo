import React from 'react'
import { Text, View } from 'react-native'

type AvailabilitySlotProps = {
  day: string
  startTime: string
  endTime: string
}

export default function AvailabilitySlot({
  day,
  startTime,
  endTime,
}: AvailabilitySlotProps) {
  return (
    <View className='flex-row items-center justify-between rounded-xl border border-neutral-200 px-4 py-3'>
      <Text className='text-sm font-medium text-neutral-800'>{day}</Text>
      <Text className='text-sm text-neutral-600'>
        {startTime} - {endTime}
      </Text>
    </View>
  )
}

