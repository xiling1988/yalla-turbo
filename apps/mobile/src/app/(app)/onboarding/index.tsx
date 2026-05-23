import React, { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboarding, useSpecialties } from '@/hooks/useOnboarding'
import Spinner from '@/components/utilities/Spinner'
import Input from '@/components/forms/Input'
import { PrimaryButton } from '@/components/ui/buttons'
import MapLocationPicker from '@/components/onboarding/MapLocationPicker'
import {
  OnboardingProgress,
  SessionFormat,
  StudentExperienceLevel,
  StudentProfileInput,
  StudentSessionType,
  TeacherProfileInput,
  TeacherTravelPolicy,
} from '@/types/onboarding'
import { router } from 'expo-router'

type StudentFormState = {
  // Step 1: Basic Info
  displayName: string
  bio: string // Using bio instead of shortBio for consistency
  goals: string
  city: string
  // Step 2: Experience & Preferences
  experienceLevel: StudentExperienceLevel | null
  preferredSession: StudentSessionType | null
  preferredFormats: SessionFormat[]
  // Step 3: Specialty Interests
  specialtyIds: string[]
}

type TeacherFormState = {
  // Step 1: Experience & Specialties
  yearsExperience: string
  specialtyIds: string[]
  // Step 2: Personal Info
  displayName: string
  headline: string
  bio: string
  // Step 3: Class Offer Details
  offeredFormats: SessionFormat[]
  sessionDurationMins: string
  pricePerSession: string
  currency: string
  acceptsPrivate: boolean
  acceptsGroup: boolean
  travelPolicy: TeacherTravelPolicy | null
  travelRadiusKm: string
  // Step 4: Teaching Bases
  bases: Array<{
    nickname: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    countryCode: string
    latitude: number | null
    longitude: number | null
    isPrimary: boolean
    notes: string
  }>
}

const formatLabels: Record<SessionFormat, string> = {
  IN_STUDIO: 'Studio',
  AT_HOME: 'At home',
  VIRTUAL: 'Virtual',
}

const sessionOptions: SessionFormat[] = ['IN_STUDIO', 'AT_HOME', 'VIRTUAL']

const studentSessionLabels: Record<StudentSessionType, string> = {
  IN_PERSON: 'In person',
  LIVE_VIRTUAL: 'Live virtual',
  ON_DEMAND: 'On-demand',
}

const studentSessions: StudentSessionType[] = [
  'IN_PERSON',
  'LIVE_VIRTUAL',
  'ON_DEMAND',
]

const travelPolicyLabels: Record<TeacherTravelPolicy, string> = {
  NONE: 'No travel',
  STUDENT_LOCATION: 'Travel to student',
  TEACHER_BASE_ONLY: 'Teacher bases only',
  HYBRID: 'Hybrid',
}

const travelPolicies: TeacherTravelPolicy[] = [
  'TEACHER_BASE_ONLY',
  'STUDENT_LOCATION',
  'HYBRID',
  'NONE',
]

function deriveRole(progress: OnboardingProgress | undefined) {
  if (!progress) return 'STUDENT'
  if (progress.role && progress.role !== 'PENDING') return progress.role
  return progress.intendedRole ?? 'STUDENT'
}

