// Externí knihovny
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Vlastní konfigurace
import { APP_VERSION } from '@/constants/config';



const AboutAppScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <Text style={styles.title}>O aplikaci</Text>
        <Text style={styles.version}>Aktuální verze aplikace: {APP_VERSION}</Text>

        <Text style={styles.paragraph}>
          Tato mobilní aplikace vznikla jako praktická část bakalářské práce na Vysoké škole ekonomické v Praze.
        </Text>

        <Text style={styles.paragraph}>
          Autorkou aplikace je Adéla Kunčíková, studentka oboru Aplikovaná informatika. Aplikace slouží jako osobní cestovatelský deník, který usnadňuje plánování, zaznamenávání a sdílení zážitků z výletů s přáteli.
        </Text>

        <Text style={styles.paragraph}>
          Cílem bylo vytvořit intuitivní a přehledné rozhraní, které umožní uživatelům spravovat výlety, poznámky, fotografie i checklisty s důrazem na jednoduchost a použitelnost.
        </Text>

        <Text style={styles.footer}>Cestovatelský deník – tvůj společník na každém kroku! 💙</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  version: {
    fontSize: 16,
    textAlign: 'center',
    color: '#667',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    color: '#5C55E1',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AboutAppScreen;