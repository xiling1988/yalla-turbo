import React from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'

type RadiusPillProps = {
  radiusKm: number
  permissionDenied?: boolean
  onPress: () => void
}

export default function RadiusPill({
  radiusKm,
  permissionDenied,
  onPress,
}: RadiusPillProps) {
  return (
    <View
      className='absolute left-0 right-0 top-4 items-center'
      style={{
        pointerEvents: 'box-none',
        zIndex: 50,
        elevation: Platform.OS === 'android' ? 50 : 0,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className='rounded-full border border-neutral-200 bg-white/95 px-4 py-2 shadow-sm'
        style={{ pointerEvents: 'auto' }}
      >
        <View className='flex-row items-center gap-2'>
          <Text className='text-sm font-medium text-neutral-700'>
            Showing teachers within {radiusKm} km
          </Text>
          <View className='rounded-full bg-emerald-100 px-2 py-0.5'>
            <Text className='text-xs font-medium text-emerald-700'>
              Adjust
            </Text>
          </View>
        </View>
        {permissionDenied && (
          <Text className='mt-1 text-xs text-amber-600'>
            Location permission denied. Using a default Dubai region.
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

