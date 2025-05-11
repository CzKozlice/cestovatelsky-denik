// React a React Native
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

// Navigace a bezpečné zóny
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ikony
import { Feather } from '@expo/vector-icons';

// Kontext a konfigurace
import { useProfile } from '@/context/ProfileContext';
import { API_URL_IMAGE, APP_VERSION } from '@/constants/config';



const SettingsScreen = () => {
  const navigation = useNavigation();
  const { profile } = useProfile();

  const { logout } = useProfile();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
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

        <Text style={styles.sectionLabel}>NASTAVENÍ</Text>
        <SettingsItem icon={<Feather name="user" size={20} color="#5C55E1" />} label="Osobní údaje" onPress={() => navigation.navigate('UserProfile')} />
        <SettingsItem icon={<Feather name="bell" size={20} color="#5C55E1" />} label="Notifikace" onPress={() => navigation.navigate('Notifications')} />

        <Text style={styles.sectionLabel}>O NÁS</Text>
        <SettingsItem icon={<Feather name="help-circle" size={20} color="#5C55E1" />} label="Často kladené otázky" onPress={() => navigation.navigate('Faq')} />
        <SettingsItem icon={<Feather name="link" size={20} color="#5C55E1" />} label="Užitečné odkazy" onPress={() => navigation.navigate('UsefulLinks')} />
        <SettingsItem icon={<Feather name="phone" size={20} color="#5C55E1" />} label="Kontaktní formulář" onPress={() => navigation.navigate('Contact')} />
        <SettingsItem icon={<Feather name="info" size={20} color="#5C55E1" />} label="O aplikaci" onPress={() => navigation.navigate('AboutApp')} />


        <Text style={styles.version}>Verze aplikace {APP_VERSION}</Text>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Odhlásit se</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsItem = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.itemRow}>
    {icon}
    <Text style={styles.itemLabel}>{label}</Text>
    <Feather name="chevron-right" size={20} color="#5C55E1" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },  
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: '#888',
  },
  sectionLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#5C55E1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteAccount: {
    marginTop: 30,
    alignItems: 'center',
  },
  deleteText: {
    color: 'red',
    fontSize: 14,
  },
});

export default SettingsScreen;
