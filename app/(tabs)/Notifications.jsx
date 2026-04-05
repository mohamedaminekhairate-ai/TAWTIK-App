import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const notificationsData = [
  {
    id: '1',
    title: 'Nouveau dossier ajouté',
    description: 'Le dossier de M. Haddad a été créé avec succès.',
    time: 'Il y a 10 min',
    unread: true,
    icon: 'folder-open',
    iconColor: '#4361ee',
  },
  {
    id: '2',
    title: 'Incident urgent',
    description: 'Serveur principal hors ligne. Veuillez vérifier immédiatement.',
    time: 'Il y a 1 heure',
    unread: true,
    icon: 'warning',
    iconColor: '#f72585',
  },
  {
    id: '3',
    title: 'Sakam approuvé',
    description: 'Votre demande Sakam #4029 a été approuvée par le responsable.',
    time: 'Hier, 14:30',
    unread: false,
    icon: 'checkmark-circle',
    iconColor: '#2ec4b6',
  },
  {
    id: '4',
    title: 'Alerte de sécurité',
    description: 'Nouvelle connexion détectée sur un appareil non reconnu.',
    time: 'Hier, 09:15',
    unread: false,
    icon: 'shield-alert',
    iconColor: '#ff9f1c',
  },
  {
    id: '5',
    title: 'Mise à jour système',
    description: 'La version 2.4.0 est prête à être installée.',
    time: 'Mar',
    unread: false,
    icon: 'cloud-download',
    iconColor: '#7209b7',
  },
  {
    id: '6',
    title: 'Message du support',
    description: 'Votre ticket #992 a été résolu. Merci de votre patience.',
    time: 'Lun',
    unread: true,
    icon: 'chatbubble-ellipses',
    iconColor: '#2ec4b6',
  },
];

function NotificationItem({ title, description, time, unread, icon, iconColor }) {
  return (
    <TouchableOpacity style={[styles.notificationItem, unread && styles.unreadItem]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.titleText, unread && styles.unreadText]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {description}
        </Text>
      </View>
      {unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerCount}>{notificationsData.filter((n) => n.unread).length} non lues</Text>
      </View>
      <FlatList
        data={notificationsData}
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
    backgroundColor: '#f8f9fa',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
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
