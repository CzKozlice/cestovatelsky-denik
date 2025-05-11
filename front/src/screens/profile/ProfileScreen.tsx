// Externí knihovny
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Kontexty & hooky
import { useProfile } from '@/context/ProfileContext';

// Komponenty
import MapView from '@/components/MapView';

// Konstanty
import { API_URL_IMAGE } from '@/constants/config';





const ProfileScreen = () => {
  const { profile, loading, refetch } = useProfile();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#7F56D9" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Chyba načítání profilu.</Text>
      </View>
    );
  }

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
<SafeAreaView style={{ flex: 1 }}>
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.container}>
        <View style={styles.editButtonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Feather name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>

        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: `${API_URL_IMAGE}${profile.avatarUrl}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarEmoji}>👤</Text>
              )}
            </View>
          </View>

          <Text style={styles.username}>{profile.username || 'Uživatel'}</Text>
          <Text style={styles.ageLocation}>
            {profile.birthday ? `${calculateAge(profile.birthday)} let, ` : ''}
            {profile.country || 'Země nevyplněna'}
          </Text>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              {profile.bio ?? 'Místo pro Vaše bio'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Objevování světa</Text>
        <View style={styles.mapContainer}>
        {profile && (
            <MapView
              visitedCountries={profile.visitedCountryCodes}
              plannedCountries={profile.plannedCountryCodes}
            />
          )}

        </View>

        <TouchableOpacity style={styles.diaryButton} onPress={() => navigation.navigate('TravelDiary')}>
          <Text style={styles.diaryButtonText}>Zobrazit celý deník</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const calculateAge = (birthdayString) => {
  const birthday = new Date(birthdayString);
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    flex: 1,
  },
  editButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  profileHeader: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 90,
    height: 90,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  
  avatarEmoji: {
    fontSize: 36,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  ageLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  quoteBox: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  editProfileButton: {
    marginTop: 12,
    backgroundColor: '#7F56D9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: '#eee',
    borderWidth: 1,
  },
  diaryButton: {
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 16,
    backgroundColor: '#7F56D9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
