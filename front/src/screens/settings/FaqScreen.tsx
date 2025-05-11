// React a React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Navigace a bezpečné zóny
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ikony
import { Feather } from '@expo/vector-icons';



const faqData = [
    {
        question: 'Jak si vytvořím nový výlet?',
        answer: 'Na hlavní obrazovce klikni na modré plusko a postupuj podle instrukcí.',
      },
      {
        question: 'Jak mohu přidat účastníky?',
        answer: 'V detailu výletu najdeš možnost pozvat uživatele pomocí jejich e-mailu.',
      },
      {
        question: 'Kde najdu uložené výlety?',
        answer: 'Základní přehled výletů najdeš na Hlavní obrazovce. Celkový přehled lze zobrazit stisknutím tlačítka Cestovatelský deník, které lze najít i na obrazovce Profilu.',
      },
      {
        question: 'Jak změním své osobní údaje?',
        answer: 'Přímo v Profilu nebo na stránce Nastavení v sekci Osobní údaje.',
      },
      {
        question: 'Jak změním profilovou fotku?',
        answer: 'Jdi do sekce Profil, klikni na upravit profil vpravo nahoře a vyber novou fotku z galerie nebo ji rovnou vyfoť.',
      },
];

const FaqScreen = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <Text style={styles.title}>Často kladené otázky</Text>

        {faqData.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.questionRow}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Feather
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#5C55E1"
              />
            </TouchableOpacity>
            {expandedIndex === index && <Text style={styles.answerText}>{item.answer}</Text>}
          </View>
        ))}
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
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    color: '#333',
  },
  faqItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C55E1',
    flex: 1,
  },
  answerText: {
    marginTop: 10,
    fontSize: 15,
    color: '#444',
  },
});

export default FaqScreen;
