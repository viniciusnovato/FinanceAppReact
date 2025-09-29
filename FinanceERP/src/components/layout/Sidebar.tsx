import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeRoute: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  section?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: 'analytics-outline', route: 'Dashboard', section: 'principal' },
  { id: 'clients', title: 'Clientes', icon: 'people-outline', route: 'Clients', section: 'gestao' },
  { id: 'contracts', title: 'Contratos', icon: 'document-text-outline', route: 'Contracts', section: 'gestao' },
  { id: 'payments', title: 'Pagamentos', icon: 'card-outline', route: 'Payments', section: 'gestao' },
];

const sectionTitles = {
  principal: 'Principal',
  gestao: 'Gestão',
  configuracoes: 'Configurações'
};

const Sidebar: React.FC<SidebarProps> = React.memo(({ activeRoute }) => {
  const navigation = useNavigation();
  const { logout, user, isLoading } = useAuth();

  const handleMenuPress = useCallback((route: string) => {
    navigation.navigate(route as never);
  }, [navigation]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const renderMenuSection = useCallback((sectionKey: string) => {
    const sectionItems = menuItems.filter(item => item.section === sectionKey);
    if (sectionItems.length === 0) return null;

    return (
      <View key={sectionKey} style={styles.menuSection}>
        <Text style={styles.sectionTitle}>{sectionTitles[sectionKey as keyof typeof sectionTitles]}</Text>
        {sectionItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeRoute === item.route && styles.activeMenuItem,
            ]}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={item.icon}
                size={20}
                color={activeRoute === item.route ? '#FFFFFF' : '#8B9DC3'}
                style={styles.menuIcon}
              />
            </View>
            <Text
              style={[
                styles.menuText,
                activeRoute === item.route && styles.activeMenuText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [activeRoute, handleMenuPress]);

  return (
    <View style={styles.sidebar}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="business-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>FinanceERP</Text>
            <Text style={styles.logoSubtext}>Sistema de Gestão</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {renderMenuSection('principal')}
        {renderMenuSection('gestao')}
        {renderMenuSection('configuracoes')}
      </ScrollView>

      {/* User Info & Logout */}
      {!isLoading && (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
              <Text style={styles.userRole}>Administrador</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#DC3545" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#1E293B',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  logoSubtext: {
    fontSize: 11,
    color: '#8B9DC3',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menu: {
    flex: 1,
    paddingTop: 8,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  activeMenuItem: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    // Ícone já estilizado via props
  },
  menuText: {
    fontSize: 14,
    color: '#8B9DC3',
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 1,
  },
  activeMenuText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#0F172A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#8B9DC3',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  logoutText: {
    fontSize: 13,
    color: '#DC3545',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Sidebar;