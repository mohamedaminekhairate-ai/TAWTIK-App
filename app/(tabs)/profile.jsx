import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useAuth } from '../../components/AuthContext';

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  navy: '#1a2e44',
  navyMid: '#2d4a6e',
  navyLight: '#3d6795',
  gold: '#b8922a',
  goldLight: '#d4a843',
  goldBg: '#fdf6e3',
  success: '#2a9d6e',
  successBg: '#e8f7f2',
  teal: '#2ec4b6',
  tealBg: '#e6faf8',
  bg: '#f5f7fb',
  surface: '#ffffff',
  surface2: '#f0f4f8',
  text: '#0f1e2e',
  muted: '#6b7a94',
  border: '#e2e8f1',
  danger: '#e94560',
  dangerBg: '#fef0f2',
};

// ─── MENU CONFIG ──────────────────────────────────────────────────────────────
const MENU = [
  { id: 1, icon: 'settings-outline', label: 'Paramètres', accent: C.navyLight },
  { id: 2, icon: 'notifications-outline', label: 'Notifications', accent: '#f72585' },
  { id: 3, icon: 'shield-checkmark-outline', label: 'Sécurité', accent: C.teal },
  { id: 4, icon: 'help-circle-outline', label: 'Aide & Support', accent: C.gold },
  { id: 5, icon: 'information-circle-outline', label: 'À propos', accent: '#7209b7' },
];

// ─── PRESS SCALE HOOK ─────────────────────────────────────────────────────────
function usePressScale(to = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;
  const inn = () => Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 3 }).start();
  const out = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 }).start();
  return { scale, inn, out };
}

// ─── MENU ITEM ────────────────────────────────────────────────────────────────
function MenuItem({ item, index, isLast }) {
  const { scale, inn, out } = usePressScale(0.98);
  const opacity = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: 300 + index * 60, useNativeDriver: true }),
      Animated.spring(tx, { toValue: 0, delay: 300 + index * 60, useNativeDriver: true, speed: 14, bounciness: 4 }),
    ]).start();
  }, []);

  return (
    <TouchableWithoutFeedback onPressIn={inn} onPressOut={out}>
      <Animated.View style={[
        styles.menuRow,
        !isLast && styles.menuRowBorder,
        { opacity, transform: [{ translateX: tx }, { scale }] }
      ]}>
        <View style={[styles.menuIcon, { backgroundColor: item.accent + '18' }]}>
          <Ionicons name={item.icon} size={20} color={item.accent} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <View style={styles.menuChevronWrap}>
          <Ionicons name="chevron-forward" size={14} color={C.muted} />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ─── STAT ITEM ────────────────────────────────────────────────────────────────
function StatItem({ value, label, accent }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay: 200, useNativeDriver: true, speed: 12, bounciness: 6 }).start();
  }, []);
  return (
    <Animated.View style={[styles.statItem, { transform: [{ scale: anim }], opacity: anim }]}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { notaire, logout } = useAuth();
  const router = useRouter();

  const initials = `${notaire.prenom[0]}${notaire.nom[0]}`;

  // Entrance animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(24)).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, delay: 160, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, delay: 160, useNativeDriver: true, speed: 13, bounciness: 4 }),
      Animated.timing(logoutAnim, { toValue: 1, duration: 400, delay: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const { scale: logoutScale, inn: logoutIn, out: logoutOut } = usePressScale(0.97);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >

      {/* ── HERO HEADER ── */}
      <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
        {/* Decorative rings */}
        <View style={styles.ring1} />
        <View style={styles.ring2} />

        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.heroName}>
          {notaire.prenom} <Text style={styles.heroNameBold}>{notaire.nom}</Text>
        </Text>
        <Text style={styles.heroConseil}>{notaire.conseil}</Text>

        {/* Badges */}
        <View style={styles.herosBadges}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText}>Actif</Text>
          </View>
          <View style={styles.ifBadge}>
            <Text style={styles.ifLabel}>IF</Text>
            <Text style={styles.ifValue}>{notaire.IF}</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── STATS ── */}
      <Animated.View style={[styles.statsCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
        <StatItem value="24" label="Dossiers" accent={C.navyLight} />
        <View style={styles.statSep} />
        <StatItem value="12" label="Messages" accent={C.gold} />
        <View style={styles.statSep} />
        <StatItem value="5" label="Incidents" accent={C.danger} />
      </Animated.View>

      {/* ── SECTION LABEL ── */}
      <Animated.View style={{ opacity: cardOpacity }}>
        <Text style={styles.sectionLabel}>MON ESPACE</Text>
      </Animated.View>

      {/* ── MENU ── */}
      <Animated.View style={[styles.menuCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
        {MENU.map((item, i) => (
          <MenuItem key={item.id} item={item} index={i} isLast={i === MENU.length - 1} />
        ))}
      </Animated.View>

      {/* ── LOGOUT ── */}
      <Animated.View style={{ opacity: logoutAnim, transform: [{ scale: logoutScale }] }}>
        <TouchableWithoutFeedback onPressIn={logoutIn} onPressOut={logoutOut} onPress={handleLogout}>
          <View style={styles.logoutBtn}>
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={18} color={C.danger} />
            </View>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* ── FOOTER ── */}
      <Animated.View style={[styles.footer, { opacity: logoutAnim }]}>
        <Text style={styles.footerText}>Conseil National des Notaires du Maroc</Text>
        <Text style={styles.footerVersion}>v2.1.0</Text>
      </Animated.View>

    </ScrollView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: C.navy,
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  ring1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    top: -80, right: -60,
  },
  ring2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: 'rgba(184,146,42,0.12)',
    bottom: -40, left: -40,
  },

  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: C.gold,
    padding: 3,
    marginBottom: 18,
    shadowColor: C.gold, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  avatarInner: {
    flex: 1, borderRadius: 44,
    backgroundColor: C.navyMid,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  heroName: { fontSize: 20, fontWeight: '400', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },
  heroNameBold: { fontWeight: '800', color: '#fff' },
  heroConseil: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5, textAlign: 'center', letterSpacing: 0.4 },

  herosBadges: { flexDirection: 'row', gap: 10, marginTop: 16 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(46,196,182,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(46,196,182,0.3)',
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.teal },
  activeBadgeText: { color: C.teal, fontSize: 12, fontWeight: '700' },

  ifBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(184,146,42,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(184,146,42,0.3)',
  },
  ifLabel: { color: C.goldLight, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ifValue: { color: C.goldLight, fontSize: 12, fontWeight: '600' },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 },
  statSep: { width: 1, height: 40, backgroundColor: C.border },

  // Section label
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginHorizontal: 20, marginBottom: 8,
  },

  // Menu
  menuCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#1a2e44', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  menuChevronWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: C.dangerBg,
    borderRadius: 16, paddingVertical: 16, gap: 10,
    borderWidth: 1, borderColor: C.danger + '25',
    marginBottom: 24,
  },
  logoutIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: C.danger + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: C.danger, letterSpacing: 0.2 },

  // Footer
  footer: { alignItems: 'center', gap: 3, paddingBottom: 8 },
  footerText: { fontSize: 11, color: C.muted, fontWeight: '500', textAlign: 'center' },
  footerVersion: { fontSize: 10, color: C.border, letterSpacing: 0.5 },
});