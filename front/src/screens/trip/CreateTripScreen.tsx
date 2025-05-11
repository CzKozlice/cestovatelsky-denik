// React & React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';

// Komponenty a knihovny
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import axios from 'axios';

// Ukládání & navigace
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Vlastní hooky a komponenty
import useCountries from '@/hooks/useCountries';
import CountryPickerModal from '@/components/ui/CountryPickerModal';

// Ikony & konfigurace
import { Feather } from '@expo/vector-icons';
import { API_URL } from '@/constants/config';


export default function CreateTripScreen() {
  const navigation = useNavigation();
  const { countries } = useCountries();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isCountryModalVisible, setCountryModalVisible] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !startDate || !endDate || selectedCountries.length === 0) {
      alert('Vyplň všechna pole.');
      return;
    }

    if (!name.trim() || name.length > 150) {
      alert('Název musí mít max 150 znaků.');
      return false;
    }

    if (moment(endDate).isBefore(moment(startDate), 'day')) {
      alert('Datum konce musí být větší než datum začátku.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/auth/trips`, {
        name,
        startDate,
        endDate,
        location: '',
        description: '',
        countryIds: selectedCountries,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigation.navigate('Dashboard');
    } catch (error) {
      console.error(error);
      alert('Chyba při vytváření výletu.');
    }
  };

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#5C55E1" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Vytvořit nový výlet</Text>

          <TextInput
            style={styles.input}
            placeholder="Název výletu"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateCard} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateLabel}>Datum začátku</Text>
              <Feather name="calendar" size={20} color="#555" />
              <Text style={styles.dateText}>
                {startDate ? moment(startDate).format('DD.MM.YYYY') : 'Vyber datum'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateCard} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateLabel}>Datum konce</Text>
              <Feather name="calendar" size={20} color="#555" />
              <Text style={styles.dateText}>
                {endDate ? moment(endDate).format('DD.MM.YYYY') : 'Vyber datum'}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              locale="cs-CZ"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              locale="cs-CZ"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.input} onPress={() => setCountryModalVisible(true)}>
            <Text>{selectedCountries.length > 0 ? `${selectedCountries.length} zemí vybráno` : 'Vybrat plánované země'}</Text>
          </TouchableOpacity>

          <CountryPickerModal
            visible={isCountryModalVisible}
            onClose={() => setCountryModalVisible(false)}
            countries={countries}
            selected={selectedCountries}
            toggleCountry={toggleCountry}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#81d4fa' }]} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Zrušit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#7e57c2' }]} onPress={handleCreate}>
              <Text style={styles.buttonText}>Vytvořit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 75,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateCard: {
    flex: 0.48,
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 0.48,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
