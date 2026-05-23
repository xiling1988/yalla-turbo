import * as SecureStore from 'expo-secure-store'

// IStorage interface for Clerk's resourceCache
interface IStorage {
  set: (key: string, value: string) => Promise<void>
  get: (key: string) => Promise<string | null>
}

// Create a SecureStore-based storage implementation for Clerk's resourceCache
// This is what actually stores/restores sessions (client data, session JWT, etc.)
const createSecureStorage = (): IStorage => {
  console.log('[ResourceCache] 🎯 createSecureStorage() called - creating new IStorage instance')
  
  return {
    async set(key: string, value: string): Promise<void> {
      try {
        console.log('[ResourceCache] ⬆️ Saving resource - key:', key, 'length:', value.length)
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        })
        console.log('[ResourceCache] ✅ Resource saved:', key)
      } catch (error) {
        console.error('[ResourceCache] ❌ Error saving resource:', key, error)
        throw error
      }
    },
    async get(key: string): Promise<string | null> {
      try {
        console.log('[ResourceCache] ⬇️ Getting resource - key:', key)
        const value = await SecureStore.getItemAsync(key, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        })
        console.log('[ResourceCache] ✅ Resource get - found:', !!value, 'key:', key)
        if (value) {
          console.log('[ResourceCache] Resource length:', value.length)
        }
        return value
      } catch (error) {
        console.error('[ResourceCache] ❌ Error getting resource:', key, error)
        return null
      }
    },
  }
}

// This function is passed to ClerkProvider as __experimental_resourceCache
// Clerk will call this function multiple times (once per resource cache type)
// to get IStorage instances for ClientResourceCache, SessionJWTCache, and EnvironmentResourceCache
export const createResourceCache = (): IStorage => {
  console.log('[ResourceCache] 📦 createResourceCache() function called by Clerk')
  const storage = createSecureStorage()
  console.log('[ResourceCache] ✅ Returning IStorage instance:', !!storage, 'has get:', typeof storage.get === 'function', 'has set:', typeof storage.set === 'function')
  return storage
}
