import React from 'react'
import { Text, View } from 'react-native'
import { formatCurrency } from '@/lib/utils/formatting'

type PriceCardProps = {
  pricePerSession: number
  yearsExperience: number
  label?: string
}

export default function PriceCard({
  pricePerSession,
  yearsExperience,
  label = 'Private session',
}: PriceCardProps) {
  return (
    <View className='flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3'>
      <View>
        <Text className='text-sm text-neutral-600'>{label}</Text>
        <Text className='text-lg font-semibold text-neutral-900'>
          {formatCurrency(pricePerSession)}
        </Text>
      </View>
      <Text className='text-xs text-neutral-500'>
        {yearsExperience} years experience
      </Text>
    </View>
  )
}

