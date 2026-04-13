import { AlertTriangle, Bell, CheckCircle2, Clock3, TrendingUp, FileText, Wallet, Landmark } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, LineChart, BarChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../components/AuthContext';
import realData from '../../tawtik_api_v2.json';

// ─── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  navy: '#1a2e44',
  navyMid: '#2d4a6e',
  navyLight: '#3d6795',
  gold: '#b8922a',
  goldLight: '#d4a843',
  success: '#27ae60',
  successBg: '#eafaf1',
  successText: '#1a6a47',
  warn: '#f39c12',
  warnBg: '#fef9e7',
  warnText: '#a05515',
  danger: '#e74c3c',
  dangerBg: '#fdedec',
  dangerText: '#8b1a1a',
  teal: '#1abc9c',
  bg: '#f0f3f8',
  surface: '#ffffff',
  surface2: '#f0f4f8',
  text: '#1a2033',
  muted: '#6b7a94',
  border: '#e2e8f1',
};

// ─── ÉTATS ─────────────────────────────────────────────────────────────────
const SUCCESS_STATES = ['Validé', 'Cloturé', 'valide', 'valider', 'cloture', 'Clôturée', 'restituion_valider', 'aide_recu', 'restituion_effectuer'];
const PENDING_STATES = ['Brouillon', 'bruillon', 'Envoyé', 'envoye', 'en_cours', 'Affecter', 'revision', 'expediton_envoye', 'demande_restituion', 'demande_cloture'];
const ALERT_STATES = ['Annulé', 'annule', 'rejeter', 'expire', 'Annuler', 'cloture_rejeter'];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function classify(state) {
  if (SUCCESS_STATES.includes(state)) return 's';
  if (ALERT_STATES.includes(state)) return 'd';
  return 'p';
}

function getServiceStats(arr = []) {
  let s = 0, p = 0, d = 0;
  arr.forEach(i => {
    const c = classify(i.state);
    if (c === 's') s++; else if (c === 'd') d++; else p++;
  });
  return { s, p, d, t: arr.length };
}

function fmtAmount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + ' K';
  return String(n);
}

// ─── HOOK: scale press ───────────────────────────────────────────────────────
function usePressScale(toScale = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: toScale, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  return { scale, onPressIn, onPressOut };
}

// ─── ANIMATED CARD ──────────────────────────────────────────────────────────
function AnimatedCard({ children, delay = 0, pressable = false, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;
  const { scale, onPressIn, onPressOut } = usePressScale(0.975);

  const hasRun = useRef(false);
  if (!hasRun.current) {
    hasRun.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, speed: 13, bounciness: 5 }),
    ]).start();
  }

  const animStyle = [
    style,
    { opacity, transform: [{ translateY }, ...(pressable ? [{ scale }] : [])] },
  ];

  if (!pressable) return <Animated.View style={animStyle}>{children}</Animated.View>;

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animStyle}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

