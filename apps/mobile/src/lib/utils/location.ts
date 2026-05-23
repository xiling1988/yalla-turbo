import { Region } from 'react-native-maps'

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6_371_000
  const dLat = degreesToRadians(lat2 - lat1)
  const dLon = degreesToRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

export function isWithinRadius(
  region: Region,
  latitude: number,
  longitude: number,
  radiusMeters: number
): boolean {
  const distance = getDistanceInMeters(
    region.latitude,
    region.longitude,
    latitude,
    longitude
  )
  return distance <= radiusMeters
}

