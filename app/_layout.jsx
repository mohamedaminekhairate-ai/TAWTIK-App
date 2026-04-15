import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../components/AuthContext';

// ─── HEADER TITLE WITH LOGO ──────────────────────────────────────────────────
function HeaderTitle({ title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image
        source={require('../assets/images/tawtik-logo2.png')}
        style={{ width: 26, height: 26, borderRadius: 6 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e3f28', letterSpacing: -0.3 }}>
        {title}
      </Text>
    </View>
  );
}

function CustomDrawerContent(props) {
  const router = useRouter();
  const { logout, notaire } = useAuth();

  const labelStyle = { color: '#ffffff', fontSize: 15, fontWeight: '600', textAlign: 'center' };
  const iconColor = '#ffffff';
  const itemStyle = { borderRadius: 12, marginHorizontal: 12, marginVertical: 2 };

  const initials = `${notaire.prenom[0]}${notaire.nom[0]}`;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}
    >
      {/* ── Logo / Avatar ── */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>{initials}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          {notaire.prenom} {notaire.nom}
        </Text>

      </View>

      {/* ── Separator ── */}
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 24, marginBottom: 16 }} />

      {/* ── Menu Items ── */}
      <DrawerItem 
        label="Accueil" 
        icon={({ size }) => <Ionicons name="home-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)')}
        labelStyle={labelStyle}
        style={itemStyle}
      />
      <DrawerItem 
        label="Notifications" 
        icon={({ size }) => <Ionicons name="notifications-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)/Notifications')}
        labelStyle={labelStyle}
        style={itemStyle}
      />
      <DrawerItem 
        label="Profil" 
        icon={({ size }) => <Ionicons name="person-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/(tabs)/profile')}
        labelStyle={labelStyle}
        style={itemStyle}
      />

      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12, marginHorizontal: 24 }} />

      <DrawerItem 
        label="Dossiers DGI" 
        icon={({ size }) => <Ionicons name="document-text-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/dgi')}
        labelStyle={labelStyle}
        style={itemStyle}
      />
      <DrawerItem 
        label="Dossiers TGR" 
        icon={({ size }) => <Ionicons name="layers-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/tgr')}
        labelStyle={labelStyle}
        style={itemStyle}
      />
      <DrawerItem 
        label="Aide DAAM SAKAN" 
        icon={({ size }) => <Ionicons name="home-outline" size={size} color={iconColor} />}
        onPress={() => router.push('/daamsakan')}
        labelStyle={labelStyle}
        style={itemStyle}
      />

      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12, marginHorizontal: 24 }} />

      <DrawerItem 
        label="Se déconnecter" 
        icon={({ size }) => <Ionicons name="log-out-outline" size={size} color="#ff6b6b" />}
        onPress={() => { logout(); router.replace('/login'); }}
        labelStyle={[labelStyle, { color: '#ff6b6b' }]}
        style={[itemStyle, { backgroundColor: 'rgba(255,107,107,0.1)' }]}
      />

      {/* ── Bottom spacing ── */}
      <View style={{ flex: 0 }} />
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <StatusBar style="dark" />
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#407C4F',
          headerTitleStyle: { fontWeight: '700' },
          headerTitle: ({ children }) => <HeaderTitle title={children} />,
          drawerStyle: { backgroundColor: '#407C4F', width: 280 },
        }}
      >
        {/* Login screen — hidden from drawer, no header */}
        <Drawer.Screen 
          name="login" 
          options={{ 
            drawerLabel: () => null,
            drawerItemStyle: { display: 'none' },
            title: 'Connexion',
            headerShown: false,
            swipeEnabled: false,
          }} 
          redirect={isLoggedIn}
        />
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Accueil', title: 'Accueil', headerShown: false }} />
        <Drawer.Screen name="dgi" options={{ drawerLabel: 'Dossiers DGI', title: 'DGI · Impôts' }} />
        <Drawer.Screen name="tgr" options={{ drawerLabel: 'Dossiers TGR', title: 'TGR · Trésorerie' }} />
        <Drawer.Screen name="daamsakan" options={{ drawerLabel: 'Aide DAAM SAKAN', title: 'Aide au Logement' }} />
      </Drawer>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppDrawer />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
