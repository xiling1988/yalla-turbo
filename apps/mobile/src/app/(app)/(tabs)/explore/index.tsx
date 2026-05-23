import React, { useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps'

import {
  FALLBACK_REGION,
  ensureForegroundLocationPermission,
  getInitialRegion,
  type PermissionStatus,
} from '@/lib/location'
import { useTeachers } from '@/hooks/useTeachers'
import { type TeacherProfile } from '@/types/teachers'
import { isWithinRadius } from '@/lib/utils/location'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ErrorMessage from '@/components/ui/ErrorMessage'
import EmptyState from '@/components/ui/EmptyState'
import TeacherPreview from '@/components/explore/TeacherPreview'
import RadiusControl from '@/components/explore/RadiusControl'
import RadiusPill from '@/components/explore/RadiusPill'
import TeacherMarker from '@/components/explore/TeacherMarker'

const MIN_RADIUS_KM = 5
const MAX_RADIUS_KM = 100
const DEFAULT_RADIUS_KM = 50

export default function ExploreScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null)
  const [mapRegion, setMapRegion] = useState<Region | null>(null)
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined')
  const [isLoadingRegion, setIsLoadingRegion] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(
    null
  )
  const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM)
  const [showRadiusControl, setShowRadiusControl] = useState(false)

  const {
    data: teachers = [],
    isLoading: isLoadingTeachers,
    error: teachersError,
  } = useTeachers()

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoadingRegion(true)
      try {
        const permission = await ensureForegroundLocationPermission()
        if (!isMounted) return
        setPermissionStatus(permission.status)

        const region = await getInitialRegion()
        if (!isMounted) return

        setInitialRegion(region)
        setMapRegion(region)
      } catch (error) {
        console.warn('Failed to load location. Using fallback region.', error)
        if (!isMounted) return
        setInitialRegion(FALLBACK_REGION)
        setMapRegion(FALLBACK_REGION)
      } finally {
        if (isMounted) {
          setIsLoadingRegion(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  // console.log(teachers)

  const searchRadiusMeters = searchRadiusKm * 1000

  const teachersWithinRadius = useMemo(() => {
    if (!mapRegion) return teachers

    return teachers.filter((teacher) =>
      isWithinRadius(
        mapRegion,
        teacher.location.latitude,
        teacher.location.longitude,
        searchRadiusMeters
      )
    )
  }, [mapRegion, teachers, searchRadiusMeters])

  const permissionDenied =
    permissionStatus === 'denied' || permissionStatus === 'unavailable'

  return (
    <SafeAreaView edges={['top']} className='flex flex-1 bg-white'>
      <View className='flex-1'>
        {(isLoadingRegion || isLoadingTeachers) && (
          <LoadingOverlay
            message={
              isLoadingRegion
                ? 'Locating nearby teachers...'
                : 'Loading teachers...'
            }
          />
        )}

        {teachersError && (
          <ErrorMessage
            title='Failed to load teachers'
            message={
              teachersError instanceof Error
                ? teachersError.message
                : 'Unknown error'
            }
            variant='error'
          />
        )}

        {initialRegion ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            region={mapRegion ?? initialRegion}
            onRegionChangeComplete={setMapRegion}
            showsUserLocation={permissionStatus === 'granted'}
            showsMyLocationButton
          >
            {mapRegion && (
              <Circle
                key='radius'
                center={mapRegion}
                radius={searchRadiusMeters}
                strokeColor='rgba(62, 143, 111, 0.4)'
                fillColor='rgba(62, 143, 111, 0.12)'
              />
            )}

            {teachersWithinRadius.map((teacher) => (
              <Marker
                key={teacher.id}
                coordinate={{
                  latitude: teacher.location.latitude,
                  longitude: teacher.location.longitude,
                }}
                onPress={() => setSelectedTeacher(teacher)}
                tracksViewChanges={false}
              >
                <TeacherMarker />
              </Marker>
            ))}
          </MapView>
        ) : null}

        <RadiusPill
          radiusKm={searchRadiusKm}
          permissionDenied={permissionDenied}
          onPress={() => {
            console.log('Pill pressed, current state:', showRadiusControl)
            setSelectedTeacher(null) // Close teacher preview if open
            setShowRadiusControl((prev) => {
              const newValue = !prev
              console.log('Setting showRadiusControl to:', newValue)
              return newValue
            })
          }}
        />

        {showRadiusControl && (
          <>
            {/* Backdrop - receives touches outside control, closes on press */}
            <TouchableOpacity
              className='absolute inset-0 bg-black/20'
              style={{ zIndex: 40 }}
              activeOpacity={1}
              onPress={() => {
                console.log('Backdrop pressed - closing control')
                setShowRadiusControl(false)
              }}
            />
            {/* Control - higher z-index, blocks backdrop touches inside it */}
            <RadiusControl
              radiusKm={searchRadiusKm}
              minRadiusKm={MIN_RADIUS_KM}
              maxRadiusKm={MAX_RADIUS_KM}
              onRadiusChange={(newRadius) => {
                console.log('Radius changed to:', newRadius)
                setSearchRadiusKm(newRadius)
                // Don't close the control when radius changes
              }}
              onClose={() => {
                console.log('Close button pressed')
                setShowRadiusControl(false)
              }}
            />
          </>
        )}

        {!isLoadingRegion &&
          initialRegion &&
          teachersWithinRadius.length === 0 && (
            <EmptyState
              title='No teachers in this area yet.'
              message='Try moving the map or expanding your search radius.'
            />
          )}

        {selectedTeacher && (
          <TeacherPreview
            teacher={selectedTeacher}
            onClose={() => setSelectedTeacher(null)}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
