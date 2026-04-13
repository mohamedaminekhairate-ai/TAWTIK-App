import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthContext';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function NotificationItem({ titre, message, date, unread, icon, iconColor }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationItem, unread && styles.unreadItem, expanded && styles.expandedItem]}
      activeOpacity={0.7}
      onPress={toggleExpand}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.titleText, unread && styles.unreadText]} numberOfLines={expanded ? undefined : 1}>
            {titre}
          </Text>
          <Text style={styles.timeText}>{formatDate(date)}</Text>
        </View>
        <Text style={[styles.descriptionText, expanded && { color: '#1f2937' }]} numberOfLines={expanded ? undefined : 2}>
          {message}
        </Text>
      </View>
      {unread && !expanded && <View style={styles.unreadDot} />}
      <Ionicons 
        name={expanded ? "chevron-up" : "chevron-down"} 
        size={16} 
        color="#9ca3af" 
        style={{ marginTop: 4 }} 
      />
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { notifications } = useAuth();
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerCount}>{unreadCount} non lues</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem {...item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 14,
  },
  unreadItem: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  expandedItem: {
    backgroundColor: '#f8fafc',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: '#000000',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
