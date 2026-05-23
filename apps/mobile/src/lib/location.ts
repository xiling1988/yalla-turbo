import * as Location from 'expo-location'
import type { Region } from 'react-native-maps'

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unavailable'

export const FALLBACK_REGION: Region = {
  latitude: 25.1972,
  longitude: 55.2744,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
}

type EnsurePermissionResult = {
  status: PermissionStatus
  canAskAgain: boolean
}

export async function ensureForegroundLocationPermission(): Promise<EnsurePermissionResult> {
  const { status, canAskAgain } =
    await Location.requestForegroundPermissionsAsync()

  return {
    status: mapPermissionStatus(status),
    canAskAgain,
  }
}

export async function getInitialRegion(): Promise<Region> {
  const { status } = await Location.getForegroundPermissionsAsync()

  if (status !== Location.PermissionStatus.GRANTED) {
    return FALLBACK_REGION
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }
}

function mapPermissionStatus(status: Location.PermissionStatus): PermissionStatus {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return 'granted'
    case Location.PermissionStatus.DENIED:
      return 'denied'
    case Location.PermissionStatus.UNDETERMINED:
      return 'undetermined'
    default:
      return 'unavailable'
  }
}

