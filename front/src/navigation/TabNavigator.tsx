// Navigace
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

// Ikony
import { Feather } from '@expo/vector-icons';

// Obrazovky
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import CalendarScreen from '@/screens/calendar/CalendarScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

// Komponenty
import { TouchableOpacity, StyleSheet } from 'react-native';



export default function TabNavigator() {
  const navigation = useNavigation();
  const DummyScreen = () => null;
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#ffffff',
          position: 'absolute',
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AddTrip"
        component={DummyScreen}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateTrip')}
            >
              <Feather name="plus" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
const styles = StyleSheet.create({
  addButton: {
    width: 70,
    height: 70,
    backgroundColor: '#4fc3f7',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 10,
  },
});
