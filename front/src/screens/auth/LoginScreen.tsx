// React a React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';

// Externí knihovny
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Konstanty
import { API_URL, APP_SECRET, APP_VERSION } from '@/constants/config';

// Kontexty
import { useProfile } from '@/context/ProfileContext';



const LoginScreen = () => {
  const navigation = useNavigation();
  const { refetch } = useProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-secret': APP_SECRET,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await refetch();
      } else {
        Alert.alert('Chyba', data.error || 'Chyba při přihlášení.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Chyba', 'Něco se pokazilo.');
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Heslo"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Přihlásit se</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Nemáte účet? Zaregistrujte se!</Text>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.buttonText}>Zaregistrovat se</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>v{APP_VERSION} | © Kunčíková Adéla</Text>
              </View>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: '#5C55E1',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  registerButton: {
    marginTop: 12,
    backgroundColor: '#7BBBFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  footer: {
    marginTop: 80,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default LoginScreen;