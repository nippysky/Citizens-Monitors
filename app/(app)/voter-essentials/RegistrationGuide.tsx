import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function RegistrationGuide() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Guide</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})
