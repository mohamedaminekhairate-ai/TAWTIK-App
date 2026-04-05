import { AlertTriangle, Bell, CheckCircle2, Clock3, TrendingUp } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

// ─── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  navy: '#1a2e44',
  navyMid: '#2d4a6e',
  navyLight: '#3d6795',
  success: '#2a9d6e',
  successBg: '#e8f7f2',
  successText: '#1a6a47',
  warn: '#e07b2a',
  warnBg: '#fef3e7',
  warnText: '#a05515',
  danger: '#c0392b',
  dangerBg: '#fdecea',
  dangerText: '#8b1a1a',
  bg: '#f5f7fa',
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

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const MOCK_DATA = {
  DGI: [
    { id: 1, dossier_repertoir: 'REP-2026-001', montant_affaire: 350000, montant_enregistrement: 21000, date_envoie: '2026-01-05', state: 'Validé' },
    { id: 2, dossier_repertoir: 'REP-2026-002', montant_affaire: 820000, montant_enregistrement: 49200, date_envoie: '2026-01-10', state: 'Envoyé' },
    { id: 3, dossier_repertoir: 'REP-2026-003', montant_affaire: 150000, montant_enregistrement: 9000, date_envoie: null, state: 'Brouillon' },
    { id: 4, dossier_repertoir: 'REP-2026-004', montant_affaire: 1200000, montant_enregistrement: 72000, date_envoie: '2026-01-18', state: 'Validé' },
    { id: 5, dossier_repertoir: 'REP-2026-005', montant_affaire: 430000, montant_enregistrement: 25800, date_envoie: '2026-01-22', state: 'Annulé' },
    { id: 6, dossier_repertoir: 'REP-2025-088', montant_affaire: 275000, montant_enregistrement: 16500, date_envoie: '2025-12-15', state: 'Cloturé' },
    { id: 7, dossier_repertoir: 'REP-2025-087', montant_affaire: 640000, montant_enregistrement: 38400, date_envoie: '2025-12-08', state: 'Validé' },
    { id: 8, dossier_repertoir: 'REP-2025-086', montant_affaire: 95000, montant_enregistrement: 5700, date_envoie: null, state: 'Brouillon' },
    { id: 9, dossier_repertoir: 'REP-2025-085', montant_affaire: 1800000, montant_enregistrement: 108000, date_envoie: '2025-11-30', state: 'Cloturé' },
    { id: 10, dossier_repertoir: 'REP-2025-084', montant_affaire: 310000, montant_enregistrement: 18600, date_envoie: '2025-11-20', state: 'Envoyé' },
    { id: 11, dossier_repertoir: 'REP-2025-083', montant_affaire: 520000, montant_enregistrement: 31200, date_envoie: '2025-11-05', state: 'Annulé' },
    { id: 12, dossier_repertoir: 'REP-2025-082', montant_affaire: 88000, montant_enregistrement: 5280, date_envoie: '2025-10-28', state: 'Validé' },
    { id: 13, dossier_repertoir: 'REP-2025-081', montant_affaire: 2100000, montant_enregistrement: 126000, date_envoie: '2025-10-15', state: 'Cloturé' },
  ],
  TGR: [
    { id: 1, numeroDemande: 'TGR-2026-00201', dossier_repertoir: 'REP-2026-001', date_envoie: '2026-01-06', state: 'valide' },
    { id: 2, numeroDemande: 'TGR-2026-00198', dossier_repertoir: 'REP-2026-002', date_envoie: '2026-01-11', state: 'envoye' },
    { id: 3, numeroDemande: 'TGR-2026-00175', dossier_repertoir: 'REP-2026-003', date_envoie: null, state: 'bruillon' },
    { id: 4, numeroDemande: 'TGR-2026-00160', dossier_repertoir: 'REP-2026-004', date_envoie: '2026-01-19', state: 'valide' },
    { id: 5, numeroDemande: 'TGR-2026-00144', dossier_repertoir: 'REP-2026-005', date_envoie: '2026-01-23', state: 'annule' },
    { id: 6, numeroDemande: 'TGR-2025-01088', dossier_repertoir: 'REP-2025-088', date_envoie: '2025-12-16', state: 'cloture' },
    { id: 7, numeroDemande: 'TGR-2025-01044', dossier_repertoir: 'REP-2025-087', date_envoie: '2025-12-09', state: 'expediton_envoye' },
    { id: 8, numeroDemande: 'TGR-2025-00998', dossier_repertoir: 'REP-2025-086', date_envoie: null, state: 'bruillon' },
    { id: 9, numeroDemande: 'TGR-2025-00950', dossier_repertoir: 'REP-2025-085', date_envoie: '2025-12-01', state: 'cloture' },
    { id: 10, numeroDemande: 'TGR-2025-00910', dossier_repertoir: 'REP-2025-084', date_envoie: '2025-11-21', state: 'envoye' },
    { id: 11, numeroDemande: 'TGR-2025-00875', dossier_repertoir: 'REP-2025-083', date_envoie: '2025-11-06', state: 'annule' },
    { id: 12, numeroDemande: 'TGR-2025-00840', dossier_repertoir: 'REP-2025-082', date_envoie: '2025-10-29', state: 'valide' },
    { id: 13, numeroDemande: 'TGR-2025-00801', dossier_repertoir: 'REP-2025-081', date_envoie: '2025-10-16', state: 'expediton_envoye' },
    { id: 14, numeroDemande: 'TGR-2025-00770', dossier_repertoir: 'REP-2025-080', date_envoie: '2025-10-02', state: 'cloture' },
  ],
  DAAMSAKAN: [
    { id: 1, demande_ref: 'DAM-2026-1001', nom_beneficier: 'Hassan Idrissi', namepromoteur: 'Addoha', state: 'valider' },
    { id: 2, demande_ref: 'DAM-2026-1002', nom_beneficier: 'Fatima Zahra Ouali', namepromoteur: 'CGI', state: 'aide_recu' },
    { id: 3, demande_ref: 'DAM-2026-1003', nom_beneficier: 'Youssef Berrada', namepromoteur: 'Alliances', state: 'Brouillon' },
    { id: 4, demande_ref: 'DAM-2026-1004', nom_beneficier: 'Khadija Moussaoui', namepromoteur: 'Douja Promotion', state: 'en_cours' },
    { id: 5, demande_ref: 'DAM-2026-1005', nom_beneficier: 'Mohamed Amine Lahlou', namepromoteur: 'Addoha', state: 'Affecter' },
    { id: 6, demande_ref: 'DAM-2025-0988', nom_beneficier: 'Aicha Bensalah', namepromoteur: 'CGI', state: 'rejeter' },
    { id: 7, demande_ref: 'DAM-2025-0975', nom_beneficier: 'Abdelilah Rhazi', namepromoteur: 'Tgcc Immobilier', state: 'Clôturée' },
    { id: 8, demande_ref: 'DAM-2025-0960', nom_beneficier: 'Nadia Ould Braham', namepromoteur: 'Alliances', state: 'revision' },
    { id: 9, demande_ref: 'DAM-2025-0944', nom_beneficier: 'Rachid El Mansouri', namepromoteur: 'Addoha', state: 'aide_recu' },
    { id: 10, demande_ref: 'DAM-2025-0930', nom_beneficier: 'Zineb Hamdaoui', namepromoteur: 'Douja Promotion', state: 'valider' },
    { id: 11, demande_ref: 'DAM-2025-0915', nom_beneficier: 'Brahim Ouazzani', namepromoteur: 'CGI', state: 'demande_restituion' },
    { id: 12, demande_ref: 'DAM-2025-0901', nom_beneficier: 'Siham Bekkali', namepromoteur: 'Tgcc Immobilier', state: 'restituion_valider' },
    { id: 13, demande_ref: 'DAM-2025-0888', nom_beneficier: 'Omar Bensouda', namepromoteur: 'Alliances', state: 'expire' },
    { id: 14, demande_ref: 'DAM-2025-0872', nom_beneficier: 'Houda El Alaoui', namepromoteur: 'Addoha', state: 'Annuler' },
    { id: 15, demande_ref: 'DAM-2025-0855', nom_beneficier: 'Tariq Benjelloun', namepromoteur: 'Douja Promotion', state: 'demande_cloture' },
  ],
};

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

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

