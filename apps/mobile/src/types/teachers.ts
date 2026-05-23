// API response type from server
export type TeacherApiResponse = {
  id: string
  userId: string
  displayName: string | null
  shortBio: string | null
  yearsExperience: number
  averageRating: number | null
  reviewCount: number
  pricePerSession: number | null
  currency: string | null
  avatarUrl: string | null
  specialties: string[]
  primaryBase: {
    latitude: number
    longitude: number
    neighborhood: string | null
    city: string | null
  } | null
}

// TeacherProfile type used in ExploreScreen (from data/teachers.ts)
export type TeacherSpecialty =
  | 'Vinyasa'
  | 'Hatha'
  | 'Yin'
  | 'Restorative'
  | 'Ashtanga'
  | 'Prenatal'

export type TeacherAvailability = {
  day: string
  startTime: string
  endTime: string
}

export type TeacherProfile = {
  id: string
  fullName: string
  shortBio: string
  yearsExperience: number
  rating: number
  reviewCount: number
  pricePerSession: number
  specialties: TeacherSpecialty[]
  languages: string[]
  avatarUrl: string
  location: {
    latitude: number
    longitude: number
    neighborhood: string
    city: string
  }
  availability: TeacherAvailability[]
}

/**
 * Maps API response to ExploreScreen TeacherProfile format
 */
export function mapTeacherApiToProfile(apiTeacher: TeacherApiResponse): TeacherProfile | null {
  // Filter out teachers without primary base
  if (!apiTeacher.primaryBase) {
    return null
  }

  // Ensure displayName is present (required for display)
  if (!apiTeacher.displayName) {
    return null
  }

  // Use fallback values for optional fields
  const shortBio = apiTeacher.shortBio || 'No bio available'
  const avatarUrl = apiTeacher.avatarUrl || 'https://via.placeholder.com/256?text=Teacher'

  // Map specialties - filter to only valid TeacherSpecialty types
  const validSpecialties: TeacherSpecialty[] = [
    'Vinyasa',
    'Hatha',
    'Yin',
    'Restorative',
    'Ashtanga',
    'Prenatal',
  ]
  const specialties = apiTeacher.specialties.filter((s): s is TeacherSpecialty =>
    validSpecialties.includes(s as TeacherSpecialty)
  )

  return {
    id: apiTeacher.id,
    fullName: apiTeacher.displayName,
    shortBio: shortBio,
    yearsExperience: apiTeacher.yearsExperience,
    rating: apiTeacher.averageRating ?? 0,
    reviewCount: apiTeacher.reviewCount,
    pricePerSession: apiTeacher.pricePerSession ?? 0,
    specialties,
    languages: [], // Languages not included in API response for now
    avatarUrl: avatarUrl,
    location: {
      latitude: apiTeacher.primaryBase.latitude,
      longitude: apiTeacher.primaryBase.longitude,
      neighborhood: apiTeacher.primaryBase.neighborhood || '',
      city: apiTeacher.primaryBase.city || '',
    },
    availability: [], // Availability not included in API response for now
  }
}

