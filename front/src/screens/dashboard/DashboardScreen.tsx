// React a React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Navigace
import { useNavigation } from '@react-navigation/native';

// Externí knihovny
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';

// Komponenty
import CounterBox from '@/components/ui/CounterBox';
import TripCard from '@/components/ui/TripCard';

// Hooky
import useDashboardData from '@/hooks/useDashboardData';

// Kontexty
import { useProfile } from '@/context/ProfileContext';

// Konstanty
import { API_URL, API_URL_IMAGE } from '@/constants/config';



const DashboardScreen = () => {
  const { data, loading } = useDashboardData();
  const { profile } = useProfile();
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const roleMap: Record<string, string> = {
    CREATOR: 'Autor',
    COOWNER: 'Spolucestovatel',
    VIEWER: 'Pozorovatel',
    MEMBER: '',
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchResults();
      } else {
        setSearchResults([]);
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchResults = async () => {
    setSearching(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/trips/search?query=${encodeURIComponent(search)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setSearchResults(json);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const { logout } = useProfile();

  const handleLogout = async () => {
    await logout();
  };

  const isSearchActive = search.trim().length >= 2;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcome}>Vítej {profile?.username ?? ''}, výletníku!</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Feather name="log-out" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Vyhledat výlet"
            value={search}
            onChangeText={text => setSearch(text)}
            style={styles.searchInput}
          />

          {isSearchActive && (
            <View style={styles.searchResultsContainer}>
              <View style={styles.searchHeader}>
                <Text style={styles.sectionTitle}>Výsledky hledání</Text>
                <TouchableOpacity onPress={() => { setSearch(''); setSearchResults([]); Keyboard.dismiss(); }}>
                  <Feather name="x" size={22} color="#555" />
                </TouchableOpacity>
              </View>

              {searching && <ActivityIndicator size="small" color="#7F56D9" />}

              {!searching && searchResults.length === 0 && (
                <Text style={{ color: '#777', marginBottom: 10 }}>Nenalezen žádný výlet.</Text>
              )}

              {searchResults.map((trip: any) => (
                <View key={trip.id} style={{ marginBottom: 12 }}>
                  <TripCard
                    title={trip.title}
                    duration={`${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`}
                    imageUrl={`${API_URL_IMAGE}` + trip.imageUrl}
                    onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
                    fullWidth
                    role={roleMap[trip.role] || trip.role}
                  />
                </View>
              ))}
            </View>
          )}
          {!isSearchActive && loading ? (
            <ActivityIndicator size="large" />
          ) : !isSearchActive && (
            <>
              <View style={styles.counterRow}>
                <CounterBox number={data?.tripCount ?? 0} label="Naplánovaných výletů" backgroundColor="#4fc3f7" />
                <CounterBox number={data?.futureTrips ?? 0} label="Počet budoucích výprav" backgroundColor="#64b5f6" />
                <CounterBox number={data?.visitedCountries ?? 0} label="Navštívených zemí" backgroundColor="#81c784" />
              </View>

          	<View>
              <TouchableOpacity style={styles.diaryButton} onPress={() => navigation.navigate('TravelDiary')}>
                <Text style={styles.diaryButtonText}>Zobrazit celý deník</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

              <Text style={styles.sectionTitle}>Nejbližší naplánovaný výlet</Text>
              <View style={styles.nearestTrip}>
                {data?.nextTrip ? (
                  <TripCard
                      key={data.nextTrip.id}
                      title={data.nextTrip.title}
                      duration={data.nextTrip.duration}
                      places={data.nextTrip.places}
                      distance={data.nextTrip.distance}
                      imageUrl={`${API_URL_IMAGE}` + data.nextTrip.imageUrl}
                      onPress={() => navigation.navigate('TripDetail', { id: data.nextTrip.id })}
                      fullWidth
                      imageHeight={100}
                      role={roleMap[data.nextTrip.role] || data.nextTrip.role}

                    />
                ) : (
                  <Text>Žádný naplánovaný výlet.</Text>
                )}
              </View>

              <Text style={styles.sectionTitle}>Budoucí naplánované výlety</Text>
              <View style={styles.nearestTrip}>
                {data?.nextTrips && data.nextTrips.length > 1 ? (
                  data.nextTrips.slice(1).map((trip) => (
                    <View key={trip.id} style={{ marginBottom: 12 }}>
                      <TripCard
                        title={trip.title}
                        duration={trip.duration}
                        places={trip.places}
                        distance={trip.distance}
                        imageUrl={`${API_URL_IMAGE}` + trip.imageUrl}
                        onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
                        fullWidth
                        imageHeight={100}
                        role={roleMap[trip.role] || trip.role}
                      />

                    </View>
                  ))
                ) : (
                  <Text>Žádné další budoucí výlety.</Text>
                )}
              </View>

              <Text style={styles.sectionTitle}>Absolvované výlety</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {data?.completedTrips?.length > 0 ? (
                  data.completedTrips.map((trip: any) => (
                  <TripCard
                    key={trip.id}
                    title={trip.title}
                    duration={trip.duration}
                    places={trip.places}
                    distance={trip.distance}
                    imageUrl={`${API_URL_IMAGE}` + trip.imageUrl}
                    onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
                    role={roleMap[trip.role] || trip.role}
                  />
                  ))
                ) : (
                  <Text>Žádné absolvované výlety.</Text>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchResultsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 10,
  },
  nearestTrip: {
    marginBottom: 20,
  },
  diaryButton: {
    width: '100%',
    backgroundColor: '#7F56D9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  diaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;
