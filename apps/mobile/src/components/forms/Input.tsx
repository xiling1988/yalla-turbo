import * as React from 'react'
import { TextInput, TextInputProps, View } from 'react-native'

type Props = TextInputProps & {
  className?: string
}

const Input = React.memo(
  React.forwardRef<TextInput, Props>(function Input(
    {
      value,
      className,
      autoCapitalize = 'none',
      autoCorrect = false,
      placeholderTextColor = '#9CA3AF',
      ...rest
    },
    ref
  ) {
    return (
      <View className='w-full'>
        <TextInput
          ref={ref}
          value={value ?? ''} // ✅ guard against undefined
          autoCapitalize={autoCapitalize} // ✅ pass through
          autoCorrect={autoCorrect} // ✅ default false for email/password
          placeholderTextColor={placeholderTextColor}
          className={
            'h-12 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 ' +
            'placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 ' +
            (className ?? '')
          }
          {...rest}
        />
      </View>
    )
  })
)

export default Input
