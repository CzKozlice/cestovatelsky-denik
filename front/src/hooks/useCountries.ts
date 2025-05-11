// Externí knihovny
import { useEffect, useState } from 'react';
import axios from 'axios';

// Konstanty
import { API_URL } from '@/constants/config';


export default function useCountries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/countries`);
        setCountries(response.data);
      } catch (error) {
        console.error('Chyba při načítání zemí:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading };
}
