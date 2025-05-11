// Externí knihovny
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konstanty
import { API_URL, API_URL_IMAGE } from '@/constants/config';



const roles = ['CREATOR', 'COOWNER', 'VIEWER'] as const;

const TravelDiaryScreen = () => {
  const navigation = useNavigation();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<typeof roles[number]>('CREATOR');

  const fetchTrips = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/trips/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!Array.isArray(json)) {
        console.warn('Neočekávaný formát dat:', json);
        return setTrips([]);
      }

      const detailedTrips = await Promise.all(
        json.map(async (trip: any) => {
          const detailRes = await fetch(`${API_URL}/auth/trips/${trip.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const detailJson = await detailRes.json();
          return {
            ...trip,
            ...detailJson,
          };
        })
      );

      setTrips(detailedTrips);
    } catch (err) {
      console.error('Chyba při načítání deníku:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchTrips();
  }, [])
);


  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  };

  const filteredTrips = trips.filter((t: any) => t.role === selectedRole);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
      </TouchableOpacity>
        <Text style={styles.title}>Můj cestovatelský deník</Text>


        <View style={styles.filterRow}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                selectedRole === role && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={selectedRole === role ? styles.filterTextActive : styles.filterText}>
                {role === 'CREATOR'
                  ? 'Vytvořené'
                  : role === 'COOWNER'
                  ? 'Spolucestovatel'
                  : 'Pozorovatel'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#7F56D9" />
        ) : filteredTrips.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#777' }}>Žádné výlety pro zvolenou roli.</Text>
        ) : (
          filteredTrips
            .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
            .map((trip: any) => {
              const visitedCountries = Array.isArray(trip.countries)
                ? trip.countries.map((c: any) => c.country?.code).filter(Boolean)
                : [];

              const imagePosts = Array.isArray(trip.posts)
                ? trip.posts.filter((p: any) => p.type === 'IMAGE' && p.imageUrl)
                : [];

              const placesCount = Array.isArray(trip.posts)
                ? trip.posts.filter((p: any) => p.type === 'LOCATION').length
                : 0;

              return (
                <View key={trip.id} style={styles.card}>
                  {imagePosts.length > 1 ? (
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      style={styles.imageGallery}
                    >
                      {imagePosts.map((img: any, index: number) => (
                        <Image
                          key={index}
                          source={{ uri: `${API_URL_IMAGE}${img.imageUrl}` }}
                          style={styles.image}
                        />
                      ))}
                    </ScrollView>
                  ) : imagePosts.length === 1 ? (
                    <Image
                      source={{ uri: `${API_URL_IMAGE}${imagePosts[0].imageUrl}` }}
                      style={styles.imageFull}
                    />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]} />
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cardContent}
                    onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
                  >
                    <View style={styles.cardContent}>
                    <Text style={styles.tripTitle}>{trip.name}</Text>
                    <Text style={styles.tripDate}>
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </Text>

                    <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>🌍</Text>
                        <Text style={styles.statText}>{visitedCountries.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>📍</Text>
                        <Text style={styles.statText}>{placesCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>🖼️</Text>
                        <Text style={styles.statText}>{imagePosts.length}</Text>
                    </View>
                    </View>

                    </View>

                  </TouchableOpacity>
                </View>
              );
            })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterButtonActive: {
    backgroundColor: '#7F56D9',
    borderColor: '#7F56D9',
  },
  filterText: {
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },  
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageGallery: {
    width: '100%',
    height: 160,
  },
  image: {
    width: 300,
    height: 160,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  imageFull: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  imagePlaceholder: {
    height: 160,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  cardContent: {
    padding: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  tripDate: {
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  tripInfo: {
    fontSize: 13,
    color: '#444',
    flex: 1,
    textAlign: 'left',
  },
});

export default TravelDiaryScreen;