import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gameAPI } from '../../services/api';
import { COLORS } from '../../config/constants';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await gameAPI.getHistory(pageNum, 10);
      const { sessions: newSessions, pagination } = response.data.data;

      if (pageNum === 1) {
        setSessions(newSessions);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
      }

      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory(1);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadHistory(page + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionMode}>
            {item.mode === 'premium' ? '⭐ Premium' : '🎮 Normal'}
          </Text>
          <Text style={styles.sessionDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Điểm</Text>
          <Text style={styles.scoreValue}>{item.finalScore || item.score}</Text>
        </View>
      </View>

      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Ionicons name="game-controller" size={16} color={COLORS.textLight} />
          <Text style={styles.statText}>{item.turnCount} lượt</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={COLORS.textLight} />
          <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
        </View>
        {item.premiumApplied && (
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.statText}>+{Math.round(item.scoreBonus * 100)}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="game-controller-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>Chưa có lịch sử game</Text>
      <Text style={styles.emptySubtext}>Chơi game để xem lịch sử tại đây</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
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
  listContent: {
    padding: 15,
    flexGrow: 1
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  sessionInfo: {
    flex: 1
  },
  sessionMode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5
  },
  sessionDate: {
    fontSize: 12,
    color: COLORS.textLight
  },
  scoreContainer: {
    alignItems: 'flex-end'
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },
  statText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
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
    textAlign: 'center'
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center'
  }
});
