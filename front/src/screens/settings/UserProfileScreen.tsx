// React a React Native
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';

// Navigace a bezpečná zóna
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ikony
import { Feather } from '@expo/vector-icons';

// Kontext a konstanty
import { useProfile } from '@/context/ProfileContext';
import { API_URL_IMAGE } from '@/constants/config';



const UserProfileScreen = () => {
  const navigation = useNavigation();
  const { profile } = useProfile();

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'MALE': return 'Muž';
      case 'FEMALE': return 'Žena';
      case 'OTHER': return 'Neuvedeno';
      default: return gender ?? '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: `${API_URL_IMAGE}${profile.avatarUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.firstname?.[0]}{profile?.surname?.[0]}
              </Text>
            )}
          </View>
          <Text style={styles.name}>{profile?.firstname} {profile?.surname}</Text>
        </View>

        <Text style={styles.sectionLabel}>OSOBNÍ ÚDAJE</Text>

        <InputRow label="Jméno a příjmení" value={`${profile?.firstname ?? ''} ${profile?.surname ?? ''}`} />
        <InputRow label="Uživatelské jméno" value={profile?.username ?? ''} />
        <InputRow label="E-mail" value={profile?.email ?? ''} />
        <InputRow label="Datum narození" value={profile?.birthday ? new Date(profile.birthday).toLocaleDateString() : ''} />
        <InputRow label="Země narození" value={profile?.country ?? ''} />
        <InputRow label="Pohlaví" value={getGenderLabel(profile?.gender)} />

        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
          <Text style={styles.editText}>Upravit údaje v sekci Profil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const InputRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      editable={false}
      selectTextOnFocus={false}
      placeholder="-"
      placeholderTextColor="#aaa"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7BBBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#5C55E1',
  },
  editButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  editText: {
    fontSize: 16,
    color: '#5C55E1',
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;
