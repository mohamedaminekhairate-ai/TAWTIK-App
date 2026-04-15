import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, useColorScheme, Pressable, Text, View } from 'react-native';

function HeaderTitle({ title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image
        source={require('../../assets/images/tawtik-logo2.png')}
        style={{ width: 26, height: 26, borderRadius: 6 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e3f28', letterSpacing: -0.3 }}>
        {title}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <Pressable onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
            <Ionicons name="menu" size={28} color="#407C4F" />
          </Pressable>
        ),
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#407C4F',
        headerTitle: ({ children }) => <HeaderTitle title={children} />,
        tabBarActiveTintColor: '#407C4F',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Accueil',
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          tabBarLabel: 'Notifications',
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profil',
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}