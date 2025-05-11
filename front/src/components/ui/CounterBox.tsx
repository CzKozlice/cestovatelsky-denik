import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface CounterBoxProps {
  number: number
  label: string
  backgroundColor: string
}

const CounterBox: React.FC<CounterBoxProps> = ({ number, label, backgroundColor }) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 5,
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
})

export default CounterBox