export default function OnboardingScreen() {
  const {
    progress,
    isLoading,
    setRole,
    clearRole,
    saveStudent,
    saveTeacher,
    completeOnboarding,
    isSaving,
  } = useOnboarding(true)

  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER'>(
    progress?.intendedRole ?? 'STUDENT'
  )

  const effectiveRole = useMemo(() => deriveRole(progress), [progress])
  const isTeacher = effectiveRole === 'TEACHER'
  const hasRoleSelected = Boolean(progress?.intendedRole)

  const [studentForm, setStudentForm] = useState<StudentFormState>({
    displayName: '',
    bio: '',
    goals: '',
    city: '',
    experienceLevel: null,
    preferredSession: null,
    preferredFormats: [],
    specialtyIds: [],
  })

  const [studentStep, setStudentStep] = useState(1)

  const [teacherForm, setTeacherForm] = useState<TeacherFormState>({
    yearsExperience: '',
    specialtyIds: [],
    displayName: '',
    headline: '',
    bio: '',
    offeredFormats: [],
    sessionDurationMins: '',
    pricePerSession: '',
    currency: 'USD',
    acceptsPrivate: true,
    acceptsGroup: false,
    travelPolicy: null,
    travelRadiusKm: '',
    bases: [],
  })

  const [teacherStep, setTeacherStep] = useState(1)

  useEffect(() => {
    if (progress?.studentProfile) {
      const profile = progress.studentProfile
      setStudentForm((prev) => ({
        ...prev,
        displayName: profile.displayName ?? '',
        bio: profile.shortBio ?? '', // Map shortBio to bio
        goals: profile.goals ?? '',
        city: profile.city ?? '',
        experienceLevel: profile.experienceLevel,
        preferredSession: profile.preferredSession,
        preferredFormats: profile.preferredFormats ?? [],
        specialtyIds: profile.specialtyIds ?? [],
      }))
    }
  }, [progress?.studentProfile])

  useEffect(() => {
    if (progress?.teacherProfile) {
      const profile = progress.teacherProfile
      // Convert yearsExperience number back to range
      const getExperienceRange = (years: number | null | undefined): string => {
        if (!years) return ''
        if (years <= 2) return '0-2'
        if (years <= 5) return '3-5'
        if (years <= 10) return '6-10'
        return '10+'
      }
      setTeacherForm((prev) => ({
        ...prev,
        yearsExperience: getExperienceRange(profile.yearsExperience) ?? '',
        specialtyIds: profile.specialtyIds ?? [],
        displayName: profile.displayName ?? '',
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        offeredFormats: profile.offeredFormats ?? [],
        sessionDurationMins: profile.sessionDurationMins?.toString() ?? '',
        pricePerSession: profile.pricePerSession?.toString() ?? '',
        currency: profile.currency ?? 'USD',
        acceptsPrivate: profile.acceptsPrivate,
        acceptsGroup: profile.acceptsGroup,
        travelPolicy: profile.travelPolicy,
        travelRadiusKm: profile.travelRadiusKm?.toString() ?? '',
        bases:
          profile.bases && profile.bases.length > 0
            ? profile.bases.map((b) => ({
                nickname: b.nickname ?? '',
                addressLine1: b.addressLine1 ?? '',
                addressLine2: b.addressLine2 ?? '',
                city: b.city ?? '',
                state: b.state ?? '',
                postalCode: b.postalCode ?? '',
                countryCode: b.countryCode ?? '',
                latitude: b.latitude,
                longitude: b.longitude,
                isPrimary: b.isPrimary ?? false,
                notes: b.notes ?? '',
              }))
            : [],
      }))
    }
  }, [progress?.teacherProfile])

  useEffect(() => {
    if (progress?.intendedRole) {
      setSelectedRole(progress.intendedRole)
    }
  }, [progress?.intendedRole])

  useEffect(() => {
    if (progress?.profileStatus === 'COMPLETED') {
      router.replace('/(app)/(tabs)')
    }
  }, [progress?.profileStatus])

  const handleRoleSelect = async (role: 'STUDENT' | 'TEACHER') => {
    try {
      setSelectedRole(role)
      await setRole(role)
      setFeedback(null)
    } catch (error) {
      Alert.alert('Failed to set role', (error as Error).message)
      // Revert selection on error
      setSelectedRole(progress?.intendedRole ?? 'STUDENT')
    }
  }

  const handleBackToRoleSelection = async () => {
    try {
      await clearRole()
      setFeedback(null)
    } catch (error) {
      Alert.alert('Failed to go back', (error as Error).message)
    }
  }

  const handleSaveStudent = async (autoComplete = false) => {
    try {
      const payload: StudentProfileInput = {
        displayName: studentForm.displayName.trim() || null,
        shortBio: studentForm.bio.trim() || null, // Map bio to shortBio
        goals: studentForm.goals.trim() || null,
        city: studentForm.city.trim() || null,
        experienceLevel: studentForm.experienceLevel,
        preferredSession: studentForm.preferredSession,
        preferredFormats: studentForm.preferredFormats,
        specialtyIds: studentForm.specialtyIds,
        autoComplete,
      }

      await saveStudent(payload)
      setFeedback(
        autoComplete
          ? 'Profile submitted successfully!'
          : 'Student profile saved'
      )
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message)
    }
  }

  const handleSaveTeacher = async (autoComplete = false) => {
    try {
      // Convert experience range to number
      const getExperienceYears = (range: string): number | undefined => {
        switch (range) {
          case '0-2':
            return 1
          case '3-5':
            return 4
          case '6-10':
            return 8
          case '10+':
            return 10
          default:
            return undefined
        }
      }

      const payload: TeacherProfileInput = {
        yearsExperience: teacherForm.yearsExperience
          ? getExperienceYears(teacherForm.yearsExperience)
          : undefined,
        specialtyIds: teacherForm.specialtyIds,
        displayName: teacherForm.displayName.trim() || null,
        headline: teacherForm.headline.trim() || null,
        bio: teacherForm.bio.trim() || null,
        offeredFormats: teacherForm.offeredFormats,
        sessionDurationMins: teacherForm.sessionDurationMins
          ? Number(teacherForm.sessionDurationMins)
          : undefined,
        pricePerSession: teacherForm.pricePerSession
          ? Number(teacherForm.pricePerSession)
          : undefined,
        currency: teacherForm.currency.trim().toUpperCase() || 'USD',
        acceptsPrivate: teacherForm.acceptsPrivate,
        acceptsGroup: teacherForm.acceptsGroup,
        travelPolicy: teacherForm.travelPolicy,
        travelRadiusKm: teacherForm.travelRadiusKm
          ? Number(teacherForm.travelRadiusKm)
          : undefined,
        bases: teacherForm.bases
          .filter(
            (b) =>
              b.addressLine1.trim() ||
              b.city.trim() ||
              (b.latitude !== null && b.longitude !== null)
          )
          .map((b) => ({
            nickname: b.nickname.trim() || null,
            addressLine1: b.addressLine1.trim() || null,
            addressLine2: b.addressLine2.trim() || null,
            city: b.city.trim() || null,
            state: b.state.trim() || null,
            postalCode: b.postalCode.trim() || null,
            countryCode: b.countryCode.trim() || null,
            latitude: b.latitude,
            longitude: b.longitude,
            isPrimary: b.isPrimary,
            notes: b.notes.trim() || null,
          })),
        autoComplete,
      }

      await saveTeacher(payload)
      setFeedback(
        autoComplete
          ? 'Profile submitted successfully!'
          : 'Teacher profile saved'
      )
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message)
    }
  }

  const _handleComplete = async () => {
    try {
      await completeOnboarding()
      setFeedback('Profile submitted!')
    } catch (error) {
      Alert.alert('Unable to complete onboarding', (error as Error).message)
    }
  }

  if (isLoading && !progress) {
    return <Spinner />
  }

  // Show role selection if role hasn't been selected yet
  if (!hasRoleSelected) {
    return (
      <SafeAreaView className='flex-1 bg-white px-4 pb-6 pt-4 dark:bg-neutral-950'>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 64 }}
          showsVerticalScrollIndicator={false}
        >
          <View className='mb-6'>
            <Text className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
              Welcome to Yallasana
            </Text>
            <Text className='mt-2 text-base text-neutral-600 dark:text-neutral-400'>
              Are you looking to practice yoga or teach it?
            </Text>
            {feedback ? (
              <Text className='mt-3 text-sm text-emerald-600 dark:text-emerald-400'>
                {feedback}
              </Text>
            ) : null}
          </View>

          <View className='space-y-4'>
            <TouchableOpacity
              onPress={() => setSelectedRole('STUDENT')}
              disabled={isSaving}
              className={`rounded-xl border-2 p-6 ${
                selectedRole === 'STUDENT'
                  ? 'border-black bg-neutral-50 dark:border-white dark:bg-neutral-900'
                  : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800'
              }`}
            >
              <Text
                className={`text-xl font-semibold ${
                  selectedRole === 'STUDENT'
                    ? 'text-black dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                I&apos;m a Student
              </Text>
              <Text
                className={`mt-2 text-base ${
                  selectedRole === 'STUDENT'
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-500 dark:text-neutral-500'
                }`}
              >
                Find and book yoga classes with instructors
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRole('TEACHER')}
              disabled={isSaving}
              className={`rounded-xl border-2 p-6 ${
                selectedRole === 'TEACHER'
                  ? 'border-black bg-neutral-50 dark:border-white dark:bg-neutral-900'
                  : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800'
              }`}
            >
              <Text
                className={`text-xl font-semibold ${
                  selectedRole === 'TEACHER'
                    ? 'text-black dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                I&apos;m an Instructor
              </Text>
              <Text
                className={`mt-2 text-base ${
                  selectedRole === 'TEACHER'
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-500 dark:text-neutral-500'
                }`}
              >
                Offer classes and connect with students
              </Text>
            </TouchableOpacity>
          </View>

          <View className='mt-8'>
            <PrimaryButton
              onPress={() => handleRoleSelect(selectedRole)}
              disabled={isSaving}
            >
              Continue as{' '}
              {selectedRole === 'STUDENT' ? 'Student' : 'Instructor'}
            </PrimaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-white px-4 pb-6 pt-4 dark:bg-neutral-950'>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        <View className='mb-6'>
          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
                Complete your profile
              </Text>
              <Text className='mt-2 text-base text-neutral-600 dark:text-neutral-400'>
                Tell us a bit more so we can tailor Yallasana to you.
              </Text>
            </View>
            {progress?.role === 'PENDING' && (
              <TouchableOpacity
                onPress={() => {
                  const newRole =
                    effectiveRole === 'STUDENT' ? 'TEACHER' : 'STUDENT'
                  handleRoleSelect(newRole)
                }}
                disabled={isSaving}
                className='ml-4 rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800'
              >
                <Text className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                  Switch to{' '}
                  {effectiveRole === 'STUDENT' ? 'Instructor' : 'Student'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {feedback ? (
            <Text className='mt-3 text-sm text-emerald-600 dark:text-emerald-400'>
              {feedback}
            </Text>
          ) : null}
        </View>

        {isTeacher ? (
          <TeacherMultiStepSection
            form={teacherForm}
            setForm={setTeacherForm}
            currentStep={teacherStep}
            setCurrentStep={setTeacherStep}
            onSave={handleSaveTeacher}
            onBackToRoleSelection={handleBackToRoleSelection}
            isSaving={isSaving}
          />
        ) : (
          <StudentMultiStepSection
            form={studentForm}
            setForm={setStudentForm}
            currentStep={studentStep}
            setCurrentStep={setStudentStep}
            onSave={handleSaveStudent}
            onBackToRoleSelection={handleBackToRoleSelection}
            isSaving={isSaving}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

type StudentMultiStepSectionProps = {
  form: StudentFormState
  setForm: React.Dispatch<React.SetStateAction<StudentFormState>>
  currentStep: number
  setCurrentStep: (step: number) => void
  isSaving: boolean
  onSave: (autoComplete: boolean) => Promise<void>
  onBackToRoleSelection: () => Promise<void>
}

const experienceLevelLabels: Record<StudentExperienceLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const experienceLevels: StudentExperienceLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]

function StudentMultiStepSection({
  form,
  setForm,
  currentStep,
  setCurrentStep,
  isSaving,
  onSave,
  onBackToRoleSelection,
}: StudentMultiStepSectionProps) {
  const { data: specialties, isLoading: isLoadingSpecialties } =
    useSpecialties()

  // Use fallback specialties if API returns empty array
  const availableSpecialties =
    specialties && specialties.length > 0 ? specialties : fallbackSpecialties

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return form.displayName.trim().length > 0 && form.city.trim().length > 0
      case 2:
        return true // All optional
      case 3:
        return true // All optional
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        // Save before moving to final step
        await onSave(false)
      }
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - submit with autoComplete
      await onSave(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleToggleFormat = (format: SessionFormat) => {
    setForm((prev) => {
      const exists = prev.preferredFormats.includes(format)
      return {
        ...prev,
        preferredFormats: exists
          ? prev.preferredFormats.filter((f) => f !== format)
          : [...prev.preferredFormats, format],
      }
    })
  }

  const handleToggleSpecialty = (specialtyId: string) => {
    setForm((prev) => {
      const exists = prev.specialtyIds.includes(specialtyId)
      return {
        ...prev,
        specialtyIds: exists
          ? prev.specialtyIds.filter((id) => id !== specialtyId)
          : [...prev.specialtyIds, specialtyId],
      }
    })
  }

  return (
    <View className='space-y-6'>
      {/* Step Indicator */}
      <View className='flex-row items-center justify-between'>
        {[1, 2, 3].map((step) => (
          <View key={step} className='flex-1 items-center'>
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                step === currentStep
                  ? 'bg-neutral-900 dark:bg-white'
                  : step < currentStep
                    ? 'bg-neutral-600 dark:bg-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  step === currentStep || step < currentStep
                    ? 'text-white dark:text-black'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  step < currentStep
                    ? 'bg-neutral-600 dark:bg-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
                style={{ marginLeft: '50%' }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      {currentStep === 1 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 1: Basic Info
          </Text>

          <Input
            placeholder='Display name *'
            value={form.displayName}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, displayName: text }))
            }
          />
          <Input
            placeholder='Tell instructors about yourself (optional)'
            value={form.bio}
            onChangeText={(text) => setForm((prev) => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={4}
          />
          <Input
            placeholder='Practice goals (optional)'
            value={form.goals}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, goals: text }))
            }
            multiline
            numberOfLines={3}
          />
          <Input
            placeholder='City *'
            value={form.city}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, city: text }))
            }
          />
        </View>
      )}

      {currentStep === 2 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 2: Experience & Preferences
          </Text>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Experience level (optional)
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {experienceLevels.map((level) => {
                const active = form.experienceLevel === level
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() =>
                      setForm((prev) => ({ ...prev, experienceLevel: level }))
                    }
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {experienceLevelLabels[level]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Preferred session type (optional)
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {studentSessions.map((option) => {
                const active = form.preferredSession === option
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setForm((prev) => ({ ...prev, preferredSession: option }))
                    }
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {studentSessionLabels[option]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Session formats (optional)
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {sessionOptions.map((option) => {
                const active = form.preferredFormats.includes(option)
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleToggleFormat(option)}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {formatLabels[option]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>
      )}

      {currentStep === 3 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 3: Specialty Interests
          </Text>

          <Text className='text-sm text-neutral-600 dark:text-neutral-400'>
            Select the yoga styles you&apos;re interested in. These will be used as
            default filters when browsing instructors. (optional)
          </Text>

          {isLoadingSpecialties ? (
            <Text className='text-sm text-neutral-500'>Loading...</Text>
          ) : (
            <View className='flex-row flex-wrap gap-2'>
              {availableSpecialties.map((specialty) => {
                const active = form.specialtyIds.includes(specialty.id)
                return (
                  <TouchableOpacity
                    key={specialty.id}
                    onPress={() => handleToggleSpecialty(specialty.id)}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {specialty.name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      )}

      {/* Navigation */}
      <View className='mt-6 flex-row gap-3'>
        {currentStep === 1 ? (
          <TouchableOpacity
            onPress={onBackToRoleSelection}
            disabled={isSaving}
            className='flex-1 rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800'
          >
            <Text className='text-center text-base font-medium text-neutral-700 dark:text-neutral-200'>
              Back
            </Text>
          </TouchableOpacity>
        ) : currentStep > 1 ? (
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={isSaving}
            className='flex-1 rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800'
          >
            <Text className='text-center text-base font-medium text-neutral-700 dark:text-neutral-200'>
              Previous
            </Text>
          </TouchableOpacity>
        ) : null}
        <View className='flex-1'>
          <PrimaryButton
            onPress={handleNext}
            disabled={isSaving || !canGoNext()}
          >
            {currentStep === 3 ? 'Submit' : 'Next'}
          </PrimaryButton>
        </View>
      </View>
    </View>
  )
}

type TeacherMultiStepSectionProps = {
  form: TeacherFormState
  setForm: React.Dispatch<React.SetStateAction<TeacherFormState>>
  currentStep: number
  setCurrentStep: (step: number) => void
  isSaving: boolean
  onSave: (autoComplete: boolean) => Promise<void>
  onBackToRoleSelection: () => Promise<void>
}

const experienceRanges = [
  { label: '0-2 years', value: '0-2' },
  { label: '3-5 years', value: '3-5' },
  { label: '6-10 years', value: '6-10' },
  { label: '10+ years', value: '10+' },
]

// Fallback specialties for development/testing when DB is empty
const fallbackSpecialties = [
  {
    id: 'fallback-vinyasa',
    name: 'Vinyasa',
    slug: 'vinyasa',
    description: null,
  },
  { id: 'fallback-hatha', name: 'Hatha', slug: 'hatha', description: null },
  {
    id: 'fallback-ashtanga',
    name: 'Ashtanga',
    slug: 'ashtanga',
    description: null,
  },
  { id: 'fallback-yin', name: 'Yin', slug: 'yin', description: null },
  {
    id: 'fallback-power',
    name: 'Power Yoga',
    slug: 'power-yoga',
    description: null,
  },
  {
    id: 'fallback-restorative',
    name: 'Restorative',
    slug: 'restorative',
    description: null,
  },
  { id: 'fallback-hot', name: 'Hot Yoga', slug: 'hot-yoga', description: null },
  {
    id: 'fallback-prenatal',
    name: 'Prenatal',
    slug: 'prenatal',
    description: null,
  },
]

function TeacherMultiStepSection({
  form,
  setForm,
  currentStep,
  setCurrentStep,
  isSaving,
  onSave,
  onBackToRoleSelection,
}: TeacherMultiStepSectionProps) {
  const { data: specialties, isLoading: isLoadingSpecialties } =
    useSpecialties()

  // Use fallback specialties if API returns empty array
  const availableSpecialties =
    specialties && specialties.length > 0 ? specialties : fallbackSpecialties

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return form.yearsExperience.length > 0 && form.specialtyIds.length > 0
      case 2:
        return (
          form.displayName.trim().length > 0 &&
          form.headline.trim().length > 0 &&
          form.bio.trim().length > 0
        )
      case 3:
        return (
          form.offeredFormats.length > 0 &&
          form.sessionDurationMins.length > 0 &&
          form.pricePerSession.length > 0 &&
          form.currency.length > 0
        )
      case 4: {
        const primaryBase = form.bases.find((b) => b.isPrimary)
        return (
          form.bases.length > 0 &&
          primaryBase !== undefined &&
          primaryBase.latitude !== null &&
          primaryBase.longitude !== null
        )
      }
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep < 4) {
      if (currentStep === 3) {
        // Save before moving to final step
        await onSave(false)
      }
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - submit with autoComplete
      await onSave(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleToggleSpecialty = (specialtyId: string) => {
    setForm((prev) => {
      const exists = prev.specialtyIds.includes(specialtyId)
      return {
        ...prev,
        specialtyIds: exists
          ? prev.specialtyIds.filter((id) => id !== specialtyId)
          : [...prev.specialtyIds, specialtyId],
      }
    })
  }

  const handleToggleFormat = (format: SessionFormat) => {
    setForm((prev) => {
      const exists = prev.offeredFormats.includes(format)
      return {
        ...prev,
        offeredFormats: exists
          ? prev.offeredFormats.filter((f) => f !== format)
          : [...prev.offeredFormats, format],
      }
    })
  }

  const handleAddBase = () => {
    setForm((prev) => ({
      ...prev,
      bases: [
        ...prev.bases,
        {
          nickname: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          countryCode: '',
          latitude: null,
          longitude: null,
          isPrimary: false, // Additional bases are never primary
          notes: '',
        },
      ],
    }))
  }

  const handleUpdateBase = (
    index: number,
    updates: Partial<TeacherFormState['bases'][0]>
  ) => {
    setForm((prev) => {
      let newBases = [...prev.bases]
      // If base doesn't exist at index, create it
      if (!newBases[index]) {
        newBases[index] = {
          nickname: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          countryCode: '',
          latitude: null,
          longitude: null,
          isPrimary: index === 0, // First base is primary
          notes: '',
        }
      }
      newBases[index] = { ...newBases[index], ...updates }
      return { ...prev, bases: newBases }
    })
  }

  const _handleSetPrimaryBase = (index: number) => {
    setForm((prev) => ({
      ...prev,
      bases: prev.bases.map((b, i) => ({
        ...b,
        isPrimary: i === index,
      })),
    }))
  }

  // Ensure first base is always primary when entering step 4
  useEffect(() => {
    if (currentStep === 4) {
      setForm((prev) => {
        // If no bases exist, create one
        if (prev.bases.length === 0) {
          return {
            ...prev,
            bases: [
              {
                nickname: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                countryCode: '',
                latitude: null,
                longitude: null,
                isPrimary: true,
                notes: '',
              },
            ],
          }
        }
        // Ensure at least one is primary
        const hasPrimary = prev.bases.some((b) => b.isPrimary)
        if (!hasPrimary) {
          const newBases = [...prev.bases]
          newBases[0].isPrimary = true
          return { ...prev, bases: newBases }
        }
        return prev
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Compute primary base with fallback for rendering
  const primaryBaseData = useMemo(() => {
    const primaryBaseIndex = form.bases.findIndex((b) => b.isPrimary)
    const primaryBase =
      primaryBaseIndex >= 0 ? form.bases[primaryBaseIndex] : null

    // If no primary base but bases exist, use first one as fallback
    if (!primaryBase && form.bases.length > 0) {
      return {
        base: form.bases[0],
        index: 0,
        isFallback: true,
      }
    }

    return {
      base: primaryBase,
      index: primaryBaseIndex,
      isFallback: false,
    }
  }, [form.bases])

  const handleRemoveBase = (index: number) => {
    setForm((prev) => {
      // Prevent removing the primary base if it's the only one
      if (prev.bases.length === 1 && prev.bases[0].isPrimary) {
        return prev
      }
      // Prevent removing the primary base
      if (prev.bases[index].isPrimary) {
        return prev
      }
      return {
        ...prev,
        bases: prev.bases.filter((_, i) => i !== index),
      }
    })
  }

  return (
    <View className='space-y-6'>
      {/* Step Indicator */}
      <View className='flex-row items-center justify-between'>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} className='flex-1 items-center'>
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                step === currentStep
                  ? 'bg-neutral-900 dark:bg-white'
                  : step < currentStep
                    ? 'bg-neutral-600 dark:bg-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  step === currentStep || step < currentStep
                    ? 'text-white dark:text-black'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {step}
              </Text>
            </View>
            {step < 4 && (
              <View
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  step < currentStep
                    ? 'bg-neutral-600 dark:bg-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
                style={{ marginLeft: '50%' }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      {currentStep === 1 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 1: Experience & Specialties
          </Text>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Years of experience
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {experienceRanges.map((range) => {
                const active = form.yearsExperience === range.value
                return (
                  <TouchableOpacity
                    key={range.value}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        yearsExperience: range.value,
                      }))
                    }
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Specialties (select all that apply)
            </Text>
            {isLoadingSpecialties ? (
              <Text className='text-sm text-neutral-500'>Loading...</Text>
            ) : (
              <View className='flex-row flex-wrap gap-2'>
                {availableSpecialties.map((specialty) => {
                  const active = form.specialtyIds.includes(specialty.id)
                  return (
                    <TouchableOpacity
                      key={specialty.id}
                      onPress={() => handleToggleSpecialty(specialty.id)}
                      className={`rounded-full border px-4 py-2 ${
                        active
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                          : 'border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          active
                            ? 'text-white dark:text-black'
                            : 'text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        {specialty.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        </View>
      )}

      {currentStep === 2 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 2: Personal Info
          </Text>

          <Input
            placeholder='Display name'
            value={form.displayName}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, displayName: text }))
            }
          />
          <Input
            placeholder='Headline (e.g. Vinyasa instructor)'
            value={form.headline}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, headline: text }))
            }
          />
          <Input
            placeholder='Tell students about yourself and your classes'
            value={form.bio}
            onChangeText={(text) => setForm((prev) => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={6}
          />
        </View>
      )}

      {currentStep === 3 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 3: Class Offer Details
          </Text>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Session formats (select all that apply)
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {sessionOptions.map((option) => {
                const active = form.offeredFormats.includes(option)
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleToggleFormat(option)}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {formatLabels[option]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <Input
            placeholder='Session duration (minutes)'
            value={form.sessionDurationMins}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                sessionDurationMins: text.replace(/[^0-9]/g, ''),
              }))
            }
            keyboardType='numeric'
          />
          <Input
            placeholder='Price per session'
            value={form.pricePerSession}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                pricePerSession: text.replace(/[^0-9.]/g, ''),
              }))
            }
            keyboardType='decimal-pad'
          />
          <Input
            placeholder='Currency (e.g. USD)'
            value={form.currency}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                currency: text.toUpperCase(),
              }))
            }
            autoCapitalize='characters'
          />

          <View className='flex-row items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800'>
            <View>
              <Text className='text-base font-medium text-neutral-800 dark:text-neutral-200'>
                Offer private sessions
              </Text>
              <Text className='text-sm text-neutral-500 dark:text-neutral-400'>
                Allow students to book 1:1 classes with you.
              </Text>
            </View>
            <Switch
              value={form.acceptsPrivate}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, acceptsPrivate: value }))
              }
            />
          </View>

          <View className='flex-row items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800'>
            <View>
              <Text className='text-base font-medium text-neutral-800 dark:text-neutral-200'>
                Offer group sessions
              </Text>
              <Text className='text-sm text-neutral-500 dark:text-neutral-400'>
                Host group classes or workshops.
              </Text>
            </View>
            <Switch
              value={form.acceptsGroup}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, acceptsGroup: value }))
              }
            />
          </View>

          <View>
            <Text className='mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Travel policy
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {travelPolicies.map((policy) => {
                const active = form.travelPolicy === policy
                return (
                  <TouchableOpacity
                    key={policy}
                    onPress={() =>
                      setForm((prev) => ({ ...prev, travelPolicy: policy }))
                    }
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active
                          ? 'text-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {travelPolicyLabels[policy]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {form.travelPolicy &&
            (form.travelPolicy === 'STUDENT_LOCATION' ||
              form.travelPolicy === 'HYBRID') && (
              <Input
                placeholder='Travel radius in km'
                value={form.travelRadiusKm}
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    travelRadiusKm: text.replace(/[^0-9]/g, ''),
                  }))
                }
                keyboardType='numeric'
              />
            )}
        </View>
      )}

      {currentStep === 4 && (
        <View className='space-y-6'>
          <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Step 4: Teaching Bases
          </Text>

          {/* Primary Instructor Base */}
          {(() => {
            const { base: primaryBase, index: primaryIdx } = primaryBaseData

            // Use primaryBase or create a temporary one for rendering
            // useEffect will create the actual base in state
            const displayBase = primaryBase || {
              nickname: '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              postalCode: '',
              countryCode: '',
              latitude: null,
              longitude: null,
              isPrimary: true,
              notes: '',
            }
            const displayIdx = primaryIdx >= 0 ? primaryIdx : 0

            return (
              <View className='space-y-4'>
                <View className='rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20'>
                  <View className='mb-3 flex-row items-center justify-between'>
                    <View className='flex-1'>
                      <Text className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                        Instructor Base
                      </Text>
                      <Text className='mt-1 text-sm text-emerald-700 dark:text-emerald-300'>
                        This location will be shown on the map for students
                      </Text>
                    </View>
                    <View className='rounded-full bg-emerald-600 px-2 py-1'>
                      <Text className='text-xs font-semibold text-white'>
                        Shown on Map
                      </Text>
                    </View>
                  </View>

                  <View className='mb-4'>
                    <MapLocationPicker
                      initialLatitude={displayBase.latitude ?? null}
                      initialLongitude={displayBase.longitude ?? null}
                      onLocationSelect={(lat, lng) => {
                        handleUpdateBase(displayIdx, {
                          latitude: lat,
                          longitude: lng,
                        })
                      }}
                      height={250}
                    />
                  </View>

                  <Input
                    placeholder='Nickname (e.g. Home studio)'
                    value={displayBase.nickname}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { nickname: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='Address line 1'
                    value={displayBase.addressLine1}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { addressLine1: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='Address line 2 (optional)'
                    value={displayBase.addressLine2}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { addressLine2: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='City'
                    value={displayBase.city}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { city: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='State/Province'
                    value={displayBase.state}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { state: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='Postal code'
                    value={displayBase.postalCode}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { postalCode: text })
                    }}
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='Country code (e.g. US)'
                    value={displayBase.countryCode}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, {
                        countryCode: text.toUpperCase(),
                      })
                    }}
                    autoCapitalize='characters'
                  />
                  <View className='h-3' />
                  <Input
                    placeholder='Notes (optional)'
                    value={displayBase.notes}
                    onChangeText={(text) => {
                      handleUpdateBase(displayIdx, { notes: text })
                    }}
                    multiline
                  />
                </View>

                {/* Additional Teaching Locations */}
                {form.bases.filter((b) => !b.isPrimary).length > 0 && (
                  <View className='space-y-4'>
                    <Text className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                      Additional Teaching Locations
                    </Text>
                    <Text className='text-sm text-neutral-600 dark:text-neutral-400'>
                      These locations won&apos;t appear on the map but can be used
                      for scheduling.
                    </Text>

                    {form.bases
                      .map((base, index) => ({ base, originalIndex: index }))
                      .filter(({ base }) => !base.isPrimary)
                      .map(({ base, originalIndex }, displayIndex) => (
                        <View
                          key={originalIndex}
                          className='rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800'
                        >
                          <View className='mb-4 flex-row items-center justify-between'>
                            <Text className='text-base font-semibold text-neutral-800 dark:text-neutral-100'>
                              Location {displayIndex + 1}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleRemoveBase(originalIndex)}
                              className='rounded-full bg-red-100 px-3 py-1 dark:bg-red-900'
                            >
                              <Text className='text-sm font-medium text-red-600 dark:text-red-300'>
                                Remove
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <Input
                            placeholder='Nickname (e.g. Studio 2)'
                            value={base.nickname}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, {
                                nickname: text,
                              })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='Address line 1'
                            value={base.addressLine1}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, {
                                addressLine1: text,
                              })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='Address line 2 (optional)'
                            value={base.addressLine2}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, {
                                addressLine2: text,
                              })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='City'
                            value={base.city}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, { city: text })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='State/Province'
                            value={base.state}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, { state: text })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='Postal code'
                            value={base.postalCode}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, {
                                postalCode: text,
                              })
                            }
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='Country code (e.g. US)'
                            value={base.countryCode}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, {
                                countryCode: text.toUpperCase(),
                              })
                            }
                            autoCapitalize='characters'
                          />
                          <View className='h-4' />
                          <Input
                            placeholder='Notes (optional)'
                            value={base.notes}
                            onChangeText={(text) =>
                              handleUpdateBase(originalIndex, { notes: text })
                            }
                            multiline
                          />
                        </View>
                      ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleAddBase}
                  className='rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800'
                >
                  <Text className='text-center text-sm font-medium text-neutral-700 dark:text-neutral-200'>
                    + Add another teaching location
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })()}
        </View>
      )}

      {/* Navigation */}
      <View className='mt-6 flex-row gap-3'>
        {currentStep === 1 ? (
          <TouchableOpacity
            onPress={onBackToRoleSelection}
            disabled={isSaving}
            className='flex-1 rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800'
          >
            <Text className='text-center text-base font-medium text-neutral-700 dark:text-neutral-200'>
              Back
            </Text>
          </TouchableOpacity>
        ) : currentStep > 1 ? (
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={isSaving}
            className='flex-1 rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800'
          >
            <Text className='text-center text-base font-medium text-neutral-700 dark:text-neutral-200'>
              Previous
            </Text>
          </TouchableOpacity>
        ) : null}
        <View className='flex-1'>
          <PrimaryButton
            onPress={handleNext}
            disabled={isSaving || !canGoNext()}
          >
            {currentStep === 4 ? 'Submit' : 'Next'}
          </PrimaryButton>
        </View>
      </View>
    </View>
  )
}