/** KPI Card — with prominent icon */
function KpiCard({ icon, count, label, gradColors, accentColor, delay = 0 }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  const hasRun = useRef(false);
  if (!hasRun.current) {
    hasRun.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();
  }

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[s.kpiCard, { opacity, transform: [{ translateY }, { scale }] }]}>
        <LinearGradient colors={gradColors} style={s.kpiGradientStrip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <View style={[s.kpiIconCircle, { backgroundColor: accentColor + '15' }]}>
          {icon}
        </View>
        <Text style={s.kpiCount}>{count}</Text>
        <Text style={s.kpiLabel}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

/** Institution Card — premium redesign */
function InstBar({ name, stats, onPress, icon, accentColor }) {
  const anim = useRef(new Animated.Value(0)).current;
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const hasRun = useRef(false);
  if (!hasRun.current) {
    hasRun.current = true;
    Animated.timing(anim, { toValue: 1, duration: 900, delay: 300, useNativeDriver: false }).start();
  }

  const pctSuccess = stats.t > 0 ? Math.round((stats.s / stats.t) * 100) : 0;

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[s.instCard, { transform: [{ scale }] }]}>
        {/* Left accent strip */}
        <View style={[s.instAccentStrip, { backgroundColor: accentColor }]} />

        {/* Header row */}
        <View style={s.instHeader}>
          <View style={[s.instIconWrap, { backgroundColor: accentColor + '18' }]}>
            {icon}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.instName}>{name}</Text>
            <Text style={s.instTotal}>{stats.t} dossiers · {pctSuccess}% validés</Text>
          </View>
          <View style={s.instArrow}>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </View>
        </View>

        {/* Animated progress bar */}
        <View style={s.instTrack}>
          {stats.s > 0 && (
            <Animated.View style={[s.instSeg, {
              flex: anim.interpolate({ inputRange: [0, 1], outputRange: [0.001, stats.s] }),
              backgroundColor: C.success,
              borderTopLeftRadius: 7, borderBottomLeftRadius: 7,
              borderTopRightRadius: stats.p === 0 && stats.d === 0 ? 7 : 0,
              borderBottomRightRadius: stats.p === 0 && stats.d === 0 ? 7 : 0,
            }]} />
          )}
          {stats.p > 0 && (
            <Animated.View style={[s.instSeg, {
              flex: anim.interpolate({ inputRange: [0, 1], outputRange: [0.001, stats.p] }),
              backgroundColor: C.warn,
            }]} />
          )}
          {stats.d > 0 && (
            <Animated.View style={[s.instSeg, {
              flex: anim.interpolate({ inputRange: [0, 1], outputRange: [0.001, stats.d] }),
              backgroundColor: C.danger,
              borderTopRightRadius: 7, borderBottomRightRadius: 7,
            }]} />
          )}
        </View>

        {/* Status badges */}
        <View style={s.instBadges}>
          <View style={[s.instBadge, { backgroundColor: C.success + '15' }]}>
            <View style={[s.instBadgeDot, { backgroundColor: C.success }]} />
            <Text style={[s.instBadgeNum, { color: C.success }]}>{stats.s}</Text>
            <Text style={s.instBadgeLabel}>Validés</Text>
          </View>
          <View style={[s.instBadge, { backgroundColor: C.warn + '15' }]}>
            <View style={[s.instBadgeDot, { backgroundColor: C.warn }]} />
            <Text style={[s.instBadgeNum, { color: C.warn }]}>{stats.p}</Text>
            <Text style={s.instBadgeLabel}>En cours</Text>
          </View>
          <View style={[s.instBadge, { backgroundColor: C.danger + '15' }]}>
            <View style={[s.instBadgeDot, { backgroundColor: C.danger }]} />
            <Text style={[s.instBadgeNum, { color: C.danger }]}>{stats.d}</Text>
            <Text style={s.instBadgeLabel}>Bloqués</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

/** Alert row */
function AlertRow({ code, client, source, urgent }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[s.alertCard, { transform: [{ scale }] }]}>
        <View style={[s.alertLeftStrip, { backgroundColor: urgent ? C.danger : C.warn }]} />
        <View style={s.alertLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.alertCode}>{code}</Text>
            <View style={s.sourcePill}><Text style={s.sourcePillText}>{source}</Text></View>
          </View>
          <Text style={s.alertClient}>{client}</Text>
        </View>
        <View style={[s.alertBadge, { backgroundColor: urgent ? C.dangerBg : C.warnBg }]}>
          <Text style={[s.alertBadgeText, { color: urgent ? C.dangerText : C.warnText }]}>
            {urgent ? 'Urgent' : 'Bloqué'}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

