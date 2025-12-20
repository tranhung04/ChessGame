const crypto = require('crypto');
const querystring = require('querystring');

/**
 * VNPay Payment Service
 * Handles VNPay payment URL generation and signature verification
 */
class VNPayService {
  constructor() {
    this.vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.tmnCode = process.env.VNPAY_TMN_CODE;
    this.hashSecret = process.env.VNPAY_HASH_SECRET;
    this.returnUrl = process.env.VNPAY_RETURN_URL;
  }

  /**
   * Generate VNPay payment URL with signature
   * @param {Object} params - Payment parameters
   * @param {string} params.orderId - Unique order ID
   * @param {number} params.amount - Payment amount in VND
   * @param {string} params.orderInfo - Order description
   * @param {string} params.ipAddr - Client IP address
   * @returns {string} Complete payment URL with signature
   */
  generatePaymentUrl(params) {
    const { orderId, amount, orderInfo, ipAddr } = params;

    // Create date in format: yyyyMMddHHmmss
    const createDate = this.formatDate(new Date());
    
    // Expiry time: 15 minutes from now
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000));

    // Build VNPay parameters
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: amount * 100, // VNPay requires amount in smallest currency unit (VND * 100)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    };

    // Generate secure hash
    const secureHash = this.generateSecureHash(vnpParams);
    vnpParams.vnp_SecureHash = secureHash;

    // Build final URL
    const paymentUrl = `${this.vnpUrl}?${querystring.stringify(vnpParams)}`;
    
    return paymentUrl;
  }

  /**
   * Verify VNPay callback signature
   * @param {Object} vnpParams - VNPay callback parameters
   * @returns {boolean} True if signature is valid
   */
  verifySignature(vnpParams) {
    const secureHash = vnpParams.vnp_SecureHash;
    
    // Remove hash fields from params
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify.vnp_SecureHash;
    delete paramsToVerify.vnp_SecureHashType;

    // Calculate expected hash
    const calculatedHash = this.generateSecureHash(paramsToVerify);

    // Compare hashes
    return secureHash === calculatedHash;
  }

  /**
   * Generate HMAC SHA512 secure hash
   * @param {Object} params - Parameters to hash
   * @returns {string} Hex encoded hash
   */
  generateSecureHash(params) {
    // Sort parameters by key
    const sortedParams = this.sortObject(params);

    // Create query string
    const signData = querystring.stringify(sortedParams, { encode: false });

    // Calculate HMAC SHA512
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const hash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return hash;
  }

  /**
   * Sort object keys alphabetically
   * @param {Object} obj - Object to sort
   * @returns {Object} Sorted object
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    
    return sorted;
  }

  /**
   * Format date to VNPay format: yyyyMMddHHmmss
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Parse VNPay response code to status
   * @param {string} responseCode - VNPay response code
   * @returns {string} Payment status: completed | failed | pending
   */
  parseResponseCode(responseCode) {
    switch (responseCode) {
      case '00':
        return 'completed';
      case '07':
        return 'pending'; // Trừ tiền thành công, đang chờ xác nhận
      case '09':
        return 'pending'; // Giao dịch chưa hoàn tất
      default:
        return 'failed';
    }
  }

  /**
   * Get response message from code
   * @param {string} responseCode - VNPay response code
   * @returns {string} Human readable message
   */
  getResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch đang chờ xác nhận',
      '09': 'Giao dịch chưa hoàn tất',
      '10': 'Giao dịch không thành công do: Khách hàng nhập sai thông tin',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
      '13': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
      '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Lỗi không xác định'
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }
}

module.exports = new VNPayService();
