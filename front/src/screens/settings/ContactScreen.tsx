// Externí knihovny
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';



const ContactScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const sanitize = (text: string) => {
    return text.replace(/[<>]/g, '').trim();
  };

  const handleSend = () => {
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanMessage = sanitize(message);

    if (!cleanName) {
      Alert.alert('Neplatné jméno', 'Zadej své jméno.');
      return;
    }

    if (!cleanEmail) {
      Alert.alert('E-mail chybí', 'Zadej svůj e-mail.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      Alert.alert('Neplatný e-mail', 'Zadej platný e-mail ve správném formátu.');
      return;
    }

    if (!cleanMessage || cleanMessage.length < 1) {
      Alert.alert('Zpráva chybí', 'Zadej alespoň pár slov.');
      return;
    }

    Alert.alert('Odesláno', 'Váš e-mail byl odeslán.');

    // Reset formuláře
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.icon}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <Text style={styles.title}>Kontaktní formulář</Text>
        <Text style={styles.subtitle}>Máš dotaz, zpětnou vazbu nebo problém? Napiš nám!</Text>

        <TextInput
          style={styles.input}
          placeholder="Tvé jméno"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Tvůj e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Zpráva"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSend}>
          <Text style={styles.buttonText}>Odeslat zprávu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#5C55E1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactScreen;