/** Donut Chart Section */
const DonutChartSection = ({ stats }) => {
  const router = useRouter();
  const { scale, onPressIn, onPressOut } = usePressScale(0.975);
  const donutData = [
    { value: stats.dgi.t || 1, color: C.navyLight, text: 'DGI', focused: true },
    { value: stats.tgr.t || 1, color: '#6366f1', text: 'TGR' },
    { value: stats.daamsakan.t || 1, color: '#ec4899', text: 'DAAM SAKAN' },
  ];

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[s.donutCard, { transform: [{ scale }] }]}>
        <Text style={s.sectionTitle}>Répartition des Dossiers</Text>
        <Text style={[s.sectionSub, { marginBottom: 14 }]}>Vue d'ensemble par institution</Text>
        <View style={s.chartRow}>
          <PieChart
            donut
            radius={70}
            innerRadius={50}
            data={donutData}
            innerCircleColor={C.surface}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s.centerNumber}>{stats.total}</Text>
                <Text style={s.centerText}>TOTAL</Text>
              </View>
            )}
          />
          <View style={s.legendColumn}>
            <LegendItemPie color={C.navyLight} label="DGI" count={stats.dgi.t} onPress={() => router.push('/dgi')} />
            <LegendItemPie color="#6366f1" label="TGR" count={stats.tgr.t} onPress={() => router.push('/tgr')} />
            <LegendItemPie color="#ec4899" label="DAAM SAKAN" count={stats.daamsakan.t} onPress={() => router.push('/daamsakan')} />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const LegendItemPie = ({ color, label, count, onPress }) => (
  <TouchableOpacity style={s.donutLegendItem} onPress={onPress} activeOpacity={0.6}>
    <View style={[s.donutDot, { backgroundColor: color }]} />
    <View>
      <Text style={s.donutLegendLabel}>{label}</Text>
      <Text style={s.donutLegendCount}>{count} dossiers</Text>
    </View>
  </TouchableOpacity>
);

/** Activity Line Chart */
const ActivitySection = ({ data = [], totalSent = 0, peakMonth = '' }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 100;

  const chartData = data.length > 0 
    ? data 
    : [{ value: 0, label: '—' }];

  return (
    <View>
      <View style={s.headerRow}>
        <TrendingUp color={C.navyLight} size={22} />
        <Text style={s.sectionTitle}>Flux d'Activité</Text>
      </View>
      <Text style={[s.sectionSub, { marginLeft: 34 }]}>Envois consolidés DGI · TGR · DAAM SAKAN</Text>

      <View style={s.chartWrapper}>
        <LineChart
          data={chartData}
          height={170}
          width={chartWidth}
          initialSpacing={20}
          spacing={chartData.length > 1 ? chartWidth / (chartData.length + 0.5) : 100}
          color={C.navyLight}
          thickness={2.5}
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={C.border}
          yAxisTextStyle={{ color: C.muted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.muted, fontSize: 9 }}
          curved
          isAnimated
          animationDuration={1000}
          noOfSections={4}
          dataPointsColor={C.navyLight}
          dataPointsRadius={5}
          focusedDataPointColor={C.gold}
          focusedDataPointRadius={7}
          startFillColor={C.navyLight}
          endFillColor="transparent"
          startOpacity={0.18}
          endOpacity={0}
          areaChart
          pointerConfig={{
            pointerStripUptoDataPoint: true,
            pointerStripColor: C.border,
            pointerStripWidth: 1,
            pointerColor: C.navyLight,
            radius: 5,
            pointerLabelWidth: 80,
            pointerLabelHeight: 30,
            pointerLabelComponent: (items) => (
              <View style={s.tooltip}>
                <Text style={s.tooltipText}>{items[0].value} envois</Text>
              </View>
            ),
          }}
        />
      </View>

      {/* Summary row */}
      <View style={s.activitySummaryRow}>
        <View style={s.activityStat}>
          <Text style={s.activityStatValue}>{totalSent}</Text>
          <Text style={s.activityStatLabel}>Total envoyés</Text>
        </View>
        <View style={s.activityStatSep} />
        <View style={s.activityStat}>
          <Text style={s.activityStatValue}>{data.length}</Text>
          <Text style={s.activityStatLabel}>Périodes</Text>
        </View>
        <View style={s.activityStatSep} />
        <View style={s.activityStat}>
          <Text style={[s.activityStatValue, { color: C.gold }]}>{peakMonth}</Text>
          <Text style={s.activityStatLabel}>Pic d'activité</Text>
        </View>
      </View>
    </View>
  );
};

