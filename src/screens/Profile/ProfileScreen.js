import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const isPremium = user?.premium?.isActive;
  const premiumEndDate = user?.premium?.expiresAt 
    ? new Date(user.premium.expiresAt).toLocaleDateString('vi-VN')
    : null;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={20} color={COLORS.secondary} />
            </View>
          )}
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Premium Info */}
        {isPremium ? (
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardHeader}>
              <Ionicons name="star" size={32} color={COLORS.secondary} />
              <View style={styles.premiumCardText}>
                <Text style={styles.premiumCardTitle}>Premium {user?.premium?.package || 'Active'}</Text>
                <Text style={styles.premiumCardSubtitle}>
                  Hết hạn: {premiumEndDate}
                </Text>
              </View>
            </View>
            <View style={styles.premiumFeatures}>
              <Text style={styles.premiumFeatureText}>
                ⚡ +{Math.round((user?.premium?.scoreBonus || 0) * 100)}% điểm quân cờ
              </Text>
              <Text style={styles.premiumFeatureText}>
                ❤️ {user?.premium?.revivesLeft || 0} lượt hồi sinh còn lại
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => navigation.navigate('Shop')}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeBannerGradient}
            >
              <Ionicons name="star" size={32} color={COLORS.white} />
              <Text style={styles.upgradeBannerText}>Nâng cấp Premium</Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống Kê</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.stats?.totalGames || 0}</Text>
              <Text style={styles.statLabel}>Tổng Ván</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.stats?.highestScore || 0}</Text>
              <Text style={styles.statLabel}>Điểm Cao Nhất</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.stats?.averageScore || 0}</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.menuItemText}>Lịch Sử Game</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Transactions')}
          >
            <Ionicons name="receipt" size={24} color={COLORS.primary} />
            <Text style={styles.menuItemText}>Lịch Sử Giao Dịch</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color={COLORS.error} />
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    padding: 30,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 15
  },
  email: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 5
  },
  content: {
    padding: 20
  },
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  premiumCardText: {
    marginLeft: 15,
    flex: 1
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  premiumCardSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 5
  },
  premiumFeatures: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.background
  },
  premiumFeatureText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8
  },
  upgradeBanner: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  upgradeBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20
  },
  upgradeBannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    marginLeft: 15
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    width: '32%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 5
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginLeft: 15
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.error
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 10
  },
  version: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 20
  }
});

