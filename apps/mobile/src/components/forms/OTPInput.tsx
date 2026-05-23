import React, { useMemo, useRef, useState } from 'react'
import { TextInput, View, Text, Platform } from 'react-native'

type OTPInputProps = {
  value: string
  onChange: (code: string) => void
  length?: number
  error?: string | null
  autoFocus?: boolean
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  error,
  autoFocus,
}: OTPInputProps) {
  const inputRef = useRef<TextInput | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const cleaned = useMemo(
    () => (value || '').replace(/\D/g, '').slice(0, length),
    [value, length]
  )
  const chars = useMemo(() => cleaned.split(''), [cleaned])

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, length)
    onChange(next)
  }

  return (
    <View className='relative'>
      {/* Visible boxes (no hit testing) */}
      <View className='flex-row justify-between gap-2' pointerEvents='none'>
        {Array.from({ length }).map((_, i) => {
          const filled = Boolean(chars[i])
          const isCaretSlot =
            isFocused && i === cleaned.length && cleaned.length < length
          return (
            <View
              key={i}
              className={[
                'h-12 w-12 items-center justify-center rounded-2xl border',
                'border-neutral-300 bg-white',
                'dark:border-neutral-700 dark:bg-neutral-900',
                error ? 'border-red-500 dark:border-red-500' : '',
                isCaretSlot ? 'border-black/70 dark:border-white/80' : '',
              ].join(' ')}
            >
              <Text className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
                {filled ? chars[i] : '•'}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Real input overlay (captures tap/long-press for typing/paste) */}
      <TextInput
        ref={inputRef}
        value={cleaned}
        onChangeText={handleChange}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        textContentType='oneTimeCode'
        autoCapitalize='none'
        autoCorrect={false}
        importantForAutofill='yes'
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden={false}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // must fully cover boxes + be on top + receive touches
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          // keep a tiny opacity so platforms that ignore fully transparent
          // inputs still allow the context menu & focus
          opacity: 0.02,
          // ensure it receives touches
          pointerEvents: 'auto' as any,
        }}
        // Accessibility
        accessible
        accessibilityLabel='Enter verification code'
      />

      {error ? (
        <Text className='mt-2 text-sm text-red-600 dark:text-red-400'>
          {error}
        </Text>
      ) : null}
    </View>
  )
}
