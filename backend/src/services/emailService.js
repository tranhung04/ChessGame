const nodemailer = require('nodemailer');
const userRepository = require('../repositories/userRepository');

/**
 * Email Service
 * Handles email sending via Gmail SMTP
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      console.log('Email transporter initialized');
    } catch (error) {
      console.error('Error initializing email transporter:', error);
    }
  }

  /**
   * Send payment confirmation email
   * @param {string} userId - User ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<void>}
   */
  async sendPaymentConfirmation(userId, paymentData) {
    try {
      // Get user details
      const user = await userRepository.getUserById(userId);
      
      if (!user || !user.Email) {
        throw new Error('User email not found');
      }

      const { orderId, packageName, amount, currency, duration, scoreBonus } = paymentData;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'ToolChess <noreply@toolchess.com>',
        to: user.Email,
        subject: 'Thanh toán thành công - ToolChess',
        html: this.getPaymentConfirmationTemplate({
          username: user.Username,
          orderId,
          packageName,
          amount,
          currency,
          duration,
          scoreBonus
        })
      };

      if (!this.transporter) {
        console.warn('Email transporter not initialized. Skipping email send.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment confirmation email sent to ${user.Email}`);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  /**
   * Get payment confirmation email template
   * @param {Object} data - Template data
   * @returns {string} HTML email template
   */
  getPaymentConfirmationTemplate(data) {
    const { username, orderId, packageName, amount, currency, duration, scoreBonus } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #f9f9f9;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      color: #8B4513;
      margin-bottom: 30px;
    }
    .info-box {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #666;
    }
    .value {
      color: #333;
    }
    .highlight {
      color: #8B4513;
      font-weight: bold;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>🎉 Thanh toán thành công!</h1>
      </div>
      
      <p>Xin chào <strong>${username}</strong>,</p>
      
      <p>Cảm ơn bạn đã mua gói <strong>${packageName}</strong> tại ToolChess!</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #8B4513;">Thông tin đơn hàng</h3>
        
        <div class="info-row">
          <span class="label">Mã đơn hàng:</span>
          <span class="value">${orderId}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Gói premium:</span>
          <span class="value">${packageName}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Số tiền:</span>
          <span class="value">${amount.toLocaleString()} ${currency}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Thời hạn:</span>
          <span class="value">${duration} ngày</span>
        </div>
        
        <div class="info-row">
          <span class="label">Bonus điểm:</span>
          <span class="highlight">+${scoreBonus}%</span>
        </div>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <strong style="color: #28a745; font-size: 18px;">✓ Gói premium của bạn đã được kích hoạt!</strong>
      </p>
      
      <p>Bạn có thể bắt đầu chơi ngay và tận hưởng các quyền lợi đặc biệt của gói premium.</p>
      
      <div class="footer">
        <p>Cảm ơn bạn đã sử dụng ToolChess!</p>
        <p style="font-size: 12px; color: #999;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send verification email
   * @param {string} email - User email
   * @param {Object} data - Email data (username, verificationLink)
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(email, data) {
    try {
      const { username, verificationLink } = data;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'ToolChess <noreply@toolchess.com>',
        to: email,
        subject: 'Xác minh tài khoản ToolChess',
        html: this.getVerificationEmailTemplate({ username, verificationLink })
      };

      if (!this.transporter) {
        console.warn('Email transporter not initialized. Skipping email send.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {Object} data - Email data (username, resetLink)
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail(email, data) {
    try {
      const { username, resetLink } = data;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'ToolChess <noreply@toolchess.com>',
        to: email,
        subject: 'Đặt lại mật khẩu ToolChess',
        html: this.getPasswordResetEmailTemplate({ username, resetLink })
      };

      if (!this.transporter) {
        console.warn('Email transporter not initialized. Skipping email send.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send generic email (for testing/admin purposes)
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} template - Template name
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   */
  async sendEmail(to, subject, template, data) {
    try {
      let html;

      switch (template) {
        case 'verification':
          html = this.getVerificationEmailTemplate(data);
          break;
        case 'password-reset':
          html = this.getPasswordResetEmailTemplate(data);
          break;
        case 'payment-confirmation':
          html = this.getPaymentConfirmationTemplate(data);
          break;
        default:
          throw new Error(`Unknown template: ${template}`);
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'ToolChess <noreply@toolchess.com>',
        to,
        subject,
        html
      };

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get verification email template
   * @param {Object} data - Template data
   * @returns {string} HTML email template
   */
  getVerificationEmailTemplate(data) {
    const { username, verificationLink } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #f9f9f9;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      color: #8B4513;
      margin-bottom: 30px;
    }
    .button { 
      display: inline-block;
      background: #8B4513; 
      color: white !important; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px;
      margin: 20px 0;
    }
    .button:hover {
      background: #6d3410;
    }
    .link-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      word-break: break-all;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h2>Xác minh tài khoản ToolChess</h2>
      </div>
      
      <p>Xin chào <strong>${username}</strong>,</p>
      
      <p>Cảm ơn bạn đã đăng ký tài khoản ToolChess. Vui lòng click vào nút bên dưới để xác minh email của bạn:</p>
      
      <p style="text-align: center;">
        <a href="${verificationLink}" class="button">Xác minh Email</a>
      </p>
      
      <p>Hoặc copy link sau vào trình duyệt:</p>
      
      <div class="link-box">
        ${verificationLink}
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Link xác minh này sẽ hết hạn sau 24 giờ.
      </p>
      
      <div class="footer">
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        <p style="font-size: 12px; color: #999;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get password reset email template
   * @param {Object} data - Template data
   * @returns {string} HTML email template
   */
  getPasswordResetEmailTemplate(data) {
    const { username, resetLink } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #f9f9f9;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      color: #8B4513;
      margin-bottom: 30px;
    }
    .button { 
      display: inline-block;
      background: #8B4513; 
      color: white !important; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px;
      margin: 20px 0;
    }
    .button:hover {
      background: #6d3410;
    }
    .link-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      word-break: break-all;
      margin: 20px 0;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h2>Đặt lại mật khẩu ToolChess</h2>
      </div>
      
      <p>Xin chào <strong>${username}</strong>,</p>
      
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Click vào nút bên dưới để tạo mật khẩu mới:</p>
      
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
      </p>
      
      <p>Hoặc copy link sau vào trình duyệt:</p>
      
      <div class="link-box">
        ${resetLink}
      </div>
      
      <div class="warning">
        <strong>⚠️ Lưu ý bảo mật:</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Link này sẽ hết hạn sau 1 giờ</li>
          <li>Không chia sẻ link này với bất kỳ ai</li>
          <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, tài khoản của bạn vẫn an toàn và bạn có thể bỏ qua email này.</p>
        <p style="font-size: 12px; color: #999;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Verify SMTP connection
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
