import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../components/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  navy: '#1e3f28',
  navyMid: '#2d5638',
  gold: '#b02e29',
  goldLight: '#ca3b36',
  surface: '#ffffff',
  border: '#dde6f0',
  muted: '#5a7a9a',
  error: '#c0392b',
};

// ─── FLOATING DOT ─────────────────────────────────────────────────────────────
function FloatingDot({ style }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[style, { opacity: pulse, position: 'absolute' }]} />;
}

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, rightIcon, onRightIconPress }) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#dde6f0', '#407c4f'] });
  const bgColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#f8fafc', '#f0f6f3'] });

  return (
    <Animated.View style={[styles.inputWrap, { borderColor, backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={18} color={focused ? '#407c4f' : C.muted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.inputRight}>
          <Ionicons name={rightIcon} size={18} color={C.muted} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─── MAIN LOGIN SCREEN ────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  // Mode: 'login' ou 'otp'
  const [step, setStep] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedOtp, setFocusedOtp] = useState(null);
  const inputRefs = useRef([]);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideCard = useRef(new Animated.Value(50)).current;
  const slideLogo = useRef(new Animated.Value(-20)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideCard, { toValue: 0, delay: 150, useNativeDriver: true, speed: 10, bounciness: 4 }),
      Animated.spring(slideLogo, { toValue: 0, delay: 80, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();
  }, []);

  const handlePressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 3 }).start();
  const handlePressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 }).start();

  const handleLogin = async () => {
    if (loading) return;
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    handlePressIn();
    try {
      // ── Simulated auth check ──
      await new Promise(r => setTimeout(r, 1000));
      handlePressOut();
      setLoading(false);

      // Passer à l'étape OTP
      setStep('otp');
    } catch (e) {
      handlePressOut();
      setLoading(false);
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;
    const code = otp.join('');
    if (code.length < 6) {
      setError('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }
    setError('');
    setLoading(true);
    handlePressIn();
    try {
      // ── Simulated OTP verification ──
      await new Promise(r => setTimeout(r, 1500));
      handlePressOut();
      login(); // Confirme la connexion dans le contexte
      router.replace('/(tabs)');
    } catch (e) {
      handlePressOut();
      setError('Code incorrect. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  // ── Rendu partiel selon l'étape ──
  const renderCardContent = () => {
    if (step === 'login') {
      return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideCard }] }]}>
          <LinearGradient
            colors={['#b02e29', '#ca3b36', '#b02e29']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.cardAccent}
          />
          <Text style={styles.cardTitle}>Connexion</Text>

          {!!error && (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle-outline" size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>IDENTIFIANT</Text>
          <InputField
            icon="person-outline"
            placeholder="Votre identifiant notarial"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
          />

          <View style={{ marginTop: 16 }}>
            <Text style={styles.fieldLabel}>MOT DE PASSE</Text>
            <InputField
              icon="lock-closed-outline"
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPass(v => !v)}
            />
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleLogin}
            disabled={loading}
          >
            <Animated.View style={[styles.loginBtn, { transform: [{ scale: btnScale }], opacity: loading ? 0.85 : 1 }]}>
              <LinearGradient
                colors={['#1e3f28', '#2d5638', '#407c4f']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                  <Text style={styles.loginBtnText}>Continuer</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              }
            </Animated.View>
          </Pressable>

          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color={C.muted} />
            <Text style={styles.securityText}>Connexion chiffrée · Données protégées</Text>
          </View>
        </Animated.View>
      );
    }

    // Rendu OTP
    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideCard }] }]}>
        <LinearGradient
          colors={['#b02e29', '#ca3b36', '#b02e29']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />

        <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Authentification</Text>
        <Text style={[styles.cardSub, { textAlign: 'center', marginBottom: 28 }]}>
          Veuillez saisir le code à 6 chiffres généré par votre application Google Authenticator.
        </Text>

        {!!error && (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={16} color={C.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, focusedOtp === index && styles.otpInputFocused]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
              onFocus={() => setFocusedOtp(index)}
              onBlur={() => setFocusedOtp(null)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendWrap}>
          <Text style={styles.resendText}>L'application ne fonctionne pas ?</Text>
        </TouchableOpacity>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          <Animated.View style={[styles.loginBtn, { transform: [{ scale: btnScale }], opacity: loading ? 0.85 : 1 }]}>
            <LinearGradient
              colors={['#1e3f28', '#2d5638', '#407c4f']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                <Text style={styles.loginBtnText}>Vérifier l’identité</Text>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              </>
            }
          </Animated.View>
        </Pressable>

        <TouchableOpacity style={styles.returnWrap} onPress={() => { setStep('login'); setOtp(['', '', '', '', '', '']); setError(''); }}>
          <Ionicons name="arrow-back" size={14} color={C.muted} />
          <Text style={styles.returnText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <LinearGradient
        colors={['#0f2014', '#1e3f28', '#2d5638']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <View style={styles.ring3} />

      <FloatingDot style={{ top: H * 0.07, left: W * 0.1, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <FloatingDot style={{ top: H * 0.14, right: W * 0.15, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(176,46,41,0.5)' }} />
      <FloatingDot style={{ bottom: H * 0.2, left: W * 0.07, width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <FloatingDot style={{ bottom: H * 0.28, right: W * 0.09, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(176,46,41,0.18)' }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── LOGO ── */}
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideLogo }] }]}>
            {step === 'login' ? (
              <Image
                source={require('../assets/images/tawtik-logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="shield-checkmark" size={60} color={C.gold} style={{ marginBottom: 10 }} />
            )}
            <Text style={styles.appSub}>
              {step === 'login' ? 'ESPACE PROFESSIONNEL NOTARIAL' : 'SÉCURITÉ RENFORCÉE TAWTIK'}
            </Text>
          </Animated.View>

          {/* ── CARD CONTENT ── */}
          {renderCardContent()}

          {/* ── FOOTER ── */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Conseil National de l'Ordre des Notaires du Maroc</Text>
            <Text style={styles.footerVersion}>
              {step === 'login' ? 'v1.0' : 'Double authentification activée'}
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 24,
    justifyContent: 'center', minHeight: H,
  },

  // Rings
  ring1: {
    position: 'absolute', width: W * 1.5, height: W * 1.5,
    borderRadius: W * 0.75, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    top: -W * 0.5, left: -W * 0.25,
  },
  ring2: {
    position: 'absolute', width: W * 1.1, height: W * 1.1,
    borderRadius: W * 0.55, borderWidth: 1, borderColor: 'rgba(176,46,41,0.07)',
    bottom: -W * 0.35, right: -W * 0.28,
  },
  ring3: {
    position: 'absolute', width: W * 0.7, height: W * 0.7,
    borderRadius: W * 0.35, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    bottom: H * 0.2, left: -W * 0.2,
  },

  // Logo
  logoWrap: { alignItems: 'center', marginTop: -30, marginBottom: 24 },
  logoImg: { width: 150, height: 150, marginBottom: 10 },
  appName: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    letterSpacing: 5, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  appSub: {
    fontSize: 10, color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center',
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 26,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cardTitle: {
    fontSize: 22, fontWeight: '800', color: C.navy,
    letterSpacing: -0.5, marginBottom: 28, marginTop: 8,
    textAlign: 'center',
  },
  cardSub: { fontSize: 13, color: C.muted, lineHeight: 18, marginBottom: 22 },

  // OTP Fields
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2e44',
    textAlign: 'center',
  },
  otpInputFocused: {
    borderColor: '#407c4f',
    backgroundColor: '#f0f6f3',
  },

  // Error
  errorWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fdecea', borderRadius: 10, padding: 12,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: C.error,
  },
  errorText: { fontSize: 13, color: C.error, fontWeight: '600', flex: 1 },

  // Input
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#519060', // A lighter green close to the app's secondary green
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14, height: 52,
    paddingHorizontal: 4,
  },
  inputIcon: { marginHorizontal: 12 },
  input: {
    flex: 1, fontSize: 15, color: '#1a2e44', fontWeight: '500',
    paddingRight: 8,
  },
  inputRight: { paddingHorizontal: 12 },

  // Forgot / Resend / Return
  forgotWrap: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 22 },
  forgotText: { fontSize: 13, color: '#407c4f', fontWeight: '600' },

  resendWrap: { alignSelf: 'center', marginTop: 8, marginBottom: 26 },
  resendText: { fontSize: 14, color: '#407c4f', fontWeight: '600' },

  returnWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 22,
  },
  returnText: { fontSize: 13, color: C.muted, fontWeight: '600' },

  // Login button
  loginBtn: {
    height: 52, borderRadius: 14, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#1e3f28', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Security
  securityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 18,
  },
  securityText: { fontSize: 11, color: C.muted, fontWeight: '500' },

  // Info block
  infoBlock: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ca3b36' },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: 0.2 },

  // Footer
  footer: { alignItems: 'center', gap: 4 },
  footerLine: { width: 40, height: 0.5, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 6 },
  footerText: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textAlign: 'center', letterSpacing: 0.3 },
  footerVersion: { fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 },
});
