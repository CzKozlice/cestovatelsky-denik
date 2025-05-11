// React a React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';

// Externí knihovny
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

// Konstanty
import { API_URL, APP_SECRET, APP_VERSION } from '@/constants/config';



const countries = ['Afghánistán','Albánie','Alžírsko','Andorra','Angola','Argentina','Arménie','Austrálie','Ázerbájdžán','Bahamy','Bahrajn','Bangladéš','Belgie','Bělorusko','Bolívie','Bosna a Hercegovina','Brazílie','Bulharsko','Čad','Česká republika','Čína','Dánsko','Dominikánská republika','Egypt','Estonsko','Fidži','Filipíny','Finsko','Francie','Grécko','Chorvatsko','Indie','Indonésie','Irák','Irán','Irsko','Island','Itálie','Izrael','Japonsko','Jemen','Jihoafrická republika','Jižní Korea','Kanada','Kazachstán','Keňa','Kolumbie','Kostarika','Kuba','Kypr','Maďarsko','Malajsie','Malta','Maroko','Mexiko','Moldavsko','Mongolsko','Německo','Nizozemsko','Norsko','Nový Zéland','Pákistán','Panama','Peru','Polsko','Portugalsko','Rakousko','Rumunsko','Rusko','Řecko','Saúdská Arábie','Singapur','Slovensko','Slovinsko','Spojené arabské emiráty','Spojené království','Spojené státy','Srbsko','Španělsko','Švédsko','Švýcarsko','Thajsko','Turecko','Ukrajina','Uruguay','Uzbekistán','Vietnam', 'VN'];

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordVerify: '',
    username: '',
    firstname: '',
    surname: '',
    birthday: '',
    gender: '',
    country: '',
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [genderOpen, setGenderOpen] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { label: 'Muž', value: 'Muž' },
    { label: 'Žena', value: 'Žena' },
    { label: 'Nechci uvádět', value: 'Nechci uvádět' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryItems, setCountryItems] = useState(
    countries.map((c) => ({ label: c, value: c }))
  );

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value.trimStart() });
  };

