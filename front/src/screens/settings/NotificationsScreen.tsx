// React a React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';

// Navigace a bezpečné zóny
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Notifikace
import * as Notifications from 'expo-notifications';

// Ikony
import { Feather } from '@expo/vector-icons';



const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [isGranted, setIsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await Notifications.getPermissionsAsync();
      setIsGranted(settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED);
    };

    checkPermissions();
  }, []);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#5C55E1" />
        </TouchableOpacity>

        <View style={styles.illustrationContainer}>
          <Feather name={isGranted ? 'bell' : 'bell-off'} size={100} color="#5C55E1" />
        </View>

        <Text style={styles.title}>Notifikace</Text>
        <Text style={styles.description}>
          {isGranted === null
            ? 'Zjišťuji stav notifikací...'
            : isGranted
            ? 'Notifikace jsou povolené. V případě potřeby je můžete upravit v nastavení telefonu.'
            : 'Notifikace jsou zakázané. Změnit to můžete v nastavení telefonu.'}
        </Text>

        <TouchableOpacity style={styles.button} onPress={openSettings}>
          <Text style={styles.buttonText}>Otevřít nastavení</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5C55E1',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;