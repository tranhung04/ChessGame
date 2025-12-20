import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { premiumAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

export default function ShopScreen() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [pollingPayment, setPollingPayment] = useState(false);
  const pollingIntervalRef = useRef(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    loadPackages();
    
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const loadPackages = async () => {
    try {
      const response = await premiumAPI.getPackages();
      setPackages(response.data.data.packages);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách gói premium');
      console.error('Load packages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (pkg) => {
    Alert.alert(
      'Xác nhận mua hàng',
      `Bạn muốn mua gói ${pkg.name}?\nGiá: ${pkg.price.toLocaleString()} ${pkg.currency}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mua ngay',
          onPress: () => initiatePayment(pkg.id)
        }
      ]
    );
  };

  const initiatePayment = async (packageId) => {
    setPurchasing(true);
    try {
      // Create payment with return URL
      const returnUrl = 'toolchess://payment-return';
      const response = await paymentAPI.createPayment(packageId, returnUrl);
      
      const { orderId, paymentUrl: url } = response.data.data;
      
      // Store order ID for polling
      setCurrentOrderId(orderId);
      setPaymentUrl(url);
      setShowWebView(true);
      
    } catch (error) {
      Alert.alert(
        'Lỗi thanh toán',
        error.response?.data?.error?.message || 'Không thể tạo link thanh toán'
      );
      console.error('Payment creation error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Check if user returned from VNPay
    if (url.includes('toolchess://payment-return') || 
        url.includes('vnp_ResponseCode')) {
      // Close WebView and start polling
      setShowWebView(false);
      startPaymentPolling();
    }
  };

  const startPaymentPolling = async () => {
    if (!currentOrderId) {
      Alert.alert('Lỗi', 'Không tìm thấy mã đơn hàng');
      return;
    }

    setPollingPayment(true);
    
    Alert.alert(
      'Đang xử lý',
      'Đang kiểm tra trạng thái thanh toán...',
      [],
      { cancelable: false }
    );

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
    
    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      
      try {
        const response = await paymentAPI.getPaymentStatus(currentOrderId);
        const { status } = response.data.data;
        
        if (status === 'completed') {
          // Payment successful
          clearInterval(pollingIntervalRef.current);
          setPollingPayment(false);
          
          // Update user data to reflect premium status
          await updateUser();
          
          Alert.alert(
            'Thanh toán thành công! 🎉',
            'Gói premium của bạn đã được kích hoạt.',
            [{ text: 'OK', onPress: () => setCurrentOrderId(null) }]
          );
        } else if (status === 'failed') {
          // Payment failed
          clearInterval(pollingIntervalRef.current);
          setPollingPayment(false);
          
          Alert.alert(
            'Thanh toán thất bại',
            'Giao dịch không thành công. Vui lòng thử lại.',
            [{ text: 'OK', onPress: () => setCurrentOrderId(null) }]
          );
        } else if (status === 'expired') {
          // Payment expired
          clearInterval(pollingIntervalRef.current);
          setPollingPayment(false);
          
          Alert.alert(
            'Hết hạn thanh toán',
            'Link thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới.',
            [{ text: 'OK', onPress: () => setCurrentOrderId(null) }]
          );
        } else if (attempts >= maxAttempts) {
          // Timeout
          clearInterval(pollingIntervalRef.current);
          setPollingPayment(false);
          
          Alert.alert(
            'Hết thời gian chờ',
            'Không thể xác nhận trạng thái thanh toán. Vui lòng kiểm tra lại sau.',
            [{ text: 'OK', onPress: () => setCurrentOrderId(null) }]
          );
        }
        // If status is still 'pending', continue polling
        
      } catch (error) {
        console.error('Payment polling error:', error);
        
        if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current);
          setPollingPayment(false);
          
          Alert.alert(
            'Lỗi kiểm tra thanh toán',
            'Không thể kiểm tra trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.',
            [{ text: 'OK', onPress: () => setCurrentOrderId(null) }]
          );
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const closeWebView = () => {
    setShowWebView(false);
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có muốn kiểm tra trạng thái thanh toán không?',
      [
        { text: 'Không', style: 'cancel', onPress: () => setCurrentOrderId(null) },
        { text: 'Kiểm tra', onPress: startPaymentPolling }
      ]
    );
  };

  const renderPackage = ({ item }) => {
    const isPremium = user?.premium?.isActive && user?.premium?.packageId === item.id;

    return (
      <View style={styles.packageCard}>
        <View style={styles.packageHeader}>
          <Text style={styles.packageName}>{item.name}</Text>
          {isPremium && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.activeBadgeText}>Đang dùng</Text>
            </View>
          )}
        </View>

        <Text style={styles.packagePrice}>
          {item.price.toLocaleString()} {item.currency}
        </Text>
        <Text style={styles.packageDuration}>{item.durationDays} ngày</Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Quyền lợi:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="arrow-up-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>
              +{(item.scoreBonus * 100).toFixed(0)}% điểm cho mọi quân cờ
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="heart" size={20} color={COLORS.error} />
            <Text style={styles.featureText}>
              {item.reviveCount === 999999 ? 'Hồi sinh không giới hạn' : `${item.reviveCount} lượt hồi sinh miễn phí`}
            </Text>
          </View>

          {item.features && Array.isArray(item.features) && item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={[styles.buyButton, purchasing && styles.buyButtonDisabled]}
            onPress={() => handleBuy(item)}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buyButtonText}>Mua Ngay</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải gói premium...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={packages}
        renderItem={renderPackage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Gói Premium</Text>
            <Text style={styles.headerSubtitle}>
              Nâng cấp để có trải nghiệm tốt nhất
            </Text>
            {user?.premium?.isActive && (
              <View style={styles.currentPremiumBanner}>
                <Ionicons name="star" size={24} color={COLORS.secondary} />
                <View style={styles.currentPremiumInfo}>
                  <Text style={styles.currentPremiumText}>
                    Bạn đang dùng gói: {user.premium.package || 'Premium'}
                  </Text>
                  <Text style={styles.currentPremiumExpiry}>
                    Hết hạn: {new Date(user.premium.expiresAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không có gói premium nào</Text>
          </View>
        }
      />

      {/* WebView Modal for VNPay Payment */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={closeWebView}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Thanh toán VNPay</Text>
            <TouchableOpacity onPress={closeWebView} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.webViewLoadingText}>Đang tải trang thanh toán...</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Polling Indicator */}
      {pollingPayment && (
        <View style={styles.pollingOverlay}>
          <View style={styles.pollingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.pollingText}>Đang kiểm tra thanh toán...</Text>
            <Text style={styles.pollingSubtext}>Vui lòng đợi</Text>
          </View>
        </View>
      )}
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
  listContainer: {
    padding: 20
  },
  headerContainer: {
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 5
  },
  currentPremiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 15
  },
  currentPremiumInfo: {
    marginLeft: 10,
    flex: 1
  },
  currentPremiumText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white
  },
  currentPremiumExpiry: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2
  },
  packageCard: {
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary
  },
  packageDuration: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 15
  },
  featuresContainer: {
    marginBottom: 15
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  buyButtonDisabled: {
    opacity: 0.6
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 10
  },
  // WebView Modal Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  closeButton: {
    padding: 5
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  webViewLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight
  },
  // Polling Overlay Styles
  pollingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pollingContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200
  },
  pollingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  },
  pollingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.textLight
  }
});
