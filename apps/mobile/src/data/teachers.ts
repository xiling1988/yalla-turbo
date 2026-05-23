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

export const mockTeachers: TeacherProfile[] = [
  {
    id: 't-chiara-1',
    fullName: 'Chiara Bennett',
    shortBio:
      'Grounded Vinyasa flows that blend mindful breathwork with upbeat playlists.',
    yearsExperience: 6,
    rating: 4.9,
    reviewCount: 128,
    pricePerSession: 45,
    specialties: ['Vinyasa', 'Restorative'],
    languages: ['English', 'Italian'],
    avatarUrl:
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=facearea&w=256&h=256&q=80',
    location: {
      latitude: 25.2048,
      longitude: 55.2708,
      neighborhood: 'Downtown',
      city: 'Dubai',
    },
    availability: [
      { day: 'Tuesday', startTime: '07:00', endTime: '10:00' },
      { day: 'Thursday', startTime: '18:00', endTime: '21:00' },
    ],
  },
  {
    id: 't-yusuf-1',
    fullName: 'Yusuf Al-Sayed',
    shortBio:
      'Dynamic Ashtanga primary series with a focus on alignment and strength.',
    yearsExperience: 9,
    rating: 4.8,
    reviewCount: 96,
    pricePerSession: 55,
    specialties: ['Ashtanga', 'Vinyasa'],
    languages: ['English', 'Arabic'],
    avatarUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=256&h=256&q=80',
    location: {
      latitude: 25.212,
      longitude: 55.277,
      neighborhood: 'Dubai Marina',
      city: 'Dubai',
    },
    availability: [
      { day: 'Monday', startTime: '06:30', endTime: '09:30' },
      { day: 'Wednesday', startTime: '19:00', endTime: '21:00' },
    ],
  },
  {
    id: 't-lina-1',
    fullName: 'Lina Haddad',
    shortBio:
      'Slow, intentional Yin practices perfect for unwinding after long days.',
    yearsExperience: 4,
    rating: 4.7,
    reviewCount: 72,
    pricePerSession: 40,
    specialties: ['Yin', 'Restorative'],
    languages: ['English', 'French'],
    avatarUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=256&h=256&q=80',
    location: {
      latitude: 25.1806,
      longitude: 55.2462,
      neighborhood: 'Jumeirah',
      city: 'Dubai',
    },
    availability: [
      { day: 'Wednesday', startTime: '17:00', endTime: '20:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
    ],
  },
  {
    id: 't-rahul-1',
    fullName: 'Rahul Mehta',
    shortBio: 'Strength-building power flows tailored for intermediate levels.',
    yearsExperience: 7,
    rating: 4.9,
    reviewCount: 84,
    pricePerSession: 50,
    specialties: ['Vinyasa', 'Ashtanga'],
    languages: ['English', 'Hindi'],
    avatarUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=facearea&w=256&h=256&q=80',
    location: {
      latitude: 25.0953,
      longitude: 55.1626,
      neighborhood: 'Dubai Media City',
      city: 'Dubai',
    },
    availability: [
      { day: 'Tuesday', startTime: '19:00', endTime: '21:00' },
      { day: 'Friday', startTime: '09:00', endTime: '11:00' },
    ],
  },
  {
    id: 't-samira-1',
    fullName: 'Samira Qureshi',
    shortBio:
      'Gentle prenatal classes focusing on stability, breath and relaxation.',
    yearsExperience: 5,
    rating: 4.6,
    reviewCount: 62,
    pricePerSession: 60,
    specialties: ['Prenatal', 'Restorative'],
    languages: ['English', 'Urdu'],
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=256&h=256&q=80',
    location: {
      latitude: 25.2285,
      longitude: 55.3273,
      neighborhood: 'Palm Jumeirah',
      city: 'Dubai',
    },
    availability: [
      { day: 'Thursday', startTime: '08:00', endTime: '11:00' },
      { day: 'Saturday', startTime: '15:00', endTime: '18:00' },
    ],
  },
]

