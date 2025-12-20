import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gameAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';
import { optimizeFlatList } from '../../utils/performanceUtils';

// Memoized components to prevent unnecessary re-renders
const RankBadge = React.memo(({ rank }) => {
  if (rank === 1) {
    return (
      <View style={[styles.rankBadge, styles.goldBadge]}>
        <Ionicons name="trophy" size={20} color="#FFD700" />
      </View>
    );
  } else if (rank === 2) {
    return (
      <View style={[styles.rankBadge, styles.silverBadge]}>
        <Ionicons name="trophy" size={20} color="#C0C0C0" />
      </View>
    );
  } else if (rank === 3) {
    return (
      <View style={[styles.rankBadge, styles.bronzeBadge]}>
        <Ionicons name="trophy" size={20} color="#CD7F32" />
      </View>
    );
  } else {
    return (
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
    );
  }
});

const LeaderboardItem = React.memo(({ item, index, isCurrentUser }) => {
  const rank = item.rank || index + 1;

  return (
    <View style={[
      styles.leaderboardItem,
      isCurrentUser && styles.currentUserItem
    ]}>
      <RankBadge rank={rank} />
      
      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <Text style={[
            styles.playerName,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.username}
          </Text>
          {item.isPremium && (
            <View style={styles.premiumBadgeSmall}>
              <Ionicons name="star" size={14} color={COLORS.secondary} />
            </View>
          )}
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>Bạn</Text>
            </View>
          )}
        </View>
        <Text style={styles.playerStats}>
          {item.totalGames || 0} ván chơi
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[
          styles.scoreText,
          isCurrentUser && styles.currentUserText
        ]}>
          {item.highestScore?.toLocaleString() || 0}
        </Text>
        <Text style={styles.scoreLabel}>điểm</Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.item.userId === nextProps.item.userId &&
    prevProps.item.highestScore === nextProps.item.highestScore &&
    prevProps.isCurrentUser === nextProps.isCurrentUser
  );
});

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [period, setPeriod] = useState('all');
  const [limit, setLimit] = useState(100);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const currentLimit = isLoadMore ? limit + 50 : limit;
      const response = await gameAPI.getLeaderboard(currentLimit, period);
      const data = response.data.data;

      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.currentUser || null);
      setLimit(currentLimit);
      
      // Check if there are more items to load
      setHasMore(data.leaderboard?.length >= currentLimit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setLimit(100);
    await fetchLeaderboard();
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLeaderboard(true);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, period === 'all' && styles.periodButtonActive]}
        onPress={() => setPeriod('all')}
      >
        <Text style={[styles.periodText, period === 'all' && styles.periodTextActive]}>
          Tất Cả
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, period === 'monthly' && styles.periodButtonActive]}
        onPress={() => setPeriod('monthly')}
      >
        <Text style={[styles.periodText, period === 'monthly' && styles.periodTextActive]}>
          Tháng
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, period === 'weekly' && styles.periodButtonActive]}
        onPress={() => setPeriod('weekly')}
      >
        <Text style={[styles.periodText, period === 'weekly' && styles.periodTextActive]}>
          Tuần
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, period === 'daily' && styles.periodButtonActive]}
        onPress={() => setPeriod('daily')}
      >
        <Text style={[styles.periodText, period === 'daily' && styles.periodTextActive]}>
          Hôm Nay
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Memoize render functions to prevent recreation
  const renderLeaderboardItem = useCallback(({ item, index }) => {
    const isCurrentUser = user && item.userId === user.id;
    return <LeaderboardItem item={item} index={index} isCurrentUser={isCurrentUser} />;
  }, [user]);

  // Memoize key extractor
  const keyExtractor = useCallback((item, index) => `${item.userId}-${index}`, []);

  // Memoize getItemLayout for better performance
  const getItemLayout = useCallback((data, index) => ({
    length: 80, // Approximate item height
    offset: 80 * index,
    index
  }), []);

  // Optimize FlatList props
  const flatListProps = useMemo(() => optimizeFlatList({
    itemHeight: 80,
    screenHeight: 800
  }), []);

  const renderCurrentUserCard = () => {
    if (!currentUserRank || !user) return null;

    return (
      <View style={styles.currentUserCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.currentUserGradient}
        >
          <View style={styles.currentUserContent}>
            <View style={styles.currentUserLeft}>
              <Text style={styles.currentUserRankLabel}>Hạng của bạn</Text>
              <Text style={styles.currentUserRankValue}>
                #{currentUserRank.rank || '-'}
              </Text>
            </View>
            <View style={styles.currentUserRight}>
              <Text style={styles.currentUserScoreLabel}>Điểm cao nhất</Text>
              <Text style={styles.currentUserScoreValue}>
                {currentUserRank.highestScore?.toLocaleString() || 0}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {renderCurrentUserCard()}
      {renderPeriodSelector()}
      <View style={styles.headerDivider} />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
      <Text style={styles.emptySubtext}>
        Hãy chơi game để xuất hiện trên bảng xếp hạng!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Ionicons name="trophy" size={32} color={COLORS.white} />
        <Text style={styles.headerTitle}>Bảng Xếp Hạng</Text>
      </LinearGradient>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        {...flatListProps}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={leaderboard.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight
  },
  currentUserCard: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  currentUserGradient: {
    padding: 20
  },
  currentUserContent: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  currentUserLeft: {
    flex: 1
  },
  currentUserRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  currentUserRankLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9
  },
  currentUserRankValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 5
  },
  currentUserScoreLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9
  },
  currentUserScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 5
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary
  },
  periodText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600'
  },
  periodTextActive: {
    color: COLORS.white
  },
  headerDivider: {
    height: 10
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  currentUserItem: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: COLORS.secondary
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  goldBadge: {
    backgroundColor: '#FFF8DC'
  },
  silverBadge: {
    backgroundColor: '#F5F5F5'
  },
  bronzeBadge: {
    backgroundColor: '#FFF0E0'
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  },
  playerInfo: {
    flex: 1
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  },
  currentUserText: {
    color: COLORS.primary
  },
  premiumBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary
  },
  youBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white
  },
  playerStats: {
    fontSize: 12,
    color: COLORS.textLight
  },
  scoreContainer: {
    alignItems: 'flex-end'
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  footerLoaderText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textLight
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyList: {
    flexGrow: 1
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40
  }
});
