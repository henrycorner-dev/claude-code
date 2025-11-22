// React Native Responsive Layout Implementation
// Cross-platform example with platform-specific adaptations

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Get initial screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for responsive design
const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Helper to determine device type
const getDeviceType = (width: number): 'phone' | 'tablet' | 'desktop' => {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
};

// MARK: - Responsive Hook
const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const deviceType = getDeviceType(width);
  const isPortrait = height > width;

  return {
    width,
    height,
    deviceType,
    isPortrait,
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};

// MARK: - Responsive Card Component
interface CardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

const ResponsiveCard: React.FC<CardProps> = ({ title, subtitle, onPress }) => {
  const { deviceType, width } = useResponsive();

  // Calculate card width based on device
  const getCardWidth = () => {
    if (deviceType === 'desktop') {
      // 3 columns on desktop with gaps
      return (width - 64 - 32) / 3;
    }
    if (deviceType === 'tablet') {
      // 2 columns on tablet with gaps
      return (width - 48 - 16) / 2;
    }
    // Full width on phone with margins
    return width - 32;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: getCardWidth(),
          padding: deviceType === 'phone' ? 16 : 20,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.cardTitle,
        { fontSize: deviceType === 'phone' ? 16 : 18 }
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.cardSubtitle,
        { fontSize: deviceType === 'phone' ? 14 : 15 }
      ]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

// MARK: - Home Screen
const HomeScreen: React.FC = ({ navigation }: any) => {
  const { deviceType, isTablet, isDesktop } = useResponsive();

  const items = [
    { id: '1', title: 'First Item', subtitle: 'Details about first item' },
    { id: '2', title: 'Second Item', subtitle: 'Details about second item' },
    { id: '3', title: 'Third Item', subtitle: 'Details about third item' },
    { id: '4', title: 'Fourth Item', subtitle: 'Details about fourth item' },
    { id: '5', title: 'Fifth Item', subtitle: 'Details about fifth item' },
    { id: '6', title: 'Sixth Item', subtitle: 'Details about sixth item' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            padding: deviceType === 'phone' ? 16 : 24,
            flexDirection: isTablet || isDesktop ? 'row' : 'column',
            flexWrap: isTablet || isDesktop ? 'wrap' : 'nowrap',
            gap: 16,
          },
        ]}
      >
        {items.map((item) => (
          <ResponsiveCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => navigation.navigate('Detail', { item })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// MARK: - Detail Screen
const DetailScreen: React.FC = ({ route, navigation }: any) => {
  const { item } = route.params;
  const { deviceType, width } = useResponsive();

  // Responsive padding and max width
  const contentMaxWidth = deviceType === 'phone' ? width : 600;
  const contentPadding = deviceType === 'phone' ? 16 : 24;

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.detailContent,
          {
            maxWidth: contentMaxWidth,
            padding: contentPadding,
            alignSelf: 'center',
          },
        ]}
      >
        <Text style={styles.detailTitle}>{item.title}</Text>
        <Text style={styles.detailSubtitle}>{item.subtitle}</Text>

        <View style={styles.divider} />

        <Text style={styles.detailBody}>
          This is additional information about {item.title}. The layout adapts
          based on screen size, providing optimal reading width and spacing for
          different devices.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { marginTop: deviceType === 'phone' ? 24 : 32 }
          ]}
          onPress={() => alert('Action performed!')}
        >
          <Text style={styles.buttonText}>Take Action</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// MARK: - Search Screen
const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { deviceType } = useResponsive();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { padding: deviceType === 'phone' ? 16 : 24 }
        ]}
      >
        <Text style={styles.searchPlaceholder}>
          Search functionality would go here
        </Text>
      </View>
    </View>
  );
};

// MARK: - Profile Screen
const ProfileScreen: React.FC = () => {
  const { deviceType, width } = useResponsive();
  const contentMaxWidth = deviceType === 'phone' ? width : 600;

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.profileContent,
          {
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <ProfileMenuItem icon="create-outline" title="Edit Profile" />
          <ProfileMenuItem icon="lock-closed-outline" title="Privacy" />
          <ProfileMenuItem icon="shield-checkmark-outline" title="Security" />
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <ProfileMenuItem icon="settings-outline" title="Settings" />
          <ProfileMenuItem icon="help-circle-outline" title="Help & Support" />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Icon name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Profile Menu Item Component
const ProfileMenuItem: React.FC<{ icon: string; title: string }> = ({
  icon,
  title,
}) => (
  <TouchableOpacity style={styles.menuItem}>
    <Icon name={icon} size={24} color="#666" />
    <Text style={styles.menuItemText}>{title}</Text>
    <Icon name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

// MARK: - Navigation Setup
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Home (allows drilling into details)
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
    <Stack.Screen
      name="Detail"
      component={DetailScreen}
      options={{ title: 'Details' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const { isPhone } = useResponsive();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Platform.OS === 'ios' ? '#007AFF' : '#6750A4',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? (isPhone ? 83 : 65) : 60,
          paddingBottom: Platform.OS === 'ios' ? (isPhone ? 20 : 8) : 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// MARK: - Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// MARK: - Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#666',
  },
  detailContent: {
    width: '100%',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  detailBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  button: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#6750A4',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  profileContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
});
