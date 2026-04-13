import { createContext, useContext, useState } from 'react';

// ── Données du notaire connecté ──
const NOTAIRE_DATA = {
  nom: 'EL BITAR',
  prenom: 'Adil',
  conseil: 'Conseil régional des notaires de Casablanca',
  IF: '09090909',
};

// ── Notifications ──
const NOTIFICATIONS_DATA = [
  {
    id: '1',
    date: '2026-04-10T08:00:00Z',
    titre: 'Annuaire national des notaires',
    message:
      "Le Conseil National propose un formulaire pour renseigner l'annuaire des notaires du Maroc afin de mettre en place un annuaire national avec photos.",
    icon: 'book-outline',
    iconColor: '#4361ee',
    unread: true,
  },
  {
    id: '2',
    date: '2026-04-10T09:00:00Z',
    titre: 'Registre des procurations',
    message:
      'Prière de renseigner les informations pour le registre des procurations.',
    icon: 'document-text-outline',
    iconColor: '#f72585',
    unread: true,
  },
  {
    id: '3',
    date: '2026-04-10T10:00:00Z',
    titre: 'Expiration du mot de passe',
    message:
      'Votre mot de passe expire dans 2 jours. Prière de le changer.',
    icon: 'key-outline',
    iconColor: '#ff9f1c',
    unread: true,
  },
  {
    id: '4',
    date: '2026-04-10T11:00:00Z',
    titre: 'Assemblée générale – Agadir',
    message:
      "Le Conseil National des Notaires vous invite à l'Assemblée Générale qui se tiendra du 19 au 21 avril 2026 à Agadir. Prière de remplir le formulaire communiqué par mail.",
    icon: 'people-outline',
    iconColor: '#2ec4b6',
    unread: false,
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        notaire: NOTAIRE_DATA,
        notifications: NOTIFICATIONS_DATA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
