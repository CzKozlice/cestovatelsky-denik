// Externí knihovny
import { useContext } from 'react';

// Kontexty
import { ProfileContext } from '@/context/ProfileContext';


export default function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile musí být použit uvnitř <ProfileProvider>');
  }

  return context;
}
