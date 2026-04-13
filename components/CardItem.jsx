import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── STATUS MAPPING ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  // Success states
  'validé':              { label: 'Validé',       color: '#27ae60', bg: '#eafaf1', icon: 'checkmark-circle' },
  'valide':              { label: 'Validé',       color: '#27ae60', bg: '#eafaf1', icon: 'checkmark-circle' },
  'valider':             { label: 'Validé',       color: '#27ae60', bg: '#eafaf1', icon: 'checkmark-circle' },
  'cloturé':             { label: 'Clôturé',      color: '#2980b9', bg: '#ebf5fb', icon: 'lock-closed' },
  'cloture':             { label: 'Clôturé',      color: '#2980b9', bg: '#ebf5fb', icon: 'lock-closed' },
  'clôturée':            { label: 'Clôturée',     color: '#2980b9', bg: '#ebf5fb', icon: 'lock-closed' },
  'aide_recu':           { label: 'Aide reçue',   color: '#27ae60', bg: '#eafaf1', icon: 'cash-outline' },
  'restituion_valider':  { label: 'Restitution validée', color: '#27ae60', bg: '#eafaf1', icon: 'checkmark-done' },
  'restituion_effectuer':{ label: 'Restitution effectuée', color: '#27ae60', bg: '#eafaf1', icon: 'checkmark-done' },

  // Pending states
  'brouillon':           { label: 'Brouillon',    color: '#7f8c8d', bg: '#f2f3f4', icon: 'create-outline' },
  'bruillon':            { label: 'Brouillon',    color: '#7f8c8d', bg: '#f2f3f4', icon: 'create-outline' },
  'envoyé':              { label: 'Envoyé',       color: '#2980b9', bg: '#ebf5fb', icon: 'send-outline' },
  'envoye':              { label: 'Envoyé',       color: '#2980b9', bg: '#ebf5fb', icon: 'send-outline' },
  'en_cours':            { label: 'En cours',     color: '#f39c12', bg: '#fef9e7', icon: 'time-outline' },
  'affecter':            { label: 'Affecté',      color: '#8e44ad', bg: '#f4ecf7', icon: 'person-add-outline' },
  'revision':            { label: 'En révision',  color: '#f39c12', bg: '#fef9e7', icon: 'refresh-outline' },
  'expediton_envoye':    { label: 'Expédié',      color: '#1abc9c', bg: '#e8f8f5', icon: 'airplane-outline' },
  'demande_restituion':  { label: 'Demande restitution', color: '#f39c12', bg: '#fef9e7', icon: 'return-down-back-outline' },
  'demande_cloture':     { label: 'Demande clôture', color: '#f39c12', bg: '#fef9e7', icon: 'close-circle-outline' },

  // Alert states
  'annulé':              { label: 'Annulé',       color: '#e74c3c', bg: '#fdedec', icon: 'close-circle' },
  'annule':              { label: 'Annulé',       color: '#e74c3c', bg: '#fdedec', icon: 'close-circle' },
  'annuler':             { label: 'Annulé',       color: '#e74c3c', bg: '#fdedec', icon: 'close-circle' },
  'rejeter':             { label: 'Rejeté',       color: '#e74c3c', bg: '#fdedec', icon: 'thumbs-down-outline' },
  'expire':              { label: 'Expiré',       color: '#e74c3c', bg: '#fdedec', icon: 'alert-circle' },
  'cloture_rejeter':     { label: 'Clôture rejetée', color: '#e74c3c', bg: '#fdedec', icon: 'close-circle' },
};

function getStatusConfig(state) {
  const key = state.toLowerCase();
  return STATUS_CONFIG[key] || { label: state, color: '#7f8c8d', bg: '#f2f3f4', icon: 'help-circle-outline' };
}

// ─── TYPE ACCENT COLORS ─────────────────────────────────────────────────────
const TYPE_COLORS = {
  DGI:      { accent: '#3d6795', accentBg: '#ebf0f7', stripColor: '#3d6795' },
  TGR:      { accent: '#3d6795', accentBg: '#ebf0f7', stripColor: '#3d6795' },
  DAAMSAKAN:{ accent: '#3d6795', accentBg: '#ebf0f7', stripColor: '#3d6795' },
};

const CardItem = ({ title, status, details, type }) => {
  const statusCfg = getStatusConfig(status);
  const typeCfg = TYPE_COLORS[type] || TYPE_COLORS.DGI;

  return (
    <View style={styles.card}>
      {/* Left colored strip */}
      <View style={[styles.leftStrip, { backgroundColor: typeCfg.stripColor }]} />

      {/* Top row: Title + Type badge */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeCfg.accentBg }]}>
              <Text style={[styles.typeBadgeText, { color: typeCfg.accent }]}>{type}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status badge — BIG and prominent */}
      <View style={[styles.statusContainer, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '30' }]}>
        <Ionicons name={statusCfg.icon} size={20} color={statusCfg.color} />
        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Details */}
      <View style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    paddingLeft: 22,
    marginBottom: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#1a2e44',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  leftStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  topRow: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a2e44',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Status — big and clear
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  separator: {
    height: 1,
    backgroundColor: '#e2e8f1',
    marginBottom: 14,
  },

  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailItem: {
    minWidth: '42%',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});

export default CardItem;