/** Financial Analysis Bar Chart */
const FinancialAnalysis = ({ dataDGI = [] }) => {
  const screenWidth = Dimensions.get('window').width;

  const financialData = useMemo(() => {
    return dataDGI.flatMap(item => [
      {
        value: item.montant_affaire / 1000000,
        spacing: 4,
        frontColor: C.gold,
        gradientColor: '#d4a843',
        dossier: item.dossier_repertoir,
      },
      {
        value: item.montant_enregistrement / 1000000,
        frontColor: C.success,
        gradientColor: '#2ecc71',
        dossier: item.dossier_repertoir,
      }
    ]);
  }, [dataDGI]);

  const totalAffaire = dataDGI.reduce((acc, curr) => acc + curr.montant_affaire, 0);
  const totalEnreg = dataDGI.reduce((acc, curr) => acc + curr.montant_enregistrement, 0);

  // Top 3 dossiers by montant
  const top3 = useMemo(() => {
    return [...dataDGI]
      .sort((a, b) => b.montant_affaire - a.montant_affaire)
      .slice(0, 3);
  }, [dataDGI]);

  return (
    <View>
      <View style={s.headerRow}>
        <Wallet color={C.navyLight} size={22} />
        <Text style={s.sectionTitle}>Analyse Financière</Text>
      </View>
      
      <Text style={s.sectionSubWithMargin}>Montants par dossier (en Millions DH)</Text>

      <View style={s.chartWrapper}>
        <BarChart
          data={financialData}
          width={screenWidth - 100}
          height={180}
          barWidth={18}
          spacing={financialData.length > 20 ? 8 : 14}
          noOfSections={6}
          maxValue={3}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={C.border}
          xAxisLabelsHeight={0}
          yAxisTextStyle={{ color: C.muted, fontSize: 10 }}
          isAnimated
          animationDuration={800}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          renderTooltip={(item) => (
            <View style={[s.tooltip, { minWidth: 95 }]}>
              <Text style={[s.tooltipText, { fontSize: 9 }]} numberOfLines={2}>
                {item.dossier ? item.dossier.split('-').slice(-2).join('-') : ''}{item.dossier ? '\n' : ''}{item.value.toFixed(2)}M DH
              </Text>
            </View>
          )}
        />
      </View>

      {/* Legend */}
      <View style={s.chartFooter}>
        <View style={s.legendRow}>
          <View style={s.legendItem}>
            <View style={[s.legendDotSmall, { backgroundColor: C.gold }]} />
            <Text style={s.legendTextSmall}>Montant Affaire</Text>
          </View>
          <View style={[s.legendItem, { marginLeft: 15 }]}>
            <View style={[s.legendDotSmall, { backgroundColor: C.success }]} />
            <Text style={s.legendTextSmall}>Enregistrement</Text>
          </View>
        </View>

        {/* Summary cards */}
        <View style={s.finSummaryRow}>
          <View style={[s.finSummaryCard, { borderLeftColor: C.gold }]}>
            <Text style={s.finSummaryLabel}>Total Affaires</Text>
            <Text style={[s.finSummaryValue, { color: C.gold }]}>{(totalAffaire / 1000000).toFixed(2)}M</Text>
          </View>
          <View style={[s.finSummaryCard, { borderLeftColor: C.success }]}>
            <Text style={s.finSummaryLabel}>Total Enreg.</Text>
            <Text style={[s.finSummaryValue, { color: C.success }]}>{(totalEnreg / 1000000).toFixed(2)}M</Text>
          </View>
        </View>

        {/* Top 3 */}
        <Text style={s.topLabel}>Top 3 dossiers</Text>
        {top3.map((d, i) => (
          <View key={i} style={s.topRow}>
            <View style={[s.topRank, { backgroundColor: i === 0 ? C.gold : C.surface2 }]}>
              <Text style={[s.topRankText, { color: i === 0 ? '#fff' : C.muted }]}>{i + 1}</Text>
            </View>
            <Text style={s.topDossier} numberOfLines={1}>{d.dossier_repertoir}</Text>
            <Text style={s.topAmount}>{(d.montant_affaire / 1000000).toFixed(2)}M</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── MAIN SCREEN ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const { notaire } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [data] = useState(realData);

  // Header fade
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerHasRun = useRef(false);
  if (!headerHasRun.current) {
    headerHasRun.current = true;
    Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }

  const stats = useMemo(() => {
    const dgi = getServiceStats(data.DGI);
    const tgr = getServiceStats(data.TGR);
    const daamsakan = getServiceStats(data.DAAMSAKAN);

    // ─── DÉDOUBLONNAGE PAR DOSSIER UNIQUE ───
    const dossierMap = new Map();

    const process = (arr, source) => {
      arr.forEach(item => {
        const key = item.dossier_repertoir || `UNKNOWN-${item.id}-${source}`;
        if (!dossierMap.has(key)) {
          dossierMap.set(key, { states: [], amounts: 0 });
        }
        const entry = dossierMap.get(key);
        entry.states.push(classify(item.state));
        if (item.montant_affaire) entry.amounts += item.montant_affaire;
      });
    };

    process(data.DGI, 'DGI');
    process(data.TGR, 'TGR');
    process(data.DAAMSAKAN, 'DS');

    let total = 0, success = 0, pending = 0, alerts = 0;
    let totalAmount = 0;

    dossierMap.forEach((val) => {
      total++;
      totalAmount += val.amounts;
      
      const hasAlert = val.states.includes('d');
      const allSuccess = val.states.every(s => s === 's');

      if (hasAlert) alerts++;
      else if (allSuccess) success++;
      else pending++;
    });

    const allAlerts = [
      ...data.DGI.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.dossier_repertoir, client: 'Client DGI', source: 'DGI', urgent: i.state === 'Annulé' })),
      ...data.TGR.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.numeroDemande, client: 'Redevable TGR', source: 'TGR', urgent: i.state === 'annule' })),
      ...data.DAAMSAKAN.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.demande_ref, client: i.nom_beneficier, source: 'DAAM', urgent: ['Annuler', 'expire'].includes(i.state) })),
    ].slice(0, 5);

    // Activity data — combine DGI + TGR + DAAMSAKAN dates
    const map = {};
    const addDates = (arr) => {
      arr.forEach(i => {
        if (!i.date_envoie) return;
        const m = i.date_envoie.slice(5, 7) + '/' + i.date_envoie.slice(2, 4);
        map[m] = (map[m] || 0) + 1;
      });
    };
    addDates(data.DGI);
    addDates(data.TGR);
    addDates(data.DAAMSAKAN);

    const evolData = Object.keys(map).sort().map(k => ({ label: k, value: map[k] }));
    const totalSent = evolData.reduce((acc, d) => acc + d.value, 0);
    const peakEntry = evolData.reduce((max, d) => d.value > max.value ? d : max, { value: 0, label: '—' });

    return { dgi, tgr, daamsakan, total, success, pending, alerts, totalAmount, allAlerts, evolData, totalSent, peakMonth: peakEntry.label };
  }, [data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const initials = `${notaire.prenom[0]}${notaire.nom[0]}`;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.navyMid} />}
      >
        {/* ── HERO HEADER ── */}
        <Animated.View style={[s.heroHeader, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['#1a2e44', '#2d4a6e', '#3d6795']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {/* Decorative rings */}
          <View style={s.heroRing1} />
          <View style={s.heroRing2} />

          <View style={s.heroTop}>
            <View style={s.headerLeft}>
              <View style={s.avatarContainer}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              <View>
                <Text style={s.headerGreet}>Bonjour, Maître {notaire.nom}</Text>
                <Text style={s.headerSub}>Tableau de bord · TAWTIK</Text>
              </View>
            </View>
            <TouchableOpacity style={s.bellWrap} onPress={() => router.push('/(tabs)/Notifications')}>
              <Bell color="#fff" size={22} />
              {stats.alerts > 0 && <View style={s.bellDot} />}
            </TouchableOpacity>
          </View>

          {/* Hero amount inside header */}
          <View style={s.heroAmountBlock}>
            <Text style={s.heroLabel}>Volume total des affaires</Text>
            <Text style={s.heroAmount}>{fmtAmount(stats.totalAmount)} MAD</Text>
            <View style={s.heroRow}>
              <TrendingUp size={14} color={C.goldLight} />
              <Text style={s.heroSub}> {stats.total} dossiers uniques traités</Text>
            </View>
          </View>
        </Animated.View>



        {/* ── SYNTHÈSE DES DOSSIERS ── */}
        <AnimatedCard delay={120} pressable style={s.syntheseCard}>
          <LinearGradient
            colors={['#1a2e44', '#2d4a6e', '#3d6795']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {/* Header */}
          <View style={s.syntheseHeader}>
            <View style={s.syntheseIconBig}>
              <Ionicons name="briefcase" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.syntheseTitle}>Synthèse des dossiers</Text>
              <Text style={s.syntheseSub}>Vue globale de tous les services</Text>
            </View>
          </View>

          {/* Big number */}
          <View style={s.syntheseBigRow}>
            <Text style={s.syntheseBigNum}>{stats.total}</Text>
            <Text style={s.syntheseBigLabel}>dossiers{'\n'}uniques</Text>
            <View style={s.synthesePercentBadge}>
              <Ionicons name="trending-up" size={14} color={C.success} />
              <Text style={s.synthesePercentText}>
                {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.syntheseBarTrack}>
            {stats.success > 0 && (
              <View style={[s.syntheseBarSeg, {
                flex: stats.success,
                backgroundColor: C.success,
                borderTopLeftRadius: 6, borderBottomLeftRadius: 6,
                borderTopRightRadius: stats.pending === 0 && stats.alerts === 0 ? 6 : 0,
                borderBottomRightRadius: stats.pending === 0 && stats.alerts === 0 ? 6 : 0,
              }]} />
            )}
            {stats.pending > 0 && (
              <View style={[s.syntheseBarSeg, { flex: stats.pending, backgroundColor: C.warn }]} />
            )}
            {stats.alerts > 0 && (
              <View style={[s.syntheseBarSeg, {
                flex: stats.alerts,
                backgroundColor: C.danger,
                borderTopRightRadius: 6, borderBottomRightRadius: 6,
              }]} />
            )}
          </View>

          {/* 3 stat columns */}
          <View style={s.syntheseStats}>
            <View style={s.syntheseStatCol}>
              <View style={[s.syntheseStatDot, { backgroundColor: C.success }]} />
              <Text style={s.syntheseStatNum}>{stats.success}</Text>
              <Text style={s.syntheseStatLabel}>Validés</Text>
            </View>
            <View style={s.syntheseStatSep} />
            <View style={s.syntheseStatCol}>
              <View style={[s.syntheseStatDot, { backgroundColor: C.warn }]} />
              <Text style={s.syntheseStatNum}>{stats.pending}</Text>
              <Text style={s.syntheseStatLabel}>En cours</Text>
            </View>
            <View style={s.syntheseStatSep} />
            <View style={s.syntheseStatCol}>
              <View style={[s.syntheseStatDot, { backgroundColor: C.danger }]} />
              <Text style={s.syntheseStatNum}>{stats.alerts}</Text>
              <Text style={s.syntheseStatLabel}>Bloqués</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ── DONUT CHART ── */}
        <AnimatedCard delay={200} style={{ marginBottom: 16 }}>
          <DonutChartSection stats={stats} />
        </AnimatedCard>

        {/* ── PAR INSTITUTION ── */}
        <AnimatedCard delay={280} style={{ marginBottom: 16 }}>
          <View style={s.instSectionHeader}>
            <Landmark color={C.navyLight} size={22} />
            <View>
              <Text style={s.sectionTitle}>Analyse par institution</Text>
              <Text style={[s.sectionSub, { marginBottom: 0 }]}>Répartition des statuts par service</Text>
            </View>
          </View>
        </AnimatedCard>

        <InstBar
          name="DGI · Impôts"
          stats={stats.dgi}
          onPress={() => router.push('/dgi')}
          icon={<Ionicons name="document-text-outline" size={22} color="#3d6795" />}
          accentColor="#3d6795"
        />
        <InstBar
          name="TGR · Trésorerie"
          stats={stats.tgr}
          onPress={() => router.push('/tgr')}
          icon={<Ionicons name="layers-outline" size={22} color="#6366f1" />}
          accentColor="#6366f1"
        />
        <InstBar
          name="DAAM SAKAN"
          stats={stats.daamsakan}
          onPress={() => router.push('/daamsakan')}
          icon={<Ionicons name="home-outline" size={22} color="#ec4899" />}
          accentColor="#ec4899"
        />

        {/* ── FINANCIAL ANALYSIS ── */}
        <AnimatedCard delay={340} pressable style={s.card}>
          <FinancialAnalysis dataDGI={data.DGI} />
        </AnimatedCard>

        {/* ── ÉVOLUTION ── */}
        <AnimatedCard delay={400} pressable style={s.card}>
          <ActivitySection data={stats.evolData} totalSent={stats.totalSent} peakMonth={stats.peakMonth} />
        </AnimatedCard>

        {/* ── ALERTES ── */}
        <AnimatedCard delay={460} style={{ marginBottom: 32 }}>
          <View style={s.alertHeader}>
            <AlertTriangle size={18} color={C.danger} />
            <Text style={[s.sectionTitle, { marginBottom: 0 }]}>Alertes critiques</Text>
          </View>
          <Text style={[s.sectionSub, { marginBottom: 14 }]}>Dossiers nécessitant une attention immédiate</Text>
          {stats.allAlerts.length === 0
            ? <Text style={{ color: C.muted, fontSize: 13 }}>Aucune alerte critique.</Text>
            : stats.allAlerts.map((a, i) => <AlertRow key={i} {...a} />)
          }
        </AnimatedCard>

      </ScrollView>
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Hero header
  heroHeader: {
    marginHorizontal: -16, marginTop: -16,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroRing1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    top: -80, right: -60,
  },
  heroRing2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: 'rgba(184,146,42,0.12)',
    bottom: -40, left: -40,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: C.goldLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerGreet: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginTop: 1, letterSpacing: 0.5 },
  bellWrap: {
    position: 'relative', padding: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
  },
  bellDot: {
    position: 'absolute', top: 8, right: 8, width: 10, height: 10,
    borderRadius: 5, backgroundColor: C.danger, borderWidth: 2, borderColor: C.navy,
  },

  heroAmountBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1 },
  heroAmount: { fontSize: 34, fontWeight: '900', color: '#fff', marginTop: 4, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  heroSub: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  scroll: { padding: 16, paddingBottom: 32 },

  // Synthèse card
  syntheseCard: {
    borderRadius: 20, padding: 20, marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  syntheseHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18,
  },
  syntheseIconBig: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  syntheseTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  syntheseSub: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  syntheseBigRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  syntheseBigNum: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  syntheseBigLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', lineHeight: 16 },
  synthesePercentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(39,174,96,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    marginLeft: 'auto',
  },
  synthesePercentText: { fontSize: 14, fontWeight: '800', color: C.success },
  syntheseBarTrack: {
    height: 12, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row', overflow: 'hidden', marginBottom: 16,
  },
  syntheseBarSeg: { height: '100%' },
  syntheseStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingVertical: 14,
  },
  syntheseStatCol: { flex: 1, alignItems: 'center', gap: 4 },
  syntheseStatDot: { width: 8, height: 8, borderRadius: 4 },
  syntheseStatNum: { fontSize: 20, fontWeight: '900', color: '#fff' },
  syntheseStatLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  syntheseStatSep: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.12)' },

  // KPI cards
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', overflow: 'hidden',
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  kpiGradientStrip: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  kpiIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, marginTop: 6,
  },
  kpiCount: { fontSize: 28, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  kpiLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },

  // Cards
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18, marginBottom: 16,
    shadowColor: '#1a2e44', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 4, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: C.muted, marginBottom: 16, fontWeight: '600' },
  sectionSubWithMargin: { fontSize: 12, color: C.muted, marginBottom: 20, fontWeight: '600', marginLeft: 34 },
  chartWrapper: { alignItems: 'center', marginLeft: -10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chartFooter: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: C.border },
  legendRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  legendDotSmall: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendTextSmall: { fontSize: 12, color: C.muted, fontWeight: '700' },
  totalBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface2, padding: 12, borderRadius: 12,
  },
  totalLabel: { fontSize: 14, color: C.muted, marginLeft: 8, fontWeight: '700' },
  totalValue: { fontSize: 17, fontWeight: '900', color: C.navyLight },
  tooltip: { backgroundColor: C.navy, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tooltipText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  // Legend
  legend: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '700', color: C.muted },

  // Institution cards
  instSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  instCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16, paddingLeft: 20,
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  instAccentStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },
  instHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14,
  },
  instIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  instName: { fontSize: 15, fontWeight: '800', color: C.navy },
  instTotal: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2 },
  instArrow: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
  },
  instTrack: { height: 14, borderRadius: 7, backgroundColor: C.border, overflow: 'hidden', flexDirection: 'row', marginBottom: 12 },
  instSeg: { height: '100%' },
  instBadges: { flexDirection: 'row', gap: 8 },
  instBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10,
  },
  instBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  instBadgeNum: { fontSize: 16, fontWeight: '900' },
  instBadgeLabel: { fontSize: 9, fontWeight: '700', color: C.muted, textTransform: 'uppercase' },

  // Alerts
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#1a2e44', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: 'hidden',
  },
  alertLeftStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
  },
  alertLeft: { flex: 1, gap: 4, paddingLeft: 6 },
  alertCode: { fontSize: 14, fontWeight: '800', color: C.navy, letterSpacing: -0.2 },
  alertClient: { fontSize: 12, fontWeight: '600', color: C.muted },
  sourcePill: { backgroundColor: C.surface2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sourcePillText: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 0.5 },
  alertBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  alertBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Donut
  donutCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    shadowColor: '#1a2e44', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  centerNumber: { fontSize: 24, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  centerText: { fontSize: 10, fontWeight: '800', color: C.muted, textTransform: 'uppercase' },
  legendColumn: { justifyContent: 'center', gap: 14 },
  donutLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  donutDot: { width: 12, height: 12, borderRadius: 4 },
  donutLegendLabel: { fontSize: 13, fontWeight: '800', color: C.navy },
  donutLegendCount: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 1 },

  // Financial summary
  finSummaryRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 },
  finSummaryCard: {
    flex: 1, backgroundColor: C.surface2, borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
  },
  finSummaryLabel: { fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  finSummaryValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },

  // Top 3
  topLabel: { fontSize: 12, fontWeight: '800', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  topRank: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topRankText: { fontSize: 12, fontWeight: '800' },
  topDossier: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
  topAmount: { fontSize: 14, fontWeight: '800', color: C.navy },

  // Activity summary
  activitySummaryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface2, borderRadius: 12,
    paddingVertical: 14, marginTop: 16,
  },
  activityStat: { flex: 1, alignItems: 'center' },
  activityStatValue: { fontSize: 20, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  activityStatLabel: { fontSize: 9, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  activityStatSep: { width: 1, height: 32, backgroundColor: C.border },
});
