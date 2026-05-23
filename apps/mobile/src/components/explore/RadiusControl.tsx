import React, { useMemo, useState } from 'react'
import { PanResponder, Platform, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type RadiusControlProps = {
  radiusKm: number
  minRadiusKm: number
  maxRadiusKm: number
  onRadiusChange: (radiusKm: number) => void
  onClose: () => void
}

export default function RadiusControl({
  radiusKm,
  minRadiusKm,
  maxRadiusKm,
  onRadiusChange,
  onClose,
}: RadiusControlProps) {
  const insets = useSafeAreaInsets()
  const [sliderWidth, setSliderWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = useMemo(() => {
    return ((radiusKm - minRadiusKm) / (maxRadiusKm - minRadiusKm)) * 100
  }, [radiusKm, minRadiusKm, maxRadiusKm])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (evt) => {
          console.log('Slider touch started')
          setIsDragging(true)
          if (sliderWidth === 0) {
            console.log('Slider width is 0, cannot update')
            return
          }
          const { locationX } = evt.nativeEvent
          const clampedX = Math.max(0, Math.min(sliderWidth, locationX))
          const newPercentage = (clampedX / sliderWidth) * 100
          const newRadius =
            minRadiusKm + (newPercentage / 100) * (maxRadiusKm - minRadiusKm)
          console.log('Setting radius from grant:', Math.round(newRadius))
          onRadiusChange(Math.round(newRadius))
        },
        onPanResponderMove: (evt) => {
          if (sliderWidth === 0) return
          const { locationX } = evt.nativeEvent
          const clampedX = Math.max(0, Math.min(sliderWidth, locationX))
          const newPercentage = (clampedX / sliderWidth) * 100
          const newRadius =
            minRadiusKm + (newPercentage / 100) * (maxRadiusKm - minRadiusKm)
          onRadiusChange(Math.round(newRadius))
        },
        onPanResponderRelease: () => {
          console.log('Slider touch released')
          setIsDragging(false)
        },
        onPanResponderTerminate: () => {
          setIsDragging(false)
        },
      }),
    [sliderWidth, minRadiusKm, maxRadiusKm, onRadiusChange]
  )

  const presetValues = [5, 10, 25, 50, 75, 100]

  return (
    <View
      className='absolute left-0 right-0 z-50 px-4'
      style={{
        bottom: Math.max(insets.bottom, 24),
        zIndex: 50,
        elevation: Platform.OS === 'android' ? 50 : 0,
        pointerEvents: 'box-none',
      }}
    >
      <View
        className='rounded-3xl border border-neutral-200 bg-white p-4 shadow-lg'
        style={{
          zIndex: 50,
        }}
      >
        <View className='mb-4 flex-row items-center justify-between'>
          <Text className='text-base font-semibold text-neutral-900'>
            Search Radius
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
            <Text className='text-sm font-medium text-emerald-700'>Done</Text>
          </TouchableOpacity>
        </View>

        <View className='mb-4'>
          <View className='mb-2 flex-row items-center justify-between'>
            <Text className='text-sm text-neutral-600'>{minRadiusKm} km</Text>
            <Text className='text-lg font-semibold text-emerald-700'>
              {radiusKm} km
            </Text>
            <Text className='text-sm text-neutral-600'>{maxRadiusKm} km</Text>
          </View>

          <View
            className='relative h-12 justify-center'
            onLayout={(evt) => {
              const { width } = evt.nativeEvent.layout
              if (width > 0 && sliderWidth !== width) {
                console.log('Slider width set to:', width)
                setSliderWidth(width)
              }
            }}
            {...panResponder.panHandlers}
          >
            <View
              className='h-2 rounded-full bg-neutral-200'
              pointerEvents='none'
            />
            <View
              className='absolute h-2 rounded-full bg-emerald-600'
              style={{ width: `${percentage}%` }}
              pointerEvents='none'
            />
            <View
              className='absolute h-8 w-8 rounded-full border-2 border-emerald-600 bg-white shadow-lg'
              style={{
                left: `${percentage}%`,
                marginLeft: -16,
                opacity: isDragging ? 1 : 0.9,
              }}
              pointerEvents='none'
            />
          </View>
        </View>

        <View className='flex-row flex-wrap gap-2'>
          {presetValues.map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => {
                // Prevent parent Pressable from receiving this touch
                console.log('Preset button pressed:', value)
                onRadiusChange(value)
              }}
              activeOpacity={0.7}
              className={`rounded-full border px-3 py-1.5 ${
                radiusKm === value
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-neutral-300 bg-white'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  radiusKm === value ? 'text-emerald-700' : 'text-neutral-700'
                }`}
              >
                {value} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

