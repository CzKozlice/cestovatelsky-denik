// React a React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Navigace
import { useNavigation } from '@react-navigation/native';

// Externí knihovny
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';

// Konstanty
import { API_URL, API_URL_IMAGE } from '@/constants/config';

// Kontexty
import { useProfile } from '@/context/ProfileContext';

// Hooky
import useCountries from '@/hooks/useCountries';

// Komponenty
import CountryPickerModal from '@/components/ui/CountryPickerModal';



const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, loading, refetch, updateProfile } = useProfile();
  const { countries } = useCountries();

  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCountryModalVisible, setCountryModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      const defaultForm = {
        firstname: profile.firstname || '',
        surname: profile.surname || '',
        bio: profile.bio || '',
        country: profile.country || '',
        avatarUrl: profile.avatarUrl || '',
      };
      setForm(defaultForm);
      setInitialForm(defaultForm);
    }
  }, [profile]);

  const getChangedFields = () => {
    const changes = {};
    for (const key in form) {
      if (form[key] !== initialForm[key]) {
        if (key === 'country') {
          const found = countries.find(c => c.code === form.country || c.id === form.country);
          changes.country = found ? found.name : form.country;
        } else {
          changes[key] = form[key];
        }
      }
    }
    return changes;
  };
  

  const getCountryName = (value: string) => {
    let found = countries.find(c => c.code === value);
    if (found) return found.name;
    found = countries.find(c => c.id === value);
    if (found) return found.name;
  
    return value;
  };
  

  const handleAvatarUpload = async (source: 'camera' | 'gallery') => {
    try {
      const permissionResult =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        Alert.alert('Přístup odepřen', 'Aplikace potřebuje oprávnění ke kameře nebo knihovně.');
        return;
      }
  
      const pickerFn =
        source === 'camera'
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;
  
      const result = await pickerFn({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const image = result.assets[0];
        const formData = new FormData();
        formData.append('files', {
          uri: image.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        formData.append('type', 'avatar');
  
        const token = await AsyncStorage.getItem('token');
        const res = await axios.post(`${API_URL}/auth/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
  
        setForm(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      }
    } catch (err) {
      console.error('Chyba při výběru nebo nahrávání obrázku:', err);
      Alert.alert('Chyba', 'Nepodařilo se zpracovat obrázek.');
    }
  };
  

  const handleSave = async () => {
    if (!form.firstname.trim()) {
      Alert.alert('Neplatné jméno', 'Zadej své jméno.');
      return;
    }
    if (form.firstname.length > 30) {
      Alert.alert('Neplatné jméno', 'Jméno může mít maximálně 30 znaků.');
      return;
    }
  
    if (!form.surname.trim()) {
      Alert.alert('Neplatné příjmení', 'Zadej své příjmení.');
      return;
    }
    if (form.surname.length > 30) {
      Alert.alert('Neplatné příjmení', 'Příjmení může mít maximálně 30 znaků.');
      return;
    }
  
    if (!form.country) {
      Alert.alert('Země chybí', 'Vyber zemi původu.');
      return;
    }
  
    if (form.bio.length > 150) {
      Alert.alert('Bio je příliš dlouhé', 'Bio může mít maximálně 150 znaků.');
      return;
    }
  
    const changes = getChangedFields();
  
    if (Object.keys(changes).length === 0) {
      Alert.alert('Žádné změny', 'Neprovedl(a) jsi žádnou úpravu.');
      return;
    }
  
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(`${API_URL}/auth/profile`, changes, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      refetch();
      updateProfile(changes);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Chyba', 'Nepodařilo se uložit změny.');
    } finally {
      setIsSaving(false);
    }
  };
  

  if (loading || !form)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7F56D9" />;

  return (
<SafeAreaView style={[styles.wrapper ]}>
  <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Feather name="arrow-left" size={24} color="#5C55E1" />
    </TouchableOpacity>
      <View style={styles.avatarContainer}>
        {form.avatarUrl ? (
            <Image source={{ uri: API_URL_IMAGE + form.avatarUrl }} style={styles.avatar} />
        ) : (
            <Text style={styles.avatarPlaceholder}>Avatar nenastaven</Text>
        )}

        <View style={styles.avatarButtons}>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => handleAvatarUpload('camera')}>
            <Text style={styles.avatarBtnText}>📷 Vyfotit avatar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => handleAvatarUpload('gallery')}>
            <Text style={styles.avatarBtnText}>🖼️ Vybrat ze zařízení</Text>
            </TouchableOpacity>
        </View>
        </View>


        <TextInput
          style={styles.input}
          placeholder="Jméno"
          value={form.firstname}
          onChangeText={text => setForm(prev => ({ ...prev, firstname: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Příjmení"
          value={form.surname}
          onChangeText={text => setForm(prev => ({ ...prev, surname: text }))}
        />

        <TouchableOpacity style={styles.input} onPress={() => setCountryModalVisible(true)}>
          <Text>{getCountryName(form.country) || 'Země původu'}</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Bio"
          value={form.bio}
          onChangeText={text => setForm(prev => ({ ...prev, bio: text }))}
          multiline
        />

        <CountryPickerModal
        visible={isCountryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        countries={countries}
        selected={form.country}
        toggleCountry={(value) => {
            const match = countries.find(c => c.id === value || c.code === value);
            if (match) {
            setForm(prev => ({ ...prev, country: match.code }));
            }
            setCountryModalVisible(false);
        }}
        singleSelect
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Ukládám…' : 'Uložit změny'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 75,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  avatarPlaceholder: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  avatarBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  avatarBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#7F56D9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default EditProfileScreen;
