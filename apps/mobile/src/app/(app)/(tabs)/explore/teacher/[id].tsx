import React, { useMemo } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { mockTeachers } from '@/data/teachers'
import SpecialtyChip from '@/components/teacher/SpecialtyChip'
import PriceCard from '@/components/teacher/PriceCard'
import AvailabilitySlot from '@/components/teacher/AvailabilitySlot'

export default function ExploreTeacherProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()

  const teacher = useMemo(
    () => mockTeachers.find((item) => item.id === id),
    [id]
  )

  if (!teacher) {
    return (
      <View className='flex flex-1 items-center justify-center bg-white px-6'>
        <Text className='text-base font-semibold text-neutral-900'>
          Teacher not found
        </Text>
        <Text className='mt-2 text-sm text-neutral-600'>
          The teacher you&apos;re looking for is no longer available.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className='mt-4 text-sm font-semibold text-emerald-700'>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      className='flex-1 bg-white'
      contentInsetAdjustmentBehavior='automatic'
    >
      <View className='px-6 pb-10 pt-6'>
        <View className='items-center'>
          <Image
            source={{ uri: teacher.avatarUrl }}
            className='h-28 w-28 rounded-full'
          />
          <Text className='mt-4 text-xl font-semibold text-neutral-900'>
            {teacher.fullName}
          </Text>
          <Text className='mt-1 text-sm text-neutral-600'>
            {teacher.location.neighborhood}, {teacher.location.city}
          </Text>
          <Text className='mt-1 text-sm text-neutral-600'>
            ⭐ {teacher.rating.toFixed(1)} ({teacher.reviewCount} reviews)
          </Text>
        </View>

        <View className='mt-6'>
          <Text className='text-base font-semibold text-neutral-900'>
            About
          </Text>
          <Text className='mt-2 text-sm leading-6 text-neutral-700'>
            {teacher.shortBio}
          </Text>
        </View>

        <View className='mt-6'>
          <Text className='text-base font-semibold text-neutral-900'>
            Specialties
          </Text>
          <View className='mt-3 flex-row flex-wrap gap-2'>
            {teacher.specialties.map((specialty) => (
              <SpecialtyChip key={specialty} specialty={specialty} />
            ))}
          </View>
        </View>

        <PriceCard
          pricePerSession={teacher.pricePerSession}
          yearsExperience={teacher.yearsExperience}
        />

        <View className='mt-6'>
          <Text className='text-base font-semibold text-neutral-900'>
            Weekly availability
          </Text>
          <View className='mt-3 gap-2'>
            {teacher.availability.map((slot, index) => (
              <AvailabilitySlot
                key={`${slot.day}-${index}`}
                day={slot.day}
                startTime={slot.startTime}
                endTime={slot.endTime}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
