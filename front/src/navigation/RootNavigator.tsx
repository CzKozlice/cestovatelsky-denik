// Navigace
import { createStackNavigator } from '@react-navigation/stack';

// Obrazovky – autentizace
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';

// Obrazovky – výlety
import CreateTripScreen from '@/screens/trip/CreateTripScreen';
import TripDetailScreen from '@/screens/trip/TripDetailScreen';
import CreatePostScreen from '@/screens/trip/CreatePostScreen';
import PostDetailScreen from '@/screens/trip/PostDetailScreen';
import EditTripScreen from '@/screens/trip/EditTripScreen';

// Obrazovky – profil
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import TravelDiaryScreen from '@/screens/profile/TravelDiaryScreen';

// Obrazovky – nastavení
import UserProfileScreen from '@/screens/settings/UserProfileScreen';
import NotificationsScreen from '@/screens/settings/NotificationsScreen';
import FaqScreen from '@/screens/settings/FaqScreen';
import UsefulLinksScreen from '@/screens/settings/UsefulLinksScreen';
import ContactScreen from '@/screens/settings/ContactScreen';
import AboutAppScreen from '@/screens/settings/AboutAppScreen';

// Navigační komponenty
import TabNavigator from '@/navigation/TabNavigator';

// Kontexty
import { useProfile } from '@/context/ProfileContext';

// Komponenty
import { ActivityIndicator, View } from 'react-native';


const Stack = createStackNavigator();

export default function RootNavigator() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {profile ? (
        <>
          <Stack.Screen name="Dashboard" component={TabNavigator} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Faq" component={FaqScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
          <Stack.Screen name="UsefulLinks" component={UsefulLinksScreen} />
          <Stack.Screen name="TravelDiary" component={TravelDiaryScreen} />
          <Stack.Screen name="EditTripScreen" component={EditTripScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
