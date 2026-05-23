import * as SecureStore from 'expo-secure-store'
import { TokenCache } from '@clerk/clerk-expo'

// Custom tokenCache implementation using expo-secure-store
// Matches Clerk's default implementation but with logging
const createTokenCache = (): TokenCache => {
  console.log('[TokenCache] Creating custom tokenCache instance')

  // Use the same options as Clerk's default tokenCache
  const secureStoreOpts = {
    /**
     * The data in the keychain item cannot be accessed after a restart until the
     * device has been unlocked once by the user.
     * This matches Clerk's default behavior.
     */
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  }

  return {
    async getToken(key: string): Promise<string | null | undefined> {
      console.log('[TokenCache] ⬇️ getToken called for key:', key)
      try {
        const item = await SecureStore.getItemAsync(key, secureStoreOpts)
        console.log(
          '[TokenCache] ✅ getToken result - found:',
          !!item,
          'key:',
          key
        )
        if (item) {
          console.log('[TokenCache] Token length:', item.length)
        }
        return item
      } catch (error) {
        console.error(
          '[TokenCache] ❌ Error getting token, deleting it:',
          error
        )
        // Match Clerk's behavior: if getToken fails, delete the item
        await SecureStore.deleteItemAsync(key, secureStoreOpts)
        return null
      }
    },
    async saveToken(key: string, value: string): Promise<void> {
      console.log(
        '[TokenCache] ⬆️ saveToken called for key:',
        key,
        'token length:',
        value.length
      )
      try {
        await SecureStore.setItemAsync(key, value, secureStoreOpts)
        console.log('[TokenCache] ✅ Token saved successfully for key:', key)
      } catch (error) {
        console.error('[TokenCache] ❌ Error saving token:', error)
        throw error
      }
    },
    clearToken(key: string): void {
      console.log('[TokenCache] 🗑️ clearToken called for key:', key)
      // clearToken is optional and synchronous, but SecureStore is async
      // So we'll do it async in the background
      SecureStore.deleteItemAsync(key, secureStoreOpts)
        .then(() => {
          console.log('[TokenCache] ✅ Token cleared for key:', key)
        })
        .catch((error) => {
          console.error('[TokenCache] ❌ Error clearing token:', error)
        })
    },
  }
}

export const tokenCache = createTokenCache()
console.log('[TokenCache] tokenCache instance exported:', !!tokenCache)
