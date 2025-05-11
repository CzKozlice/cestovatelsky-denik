// React a React Native
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

// Navigace a bezpečné zóny
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ikony
import { Feather } from '@expo/vector-icons';



const UsefulLinksScreen = () => {
  const navigation = useNavigation();

  const categories = [
    {
      title: 'Plánování cesty',
      links: [
        { label: 'Booking.com – ubytování', url: 'https://www.booking.com/' },
        { label: 'Airbnb – alternativní ubytování', url: 'https://www.airbnb.com/' },
        { label: 'Google Flights – srovnávač letů', url: 'https://www.google.com/flights' },
        { label: 'Skyscanner – porovnání cen letenek, hotelů, aut', url: 'https://www.skyscanner.net/' },
        { label: 'Kiwi.com – levné kombinace dopravy', url: 'https://www.kiwi.com/' },
        { label: 'Cestujlevne.com – tipy na levné cestování', url: 'https://www.cestujlevne.com/' },
      ],
    },
    {
      title: 'Mapy a navigace',
      links: [
        { label: 'Google Maps – klasika', url: 'https://maps.google.com/' },
        { label: 'Mapy.cz – offline turistické mapy', url: 'https://mapy.cz/' },
        { label: 'OsmAnd – offline mapy', url: 'https://osmand.net/' },
        { label: 'DronView – kontrola dron zón v ČR', url: 'https://dronview.rlp.cz/' },
      ],
    },
    {
      title: 'Překladače a komunikace',
      links: [
        { label: 'Google Translate – překlady v reálném čase', url: 'https://translate.google.com/' },
        { label: 'DeepL – kvalitní překlady', url: 'https://www.deepl.com/translator' },
      ],
    },
    {
      title: 'Počasí a příroda',
      links: [
        { label: 'Windy – podrobná předpověď', url: 'https://www.windy.com/' },
        { label: 'Meteoblue – počasí s UV a výškou', url: 'https://www.meteoblue.com/' },
      ],
    },
    {
      title: 'Bezpečnost a info o zemích',
      links: [
        { label: 'Drozd – registrace u MZV ČR', url: 'https://drozd.mzv.gov.cz/' },
      ],
    },
    {
      title: 'Finance a měny',
      links: [
        { label: 'Revolut – směna měn a karta', url: 'https://www.revolut.com/' },
        { label: 'Wise – převody a cestovní účet', url: 'https://wise.com/' },
        { label: 'XE.com – směnné kurzy', url: 'https://www.xe.com/' },
      ],
    },
  ];

  const openLink = (url) => Linking.openURL(url);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <Text style={styles.title}>Užitečné odkazy</Text>
        <Text style={styles.subtitle}>
          Webové stránky, které se ti mohou hodit během cestování.
        </Text>

        {categories.map((cat, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{cat.title}</Text>
            {cat.links.map((link, linkIdx) => {
              const [name, ...desc] = link.label.split(' – ');
              return (
                <Text key={linkIdx} style={styles.linkRow}>
                  <Text style={styles.linkLabel} onPress={() => openLink(link.url)}>{name}</Text>
                  {desc.length > 0 ? <Text style={styles.linkDescription}> – {desc.join(' – ')}</Text> : null}
                </Text>
              );
            })}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5C55E1',
    marginBottom: 10,
  },
  linkRow: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 5,
  },
  linkLabel: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#444',
  },
  linkDescription: {
    color: '#444',
  },
});

export default UsefulLinksScreen;
