import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const ROLE_LABEL = {
  admin: 'Administrador',
  professor: 'Professor',
  atleta: 'Atleta',
};

const ROUTES = {
  'Gerenciar Unidades': '/unidades',
  'Lista de planos': '/planos',
};

const NAV_STRUCTURE = {
  admin: [
    { label: 'Dashboard', icon: 'home' },
    {
      label: 'Alunos', icon: 'users', sub: [
        { label: 'Lista de alunos', icon: 'list' },
        { label: 'Novo aluno', icon: 'user-plus' },
      ],
    },
    {
      label: 'Planos', icon: 'clipboard', sub: [
        { label: 'Lista de planos', icon: 'list' },
      ],
    },
    {
      label: 'Financeiro', icon: 'dollar-sign', sub: [
        { label: 'Visão geral', icon: 'bar-chart-2' },
        { label: 'Nova Receita', icon: 'plus-circle' },
        { label: 'Nova Despesa', icon: 'minus-circle' },
        { label: 'Relatório por Unidade', icon: 'file-text' },
      ],
    },
    {
      label: 'Unidades', icon: 'map-pin', sub: [
        { label: 'Gerenciar Unidades', icon: 'settings' },
      ],
    },
    {
      label: 'Calendário', icon: 'calendar', sub: [
        { label: 'Agenda', icon: 'calendar' },
        { label: 'Grade de Horários', icon: 'clock' },
      ],
    },
    { label: 'Relatórios', icon: 'file-text' },
    { label: 'Feed', icon: 'rss' },
    {
      label: 'Competições', icon: 'award', sub: [
        { label: 'Lista de competições', icon: 'list' },
        { label: 'Nova competição', icon: 'plus-circle' },
        { label: 'Convocação', icon: 'send' },
      ],
    },
  ],
  professor: [
    { label: 'Início', icon: 'home' },
    { label: 'Chamada', icon: 'clipboard' },
    { label: 'Grade de Treinos', icon: 'calendar' },
    { label: 'Feed', icon: 'rss' },
  ],
  atleta: [
    { label: 'Início', icon: 'home' },
    { label: 'Meus Treinos', icon: 'activity' },
    { label: 'Check-in', icon: 'check-circle' },
    { label: 'Mensalidades', icon: 'credit-card' },
    { label: 'Feed', icon: 'rss' },
  ],
};

export default function Sidebar({ onClose }) {
  const { user, role, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [openGroup, setOpenGroup] = useState(null);

  async function handleLogout() {
    onClose?.();
    await logout();
  }

  function handleItemPress(label) {
    setActiveItem(label);
    onClose?.();
  }

  function toggleGroup(label) {
    setOpenGroup(openGroup === label ? null : label);
  }

  const items = NAV_STRUCTURE[role] ?? NAV_STRUCTURE.atleta;

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.logoContainer}>
        {/*         <Image
          source={require('../../assets/set-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
      </View>

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = activeItem === item.label;
          const isOpen = openGroup === item.label;

          if (item.sub) {
            return (
              <View key={item.label}>
                <TouchableOpacity
                  style={[styles.navItem, isOpen && styles.navItemOpen]}
                  onPress={() => toggleGroup(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, isOpen && styles.iconContainerActive]}>
                    <Feather name={item.icon} size={15} color={isOpen ? '#000' : '#FACC15'} />
                  </View>
                  <Text style={[styles.navLabel, isOpen && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                  <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={isOpen ? '#FACC15' : '#374151'}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.submenu}>
                    {item.sub.map((sub) => {
                      const isSubActive = activeItem === sub.label;
                      return (
                        <TouchableOpacity
                          key={sub.label}
                          style={[styles.subItem, isSubActive && styles.subItemActive]}
                          onPress={() => handleItemPress(sub.label)}
                          activeOpacity={0.7}
                        >
                          <Feather name={sub.icon} size={13} color={isSubActive ? '#FACC15' : '#4B5563'} />
                          <Text style={[styles.subLabel, isSubActive && styles.subLabelActive]}>
                            {sub.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleItemPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Feather name={item.icon} size={15} color={isActive ? '#000' : '#FACC15'} />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{ROLE_LABEL[role] ?? role}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={13} color="#374151" />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 48,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginBottom: 1,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#111111',
  },
  navItemOpen: {
    backgroundColor: '#0D0D0D',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#FACC15',
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 13,
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
  submenu: {
    marginLeft: 22,
    marginBottom: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#1a1a1a',
    paddingLeft: 16,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 1,
  },
  subItemActive: {
    backgroundColor: '#111111',
  },
  subLabel: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '400',
  },
  subLabelActive: {
    color: '#FACC15',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#111111',
    marginBottom: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 6,
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
    fontSize: 12,
    fontWeight: '500',
  },
});
