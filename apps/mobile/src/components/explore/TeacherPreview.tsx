import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { type TeacherProfile } from '@/types/teachers'
import { formatCurrency } from '@/lib/utils/formatting'

type TeacherPreviewProps = {
  teacher: TeacherProfile
  onClose: () => void
}

export default function TeacherPreview({
  teacher,
  onClose,
}: TeacherPreviewProps) {
  return (
    <View className='absolute bottom-6 left-0 right-0 z-40 px-4'>
      <View className='rounded-3xl border border-neutral-200 bg-white p-4 shadow-lg'>
        <View className='flex-row items-start gap-4'>
          <Image
            source={{ uri: teacher.avatarUrl }}
            className='h-14 w-14 rounded-full'
          />
          <View className='flex-1'>
            <View className='flex-row items-center justify-between gap-2'>
              <Text className='text-base font-semibold text-neutral-900'>
                {teacher.fullName}
              </Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text className='text-sm font-medium text-emerald-700'>
                  Close
                </Text>
              </Pressable>
            </View>
            <Text className='mt-1 text-xs uppercase tracking-wide text-neutral-500'>
              {teacher.location.neighborhood}, {teacher.location.city}
            </Text>
            <Text className='mt-2 text-sm text-neutral-700'>
              {teacher.shortBio}
            </Text>
            <View className='mt-3 flex-row items-center justify-between'>
              <Text className='text-sm font-medium text-neutral-900'>
                {formatCurrency(teacher.pricePerSession)} · Session
              </Text>
              <Text className='text-sm text-neutral-600'>
                ⭐ {teacher.rating.toFixed(1)} ({teacher.reviewCount})
              </Text>
            </View>
            <Text className='mt-2 text-xs text-neutral-500'>
              {teacher.specialties.join(' · ')}
            </Text>
          </View>
        </View>
        <Link
          href={{
            pathname: '/(app)/(tabs)/explore/teacher/[id]',
            params: { id: teacher.id },
          }}
          asChild
        >
          <Pressable className='mt-4 items-center rounded-full bg-emerald-600 py-3'>
            <Text className='text-sm font-semibold text-white'>
              View full profile
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

