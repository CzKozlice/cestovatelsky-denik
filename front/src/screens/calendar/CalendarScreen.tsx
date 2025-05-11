// React a React Native
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Navigace
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Externí knihovny
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/cs';

// Konstanty
import { API_URL, API_URL_IMAGE } from '@/constants/config';



const colors = ['#81d4fa', '#ffb74d', '#a1887f', '#4db6ac', '#ba68c8', '#9575cd'];

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [trips, setTrips] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/trips/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        const tripsWithColors = data.map((trip: any) => ({
          ...trip,
          color: colors[Math.floor(Math.random() * colors.length)],
        }));

        setTrips(tripsWithColors);

        const marks: any = {};

        tripsWithColors.forEach((trip: any) => {
          const start = moment(trip.startDate);
          const end = moment(trip.endDate);
          let current = start.clone();

          while (current.isSameOrBefore(end, 'day')) {
            const dateStr = current.format('YYYY-MM-DD');
            marks[dateStr] = {
              ...marks[dateStr],
              customStyles: {
                container: {
                  backgroundColor: trip.color,
                  borderRadius: 8,
                },
                text: {
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
            };
            current.add(1, 'day');
          }
        });

        setMarkedDates(marks);
      } else {
        setTrips([]);
      }
    } catch (error) {
      setTrips([]);
    }
  };

  const filteredTrips = useMemo(() => {
    const startOfMonth = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const endOfMonth = moment(selectedMonth, 'YYYY-MM').endOf('month');
  
    return trips.filter((trip) => {
      const tripStart = moment(trip.startDate);
      const tripEnd = moment(trip.endDate);
      return tripStart.isSameOrBefore(endOfMonth, 'day') && tripEnd.isSameOrAfter(startOfMonth, 'day');
    });
  }, [trips, selectedMonth]);
  
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Kalendář výletů</Text>

        <Calendar
          markingType={'custom'} 
          markedDates={markedDates}
          onMonthChange={(month) => {
            const newMonth = moment(`${month.year}-${month.month}`, 'YYYY-M').format('YYYY-MM');
            setSelectedMonth(newMonth);
          }}
          theme={{
            selectedDayBackgroundColor: '#7e57c2',
            todayTextColor: '#7e57c2',
            arrowColor: '#7e57c2',
          }}
          enableSwipeMonths
          firstDay={1}
          locale="cs"
        />

        <Text style={styles.tripListTitle}>
          Výlety: {moment(selectedMonth).locale('cs').format('MMMM YYYY')}
        </Text>

        <ScrollView style={{ marginTop: 10 }}>
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                { backgroundColor: trip.color },
              ]}
              onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {trip.imageUrl ? (
                  <Image
                    source={{ uri: `${API_URL_IMAGE}${trip.imageUrl}` }}
                    style={styles.tripThumbnail}
                  />
                ) : (
                  <View style={[styles.tripThumbnail, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#667' }}>📷</Text>
                  </View>
                )}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.tripName}>{trip.name}</Text>
                  <Text style={styles.tripDate}>
                    {moment(trip.startDate).format('D.M.YYYY')} - {moment(trip.endDate).format('D.M.YYYY')}
                  </Text>
                </View>
              </View>

              <Feather name="arrow-right" size={20} color="#333" style={{ position: 'absolute', right: 10, top: 10 }} />
            </TouchableOpacity>

            ))
          ) : (
            <Text style={{ marginTop: 10, textAlign: 'center' }}>Žádné výlety pro tento měsíc.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  tripListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  tripCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    position: 'relative',
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripDate: {
    fontSize: 14,
    marginTop: 5,
  },
  tripThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  
});
