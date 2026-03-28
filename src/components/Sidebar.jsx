import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const ROLE_LABEL = {
  admin: 'Administrador',
  professor: 'Professor',
  atleta: 'Atleta',
};

const NAV_ITEMS = {
  atleta: [
    { label: 'Início', icon: 'home' },
    { label: 'Meus Treinos', icon: 'activity' },
    { label: 'Check-in', icon: 'check-circle' },
    { label: 'Mensalidades', icon: 'credit-card' },
    { label: 'Feed', icon: 'rss' },
  ],
  professor: [
    { label: 'Início', icon: 'home' },
    { label: 'Chamada', icon: 'clipboard' },
    { label: 'Grade de Treinos', icon: 'calendar' },
    { label: 'Feed', icon: 'rss' },
  ],
  admin: [
    { label: 'Início', icon: 'home' },
    { label: 'Dashboard', icon: 'bar-chart-2' },
    { label: 'Atletas', icon: 'users' },
    { label: 'Treinos', icon: 'activity' },
    { label: 'Financeiro', icon: 'dollar-sign' },
    { label: 'Feed', icon: 'rss' },
  ],
};

export default function Sidebar({ onClose }) {
  const { user, role, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Início');

  async function handleLogout() {
    onClose?.();
    await logout();
  }

  function handlePress(label) {
    setActiveItem(label);
    onClose?.();
  }

  const items = NAV_ITEMS[role] ?? [{ label: 'Início', icon: 'home' }];

  return (
    <SafeAreaView style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>SET</Text>
        <Text style={styles.logoSub}>Volleyball</Text>
      </View>

      {/* Navegação */}
      <View style={styles.nav}>
        {items.map(({ label, icon }) => {
          const isActive = activeItem === label;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handlePress(label)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Feather
                  name={icon}
                  size={16}
                  color={isActive ? '#000000' : '#FACC15'}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Perfil no rodapé */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{ROLE_LABEL[role] ?? role}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={14} color="#374151" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    marginBottom: 12,
  },
  logoText: {
    color: '#FACC15',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 6,
  },
  logoSub: {
    color: '#374151',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  nav: {
    flex: 1,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginBottom: 2,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#111111',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerActive: {
    backgroundColor: '#FACC15',
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    color: '#FACC15',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FACC15',
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#111111',
    marginBottom: 20,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 5,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#4B5563',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
});
