import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function CustomDrawerContent(props) {
  const router = useRouter();
  const labelStyle = { color: '#ffffff', fontSize: 16, fontWeight: '600' };
  const iconColor = '#ffffff';

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem 
        label="Accueil" 
        icon={({ size }) => <Ionicons name="home-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)')}
        labelStyle={labelStyle}
      />
      <DrawerItem 
        label="Notifications" 
        icon={({ size }) => <Ionicons name="notifications-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)/messages')}
        labelStyle={labelStyle}
      />
      <DrawerItem 
        label="Profil" 
        icon={({ size }) => <Ionicons name="person-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)/profile')}
        labelStyle={labelStyle}
      />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#3D6795',
            width: 280,
          },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Accueil', title: 'Accueil' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
