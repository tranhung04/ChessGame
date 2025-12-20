import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

export default function HomeScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    updateUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await updateUser();
    setRefreshing(false);
  };

  const isPremium = user?.premium?.isActive || false;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.welcomeText}>Xin chào!</Text>
        <Text style={styles.username}>{user?.username}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Thống Kê</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.totalGames || 0}</Text>
              <Text style={styles.statLabel}>Tổng Ván</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.highestScore || 0}</Text>
              <Text style={styles.statLabel}>Điểm Cao Nhất</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.averageScore || 0}</Text>
              <Text style={styles.statLabel}>Điểm Trung Bình</Text>
            </View>
          </View>
        </View>

        {/* Main Actions */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation.navigate('Game')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.playButtonGradient}
          >
            <Ionicons name="game-controller" size={32} color={COLORS.white} />
            <Text style={styles.playButtonText}>Chơi Ngay</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy" size={40} color={COLORS.secondary} />
            <Text style={styles.actionText}>Bảng Xếp Hạng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Shop')}
          >
            <Ionicons name="cart" size={40} color={COLORS.secondary} />
            <Text style={styles.actionText}>Cửa Hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Promo */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumPromo}
            onPress={() => navigation.navigate('Shop')}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumPromoGradient}
            >
              <Ionicons name="star" size={32} color={COLORS.white} />
              <View style={styles.premiumPromoText}>
                <Text style={styles.premiumPromoTitle}>Nâng Cấp Premium</Text>
                <Text style={styles.premiumPromoSubtitle}>
                  Tăng điểm + Hồi sinh miễn phí
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}
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
    paddingTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.white,
    opacity: 0.9
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 5
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10
  },
  premiumText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  content: {
    padding: 20
  },
  statsCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 5
  },
  playButton: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 10
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center'
  },
  premiumPromo: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  premiumPromoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  premiumPromoText: {
    flex: 1,
    marginLeft: 15
  },
  premiumPromoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white
  },
  premiumPromoSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 5,
    opacity: 0.9
  }
});

