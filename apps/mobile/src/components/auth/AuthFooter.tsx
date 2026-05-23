import React from 'react'
import { Text } from 'react-native'

type AuthFooterProps = {
  helpText?: string
}

export default function AuthFooter({
  helpText = 'By continuing you agree to our Terms and Privacy Policy.',
}: AuthFooterProps) {
  // If helpText doesn't contain "Terms", use it as-is, otherwise parse it
  if (!helpText.includes('Terms')) {
    return <Text className='text-center text-xs text-neutral-400'>{helpText}</Text>
  }

  const parts = helpText.split('Terms')
  const beforeTerms = parts[0]

  return (
    <Text className='text-center text-xs text-neutral-400'>
      {beforeTerms}
      <Text className='underline'>Terms</Text> and{' '}
      <Text className='underline'>Privacy Policy</Text>.
    </Text>
  )
}