const validateForm = () => {
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!form.email.trim()) {
    Alert.alert('Neplatný e-mail', 'E-mail je povinný.');
    return false;
  }
  if (!emailRegex.test(form.email)) {
    Alert.alert('Neplatný e-mail', 'Zadej e-mail ve správném formátu (např. uzivatel@domena.cz).');
    return false;
  }
  if (form.email.length > 100) {
    Alert.alert('Příliš dlouhý e-mail', 'E-mail může mít maximálně 100 znaků.');
    return false;
  }

  if (!form.password.trim()) {
    Alert.alert('Neplatné heslo', 'Heslo je povinné.');
    return false;
  }
  if (form.password.length < 6) {
    Alert.alert('Neplatné heslo', 'Heslo musí mít alespoň 6 znaků.');
    return false;
  }

  if (form.password !== form.passwordVerify) {
    Alert.alert('Nesouhlasí hesla', 'Zadaná hesla se musí shodovat.');
    return false;
  }

  if (!form.username.trim()) {
    Alert.alert('Neplatné uživatelské jméno', 'Uživatelské jméno je povinné.');
    return false;
  }
  if (form.username.length > 30) {
    Alert.alert('Neplatné uživatelské jméno', 'Uživatelské jméno může mít maximálně 30 znaků.');
    return false;
  }

  if (!form.firstname.trim()) {
    Alert.alert('Neplatné jméno', 'Jméno je povinné.');
    return false;
  }
  if (form.firstname.length > 30) {
    Alert.alert('Neplatné jméno', 'Jméno může mít maximálně 30 znaků.');
    return false;
  }

  if (!form.surname.trim()) {
    Alert.alert('Neplatné příjmení', 'Příjmení je povinné.');
    return false;
  }
  if (form.surname.length > 30) {
    Alert.alert('Neplatné příjmení', 'Příjmení může mít maximálně 30 znaků.');
    return false;
  }

  if (
    !form.birthday.trim() ||
    !moment(form.birthday, 'DD.MM.YYYY', true).isValid() ||
    moment(form.birthday, 'DD.MM.YYYY').isAfter(moment())
  ) {
    Alert.alert('Neplatné datum narození', 'Zadej datum ve formátu DD.MM.RRRR a nesmí být v budoucnosti.');
    return false;
  }

  if (!form.gender) {
    Alert.alert('Chybí pohlaví', 'Vyber prosím pohlaví.');
    return false;
  }

  if (!form.country) {
    Alert.alert('Chybí země', 'Vyber zemi původu.');
    return false;
  }

  return true;
};


  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      const data = {
        ...form,
        gender: form.gender === 'Muž' ? 'MALE' : form.gender === 'Žena' ? 'FEMALE' : 'OTHER',
        birthday: moment(form.birthday, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      };

      const response = await axios.post(`${API_URL}/auth/register`, data, {
        headers: {
          'x-app-secret': APP_SECRET,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        Alert.alert('Úspěch', 'Uživatel byl úspěšně vytvořen.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      Alert.alert('Chyba', error.response?.data?.error || 'Něco se pokazilo');
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      const formatted = moment(selectedDate).format('DD.MM.YYYY');
      setForm({ ...form, birthday: formatted });
    }
  };

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
                source={require('@/../assets/_backupfavicon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Registrace</Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              onChangeText={(text) => handleChange('email', text)}
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Heslo"
              style={styles.input}
              onChangeText={(text) => handleChange('password', text)}
              value={form.password}
              secureTextEntry
            />
            <TextInput
              placeholder="Heslo pro ověření"
              style={styles.input}
              onChangeText={(text) => handleChange('passwordVerify', text)}
              value={form.passwordVerify}
              secureTextEntry
            />
            <TextInput
              placeholder="Uživatelské jméno"
              style={styles.input}
              onChangeText={(text) => handleChange('username', text)}
              value={form.username}
            />
            <TextInput
              placeholder="Jméno"
              style={styles.input}
              onChangeText={(text) => handleChange('firstname', text)}
              value={form.firstname}
            />
            <TextInput
              placeholder="Příjmení"
              style={styles.input}
              onChangeText={(text) => handleChange('surname', text)}
              value={form.surname}
            />

            <TouchableOpacity onPress={showDatePicker} style={styles.input}>
              <Text>{form.birthday ? form.birthday : 'Datum narození (DD.MM.YYYY)'}</Text>
            </TouchableOpacity>

            {isDatePickerVisible && (
              <DateTimePicker
                value={
                  form.birthday ? moment(form.birthday, 'DD.MM.YYYY').toDate() : new Date()
                }
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                locale="cs-CZ"
                onChange={onChangeDate}
              />
            )}

            <DropDownPicker
              open={genderOpen}
              setOpen={(open) => {
                setGenderOpen(open);
                setCountryOpen(false);
              }}
              value={form.gender}
              setValue={(val) => handleChange('gender', val())}
              items={genderItems}
              placeholder="Pohlaví"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={2000}
            />

            <DropDownPicker
              open={countryOpen}
              setOpen={(open) => {
                setCountryOpen(open);
                setGenderOpen(false);
              }}
              value={form.country}
              setValue={(val) => handleChange('country', val())}
              items={countryItems}
              placeholder="Země narození"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              dropDownDirection="TOP"
              zIndex={1000}
            />

          <TouchableOpacity style={styles.registerSubmitButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Potvrdit registraci</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBackButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerButtonText}>Zpět</Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  registerSubmitButton: {
    marginTop: 10,
    backgroundColor: '#5C55E1',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerBackButton: {
    marginTop: 10,
    backgroundColor: '#7BBBFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },  
  title: {
    fontSize: 24,
    marginBottom: 20,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  footer: {
    marginTop: 30,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  dropdown: {
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    height: 48,
    marginBottom: 15,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
});

export default RegisterScreen;
