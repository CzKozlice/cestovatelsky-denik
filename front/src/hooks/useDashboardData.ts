// Externí knihovny
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konstanty
import { API_URL } from '@/constants/config';


export default function useDashboardData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Chyba při načítání dashboard dat:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchDashboard();
    }
  }, [isFocused]);

  return { data, loading };
}
