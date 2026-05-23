import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps'
import * as Location from 'expo-location'
import {
  FALLBACK_REGION,
  getInitialRegion,
  type PermissionStatus,
} from '@/lib/location'

type MapLocationPickerProps = {
  initialLatitude?: number | null
  initialLongitude?: number | null
  onLocationSelect: (latitude: number, longitude: number) => void
  height?: number
}

export default function MapLocationPicker({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  height = 300,
}: MapLocationPickerProps) {
  const [mapRegion, setMapRegion] = useState<Region | null>(null)
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(
    initialLatitude ?? null
  )
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(
    initialLongitude ?? null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined')

  useEffect(() => {
    let isMounted = true

    const loadInitialRegion = async () => {
      setIsLoading(true)
      try {
        // Check location permission
        const { status } = await Location.getForegroundPermissionsAsync()
        setPermissionStatus(
          status === Location.PermissionStatus.GRANTED
            ? 'granted'
            : status === Location.PermissionStatus.DENIED
              ? 'denied'
              : 'undetermined'
        )

        // If we have initial coordinates, use them
        if (initialLatitude && initialLongitude) {
          const region: Region = {
            latitude: initialLatitude,
            longitude: initialLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
          if (isMounted) {
            setMapRegion(region)
            setSelectedLatitude(initialLatitude)
            setSelectedLongitude(initialLongitude)
          }
        } else {
          // Otherwise, try to get user's current location or use fallback
          const region = await getInitialRegion()
          if (isMounted) {
            setMapRegion(region)
            // If we got user's location, set it as selected
            if (region !== FALLBACK_REGION) {
              setSelectedLatitude(region.latitude)
              setSelectedLongitude(region.longitude)
              onLocationSelect(region.latitude, region.longitude)
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load location', error)
        if (isMounted) {
          setMapRegion(FALLBACK_REGION)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialRegion()

    return () => {
      isMounted = false
    }
  }, [initialLatitude, initialLongitude, onLocationSelect])

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent?.coordinate
    if (coordinate) {
      const { latitude, longitude } = coordinate
      setSelectedLatitude(latitude)
      setSelectedLongitude(longitude)
      onLocationSelect(latitude, longitude)
    }
  }

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    setSelectedLatitude(latitude)
    setSelectedLongitude(longitude)
    onLocationSelect(latitude, longitude)
  }

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== Location.PermissionStatus.GRANTED) {
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const region: Region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }

      setMapRegion(region)
      setSelectedLatitude(position.coords.latitude)
      setSelectedLongitude(position.coords.longitude)
      onLocationSelect(position.coords.latitude, position.coords.longitude)
    } catch (error) {
      console.warn('Failed to get current location', error)
    }
  }

  if (isLoading || !mapRegion) {
    return (
      <View
        style={[styles.container, { height }]}
        className='items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800'
      >
        <ActivityIndicator size='large' />
        <Text className='mt-2 text-sm text-neutral-500'>
          Loading map...
        </Text>
      </View>
    )
  }

  return (
    <View className='space-y-3'>
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={mapRegion}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={permissionStatus === 'granted'}
          showsMyLocationButton={false}
          mapType='standard'
        >
          {selectedLatitude !== null && selectedLongitude !== null && (
            <Marker
              coordinate={{
                latitude: selectedLatitude,
                longitude: selectedLongitude,
              }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              tracksViewChanges={false}
            >
              <View className='items-center'>
                <View className='rounded-full border-2 border-white bg-emerald-600 p-1 shadow-lg'>
                  <View className='h-3 w-3 rounded-full bg-white' />
                </View>
                <View className='mt-1 h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-600' />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View className='flex-row items-center justify-between'>
        <View className='flex-1'>
          {selectedLatitude !== null && selectedLongitude !== null ? (
            <View>
              <Text className='text-xs text-neutral-500 dark:text-neutral-400'>
                Selected location
              </Text>
              <Text className='text-sm font-mono text-neutral-700 dark:text-neutral-200'>
                {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text className='text-sm text-neutral-500 dark:text-neutral-400'>
              Tap on the map or drag the pin to select location
            </Text>
          )}
        </View>

        {permissionStatus === 'granted' && (
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            className='rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800'
          >
            <Text className='text-sm font-medium text-neutral-700 dark:text-neutral-200'>
              Use Current
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})

