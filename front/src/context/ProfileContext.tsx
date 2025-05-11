// Externí knihovny
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konstanty
import { API_URL } from '@/constants/config';


const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Chyba při načtení profilu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = (changes: any) => {
    setProfile(prev => ({ ...prev, ...changes }));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setProfile(null);
  };
  

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refetch: fetchProfile, updateProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile musí být použit uvnitř <ProfileProvider>');
  return context;
};
