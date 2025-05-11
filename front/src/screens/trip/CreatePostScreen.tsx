// React a React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';

// Navigace a bezpečné oblasti
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Utility a knihovny
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';

// Ikony
import { Feather } from '@expo/vector-icons';

// Konfigurace
import { API_URL } from '@/constants/config';



const CreatePostScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const tripId = route.params?.tripId;
  const initialType = route.params?.type || 'TEXT';
  const [type, setType] = useState(initialType);


  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [date, setDate] = useState<Date | null>(new Date());
  const [showDatePicker, setDatePicker] = useState(false);

  const [showTimePicker, setTimePicker] = useState(false);

  const [loadingLocation, setLoadingLocation] = useState(false);

  const buttonLabels: Record<string, string> = {
    TEXT: 'Přidat příspěvek',
    IMAGE: 'Přidat obrázek',
    LOCATION: 'Přidat lokaci',
  };


const pickImageFromLibrary = async () => {
  if (images.length >= 10) {
    Alert.alert('Limit obrázků', 'Můžeš nahrát maximálně 10 obrázků.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.7,
    selectionLimit: 10 - images.length,
  });

  if (!result.canceled) {
    const uris = result.assets.map(asset => asset.uri);
    const newImages = [...images, ...uris];

    if (newImages.length > 10) {
      Alert.alert('Limit obrázků', 'Přesáhl jsi maximální počet 10 obrázků. Některé nebyly přidány.');
    }

    setImages(newImages.slice(0, 10));
  }
};


const takePhoto = async () => {
  if (images.length >= 10) {
    Alert.alert('Limit obrázků', 'Můžeš nahrát maximálně 10 obrázků.');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled && result.assets.length > 0) {
    setImages(prev => {
      const updated = [...prev, result.assets[0].uri];
      if (updated.length > 10) {
        Alert.alert('Limit obrázků', 'Překročil jsi maximální počet 10 obrázků. Poslední nebyl přidán.');
      }
      return updated.slice(0, 10);
    });
  }
};


const handleDetectLocation = async () => {
  setLoadingLocation(true);
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Chyba', 'Přístup k poloze byl odepřen.');
      return;
    }

    const coords = await Location.getCurrentPositionAsync({});
    const [addr] = await Location.reverseGeocodeAsync({
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
    });

    if (addr && addr.formattedAddress) {
      setLocation(addr.formattedAddress);
    } else {
      Alert.alert('Chyba', 'Nepodařilo se načíst adresu.');
    }
  } catch (err) {
    console.error('Chyba při získávání polohy:', err);
    Alert.alert('Chyba', 'Nepodařilo se načíst polohu.');
  } finally {
    setLoadingLocation(false);
  }
};
  

  const handleCreate = async () => {
    if (type === 'TEXT' && !content.trim()) {
      Alert.alert('Chyba', 'Poznámka nesmí být prázdná.');
      return;
    }
    if (type === 'LOCATION' && !location.trim()) {
      Alert.alert('Chyba', 'Zadej lokaci nebo ji načti pomocí GPS.');
      return;
    }

  if (type === 'IMAGE' && images.length === 0) {
    Alert.alert('Chyba', 'Přidej alespoň jeden obrázek.');
    return;
  }


    const token = await AsyncStorage.getItem('token');
    try {
      let uploadedUrls = [];
      if (type === 'IMAGE' && images.length > 0) {
        const formData = new FormData();
        formData.append('type', 'post');
        formData.append('tripId', tripId);
        formData.append('date', date?.toISOString() || new Date().toISOString());
        images.forEach((uri, index) => {
          const name = uri.split('/').pop() || `image${index}.jpg`;
          const ext = name.split('.').pop();
          formData.append('files', {
            uri, name, type: `image/${ext}`,
          } as any);
        });
        const uploadRes = await fetch(`${API_URL}/auth/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Chyba při nahrávání obrázků');
        const data = await uploadRes.json();
        uploadedUrls = data.posts.map((post: any) => post.imageUrl);
      }

      if (type !== 'IMAGE') {
        const res = await fetch(`${API_URL}/auth/trips/${tripId}/posts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            content,
            location,
            date: date ? date.toISOString() : undefined,
          }),
        });
      
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Chyba při vytváření příspěvku');
        }
      }

      Alert.alert('Příspěvek přidán');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Chyba', err.message || 'Nepodařilo se vytvořit příspěvek.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#5C55E1" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Přidat příspěvek</Text>

          <View style={styles.pickerWrapper}>
            <Picker selectedValue={type} onValueChange={setType}>
              <Picker.Item label="Poznámka" value="TEXT" />
              <Picker.Item label="Obrázek" value="IMAGE" />
              <Picker.Item label="Lokace" value="LOCATION" />
            </Picker>
          </View>

          {type === 'TEXT' && (
            <TextInput
              style={styles.input}
              placeholder="Obsah příspěvku"
              value={content}
              onChangeText={setContent}
              multiline
            />
          )}

          {type === 'LOCATION' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Zadej lokaci (např. Praha)"
                value={location}
                onChangeText={setLocation}
              />
              <TouchableOpacity
                style={[styles.geoButton, loadingLocation && { opacity: 0.6 }]}
                onPress={handleDetectLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator color="#1e88e5" />
                ) : (
                  <Text style={styles.geoButtonText}>📍 Načíst moji polohu</Text>
                )}
              </TouchableOpacity>

            </>
          )}

          {type === 'IMAGE' && (
            <>
              <Text style={{ marginBottom: 8 }}>Obrázky (max. 10)</Text>
              <View style={styles.imageButtons}>
                <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
                  <Text style={styles.imageButtonText}>📷 Vyfotit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImageFromLibrary} style={styles.imageButton}>
                  <Text style={styles.imageButtonText}>🖼️ Vybrat ze zařízení</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal style={{ marginVertical: 10, paddingTop: 10 }}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        setImages(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>


            </>
          )}

          <View style={styles.rowDateTime}>
            <TouchableOpacity style={styles.dateCardHalf} onPress={() => setDatePicker(true)}>
              <Text style={styles.dateLabel}>Datum</Text>
              <Feather name="calendar" size={20} color="#555" />
              <Text style={styles.dateText}>
                {date ? moment(date).format('DD.MM.YYYY') : 'Vyber datum'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateCardHalf} onPress={() => setTimePicker(true)}>
              <Text style={styles.dateLabel}>Čas</Text>
              <Feather name="clock" size={20} color="#555" />
              <Text style={styles.dateText}>
                {date ? moment(date).format('HH:mm') : 'Vyber čas'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              locale="cs-CZ"
              onChange={(event, selectedDate) => {
                setDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              locale="cs-CZ"
              onChange={(event, selectedTime) => {
                setTimePicker(false);
                if (selectedTime && date) {
                  const updated = new Date(date);
                  updated.setHours(selectedTime.getHours());
                  updated.setMinutes(selectedTime.getMinutes());
                  setDate(updated);
                }
              }}
            />
          )}


        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>{buttonLabels[type]}</Text>
        </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  pickerWrapper: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 15,
  },
  rowDateTime: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
dateCardHalf: {
  flex: 1,
  backgroundColor: '#f3e5f5',
  padding: 15,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},

  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
    removeButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#e53935',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  geoButton: {
    backgroundColor: '#bbdefb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  geoButtonText: {
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#ce93d8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#7e57c2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateCardWrapper: {
    marginBottom: 15,
  },
  dateCard: {
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
  
});

export default CreatePostScreen;
