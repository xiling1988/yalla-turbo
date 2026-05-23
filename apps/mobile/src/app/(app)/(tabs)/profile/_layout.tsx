import { Stack } from 'expo-router'
import React from 'react'

function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName='index' />
  )
}

export default Layout