/** KPI Card */
function KpiCard({ icon, count, label, accentColor, bgColor }) {
  return (
    <View style={[s.kpiCard, { borderTopColor: accentColor }]}>
      <View style={[s.kpiIconWrap, { backgroundColor: bgColor }]}>{icon}</View>
      <Text style={s.kpiCount}>{count}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

/** Stacked horizontal bar for institutions */
function InstBar({ name, stats }) {
  const total = stats.t || 1;
  return (
    <View style={s.instRow}>
      <View style={s.instMeta}>
        <Text style={s.instName}>{name}</Text>
        <Text style={s.instTotal}>{stats.t} dossiers</Text>
      </View>
      <View style={s.instTrack}>
        {stats.s > 0 && <View style={[s.instSeg, { flex: stats.s, backgroundColor: C.success }]} />}
        {stats.p > 0 && <View style={[s.instSeg, { flex: stats.p, backgroundColor: C.warn }]} />}
        {stats.d > 0 && <View style={[s.instSeg, { flex: stats.d, backgroundColor: C.danger }]} />}
      </View>
      <View style={s.instLegend}>
        <Text style={[s.instLegText, { color: C.success }]}>{stats.s} validés</Text>
        <Text style={[s.instLegText, { color: C.warn }]}>{stats.p} en cours</Text>
        <Text style={[s.instLegText, { color: C.danger }]}>{stats.d} bloqués</Text>
      </View>
    </View>
  );
}

/** Alert row */
function AlertRow({ code, client, source, urgent }) {
  return (
    <View style={s.alertCard}>
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
    </View>
  );
}

/** Mini evolution bar chart */
function EvolChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const BAR_H = 60;
  return (
    <View style={s.evolWrap}>
      {data.map((d, i) => (
        <View key={i} style={s.evolCol}>
          <View style={[s.evolBar, { height: Math.max(4, Math.round((d.value / max) * BAR_H)) }]} />
          <Text style={s.evolLabel}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** Donut Chart Section */
const DonutChartSection = ({ stats }) => {
  const donutData = [
    { value: stats.dgi.t || 1, color: '#3D6795', text: 'DGI', focused: true },
    { value: stats.tgr.t || 1, color: '#6366f1', text: 'TGR' },
    { value: stats.daamsakan.t || 1, color: '#ec4899', text: 'DAAM SAKAN' },
  ];

  return (
    <View style={s.donutCard}>
      <Text style={s.sectionTitle}>Répartition des Dossiers</Text>

      <View style={s.chartRow}>
        <PieChart
          donut
          radius={70}
          innerRadius={50}
          data={donutData}
          innerCircleColor={C.surface}
          centerLabelComponent={() => {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s.centerNumber}>{stats.total}</Text>
                <Text style={s.centerText}>TOTAL</Text>
              </View>
            );
          }}
        />

        <View style={s.legendColumn}>
          <LegendItemPie color="#3D6795" label="DGI" count={stats.dgi.t} />
          <LegendItemPie color="#6366f1" label="TGR" count={stats.tgr.t} />
          <LegendItemPie color="#ec4899" label="DAAM SAKAN" count={stats.daamsakan.t} />
        </View>
      </View>
    </View>
  );
};

const LegendItemPie = ({ color, label, count }) => (
  <View style={s.donutLegendItem}>
    <View style={[s.donutDot, { backgroundColor: color }]} />
    <View>
      <Text style={s.donutLegendLabel}>{label}</Text>
      <Text style={s.donutLegendCount}>{count} dossiers</Text>
    </View>
  </View>
);

// ─── MAIN SCREEN ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [data] = useState(MOCK_DATA);

  const stats = useMemo(() => {
    const dgi = getServiceStats(data.DGI);
    const tgr = getServiceStats(data.TGR);
    const daamsakan = getServiceStats(data.DAAMSAKAN);
    const total = dgi.t + tgr.t + daamsakan.t;
    const success = dgi.s + tgr.s + daamsakan.s;
    const pending = dgi.p + tgr.p + daamsakan.p;
    const alerts = dgi.d + tgr.d + daamsakan.d;
    const pct = Math.round((success / total) * 100);

    const totalAmount = [...data.DGI].reduce((a, i) => a + i.montant_affaire, 0);

    const allAlerts = [
      ...data.DGI.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.dossier_repertoir, client: 'Client DGI', source: 'DGI', urgent: i.state === 'Annulé' })),
      ...data.TGR.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.numeroDemande, client: 'Redevable TGR', source: 'TGR', urgent: i.state === 'annule' })),
      ...data.DAAMSAKAN.filter(i => ALERT_STATES.includes(i.state))
        .map(i => ({ code: i.demande_ref, client: i.nom_beneficier, source: 'DAAM SAKAN', urgent: ['Annuler', 'expire'].includes(i.state) })),
    ].slice(0, 5);

    // Evolution par mois (DGI)
    const map = {};
    data.DGI.forEach(i => {
      if (!i.date_envoie) return;
      const m = i.date_envoie.slice(5, 7) + '/' + i.date_envoie.slice(2, 4);
      map[m] = (map[m] || 0) + 1;
    });
    const evolData = Object.keys(map).sort().map(k => ({ label: k, value: map[k] }));

    return { dgi, tgr, daamsakan, total, success, pending, alerts, pct, totalAmount, allAlerts, evolData };
  }, [data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArAPMGNvxg60UJvYYDvWfEWW9G202fSLHLOGogCh_0t4KchwwwzHytacNtvbx-yjVoOVRsEHclf9jZN3j_02i5oL6zdCn6Voi8r5J3v7pGeNgMKksmKnXhgYn8q_wyYwCer0hyDntKlTlEbYqHNjL9kqD0FWD8-JDXuRqNRhjcWlfUrSKSEXmaWdgBOj0NynvxNuesboY3GXMIAtw0KY8ub7Is805x2K2zclV5GSnci06DIwGg4NY5mLEitPuQm5IdQ4UvptvGMo' }}
            style={s.avatar}
          />
          <View>
            <Text style={s.headerGreet}>Bonjour, Maître</Text>
            <Text style={s.headerSub}>Tableau de bord de l'étude</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellWrap}>
          <Bell color={C.navyMid} size={22} />
          {stats.alerts > 0 && <View style={s.bellDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.navyMid} />}
      >

        {/* ── HERO AMOUNT ── */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Montant total des affaires (DGI)</Text>
          <Text style={s.heroAmount}>{fmtAmount(stats.totalAmount)} MAD</Text>
          <View style={s.heroRow}>
            <TrendingUp size={12} color={C.success} />
            <Text style={s.heroSub}> {stats.total} dossiers · {stats.pct}% de réussite</Text>
          </View>
        </View>

        {/* ── SUMMARY MINI CARDS ── */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>{stats.total}</Text>
            <Text style={s.summaryLabel}>Dossiers</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>{stats.pct}%</Text>
            <Text style={s.summaryLabel}>De réussite</Text>
          </View>
        </View>

        {/* ── DONUT CHART ── */}
        <DonutChartSection stats={stats} />

        {/* ── KPI CARDS ── */}
        <View style={s.kpiRow}>
          <KpiCard
            icon={<CheckCircle2 size={18} color={C.success} />}
            count={stats.success} label="Terminé"
            accentColor={C.success} bgColor={C.successBg}
          />
          <KpiCard
            icon={<Clock3 size={18} color={C.warn} />}
            count={stats.pending} label="En cours"
            accentColor={C.warn} bgColor={C.warnBg}
          />
          <KpiCard
            icon={<AlertTriangle size={18} color={C.danger} />}
            count={stats.alerts} label="Bloqué"
            accentColor={C.danger} bgColor={C.dangerBg}
          />
        </View>

        {/* ── PROGRESS ── */}
        <View style={s.card}>
          <View style={s.progressHead}>
            <Text style={s.sectionTitle}>Taux de réussite</Text>
            <Text style={s.pctValue}>{stats.pct}%</Text>
          </View>
          <View style={s.track}>
            <View style={[s.trackFill, { width: `${stats.pct}%` }]} />
          </View>
          <View style={s.progressFoot}>
            <Text style={s.progressFootText}>{stats.total} dossiers au total</Text>
            <Text style={[s.progressFootText, { color: C.success }]}>{stats.success} validés</Text>
          </View>
        </View>

        {/* ── PAR INSTITUTION ── */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Analyse par institution</Text>
          <View style={s.legend}>
            {[['Validé', C.success], ['En cours', C.warn], ['Bloqué', C.danger]].map(([l, c]) => (
              <View key={l} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: c }]} />
                <Text style={s.legendText}>{l}</Text>
              </View>
            ))}
          </View>
          <InstBar name="DGI" stats={stats.dgi} />
          <InstBar name="TGR" stats={stats.tgr} />
          <InstBar name="DAAM SAKAN" stats={stats.daamsakan} />
        </View>

        {/* ── ÉVOLUTION DGI ── */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Évolution des dossiers DGI</Text>
          <EvolChart data={stats.evolData} />
        </View>

        {/* ── ALERTES ── */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Alertes critiques</Text>
          {stats.allAlerts.length === 0
            ? <Text style={{ color: C.muted, fontSize: 13 }}>Aucune alerte critique.</Text>
            : stats.allAlerts.map((a, i) => <AlertRow key={i} {...a} />)
          }
        </View>

      </ScrollView>
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: C.navyLight },
  headerGreet: { fontSize: 26, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, fontWeight: '900', color: C.muted, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  bellWrap: { position: 'relative', padding: 4 },
  bellDot: {
    position: 'absolute', top: 4, right: 4, width: 10, height: 10,
    borderRadius: 5, backgroundColor: C.danger, borderWidth: 2, borderColor: C.surface
  },

  scroll: { padding: 16, paddingBottom: 32 },

  // Hero
  heroCard: {
    backgroundColor: C.navy, borderRadius: 16, padding: 22, marginBottom: 16,
    shadowColor: '#1a2e44', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  heroLabel: { fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  heroAmount: { fontSize: 40, fontWeight: '900', color: '#fff', marginTop: 4, letterSpacing: -1.5 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  heroSub: { fontSize: 14, fontWeight: '900', color: 'rgba(255,255,255,0.8)' },

  // Summary Cards
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: C.navyLight, borderRadius: 14, padding: 18, alignItems: 'center',
    shadowColor: '#1a2e44', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  summaryValue: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  summaryLabel: { fontSize: 15, fontWeight: '900', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  // KPI
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderTopWidth: 4,
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  kpiIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiCount: { fontSize: 28, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  kpiLabel: { fontSize: 14, fontWeight: '900', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  // Card
  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 16,
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 14, letterSpacing: -0.3 },

  // Progress
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  pctValue: { fontSize: 32, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  track: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: C.navyLight, borderRadius: 4 },
  progressFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  progressFootText: { fontSize: 13, fontWeight: '900', color: C.muted },

  // Legend
  legend: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 12, fontWeight: '900', color: C.muted },

  // Inst bar
  instRow: { marginBottom: 20 },
  instMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  instName: { fontSize: 16, fontWeight: '900', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  instTotal: { fontSize: 14, fontWeight: '900', color: C.muted },
  instTrack: { height: 10, borderRadius: 5, backgroundColor: C.border, overflow: 'hidden', flexDirection: 'row' },
  instSeg: { height: '100%' },
  instLegend: { flexDirection: 'row', gap: 12, marginTop: 6 },
  instLegText: { fontSize: 11, fontWeight: '900' },

  // Evolution
  evolWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 },
  evolCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 90 },
  evolBar: { width: '100%', backgroundColor: C.navyLight, borderRadius: 4, opacity: 0.9 },
  evolLabel: { fontSize: 10, fontWeight: '900', color: C.muted, marginTop: 4, textAlign: 'center' },

  // Alert
  alertCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(226, 232, 241, 0.4)',
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  alertLeft: { flex: 1, gap: 4 },
  alertCode: { fontSize: 15, fontWeight: '900', color: C.navy, letterSpacing: -0.2 },
  alertClient: { fontSize: 13, fontWeight: '900', color: C.muted },
  sourcePill: { backgroundColor: C.surface2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sourcePillText: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 0.5 },
  alertBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  alertBadgeText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Donut Chart
  donutCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 16,
    shadowColor: '#1a2e44', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  centerNumber: { fontSize: 24, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  centerText: { fontSize: 10, fontWeight: '900', color: C.muted, textTransform: 'uppercase' },
  legendColumn: { justifyContent: 'center', gap: 12 },
  donutLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  donutDot: { width: 12, height: 12, borderRadius: 4 },
  donutLegendLabel: { fontSize: 13, fontWeight: '900', color: C.navy },
  donutLegendCount: { fontSize: 11, fontWeight: '900', color: C.muted, marginTop: 2 },
});