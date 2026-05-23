import React from 'react'
import { Text, View } from 'react-native'

type ErrorMessageProps = {
  title: string
  message?: string
  variant?: 'error' | 'warning'
  position?: 'top' | 'bottom'
}

export default function ErrorMessage({
  title,
  message,
  variant = 'error',
  position = 'bottom',
}: ErrorMessageProps) {
  const isError = variant === 'error'
  const containerClass = position === 'top' ? 'top-4' : 'bottom-32'

  return (
    <View
      className={`pointer-events-none absolute left-0 right-0 ${containerClass} z-30 items-center px-8`}
    >
      <View
        className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-sm ${
          isError
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            isError ? 'text-red-800' : 'text-amber-800'
          }`}
        >
          {title}
        </Text>
        {message && (
          <Text
            className={`mt-1 text-xs ${
              isError ? 'text-red-600' : 'text-amber-600'
            }`}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  )
}

