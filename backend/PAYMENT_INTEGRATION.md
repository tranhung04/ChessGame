# VNPay Payment Integration

## Overview

This document describes the VNPay payment integration implementation for the ToolChess backend API.

## Implementation Status

✅ **Task 7.1**: VNPay signature service implemented
✅ **Task 7.3**: Payment repository implemented
✅ **Task 7.4**: Payment endpoints implemented
✅ **Task 7.5**: Payment callback handler implemented

## Components

### 1. VNPay Service (`src/services/vnpayService.js`)

Handles VNPay payment URL generation and signature verification.

**Key Methods:**
- `generatePaymentUrl(params)` - Creates VNPay payment URL with secure signature
- `verifySignature(vnpParams)` - Verifies VNPay callback signature
- `generateSecureHash(params)` - Generates HMAC SHA512 hash
- `parseResponseCode(code)` - Converts VNPay response code to status
- `getResponseMessage(code)` - Gets human-readable message for response code

**Configuration (`.env`):**
```env
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay/return
```

### 2. Payment Repository (`src/repositories/paymentRepository.js`)

Handles all database operations for payments.

**Key Methods:**
- `createPayment(paymentData)` - Create new payment record
- `updatePaymentStatus(orderId, updateData)` - Update payment status and VNPay data
- `getPaymentByOrderId(orderId)` - Get payment by order ID
- `getUserPaymentHistory(userId, options)` - Get paginated payment history
- `markExpiredPayments(minutes)` - Mark old pending payments as expired

### 3. Payment Service (`src/services/paymentService.js`)

Handles payment business logic.

**Key Methods:**
- `processSuccessfulPayment(orderId)` - Process successful payment (activate premium + send email)
- `sendPaymentConfirmationEmail(payment)` - Send confirmation email
- `handlePaymentFailure(orderId, reason)` - Handle payment failure
- `expireOldPendingPayments()` - Expire old pending payments (for cron job)

### 4. Payment Controller (`src/controllers/paymentController.js`)

Handles HTTP requests for payment endpoints.

**Endpoints:**
- `POST /api/payment/vnpay/create` - Create VNPay payment URL
- `GET /api/payment/vnpay/return` - Handle VNPay callback
- `GET /api/payment/status/:orderId` - Get payment status
- `GET /api/payment/history` - Get user payment history

### 5. Email Service (`src/services/emailService.js`)

Handles email sending via Gmail SMTP.

**Key Methods:**
- `sendPaymentConfirmation(userId, paymentData)` - Send payment confirmation email
- `getPaymentConfirmationTemplate(data)` - Generate HTML email template

**Configuration (`.env`):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=ToolChess <noreply@toolchess.com>
```

## API Endpoints

### Create VNPay Payment

**Endpoint:** `POST /api/payment/vnpay/create`

**Authentication:** Required (JWT Bearer token)

**Rate Limit:** 3 requests per minute

**Request Body:**
```json
{
  "packageId": "basic"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1234567890_abc123",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "amount": 29000,
    "currency": "VND",
    "packageName": "Cơ bản",
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing packageId)
- `404` - Package not found
- `401` - Unauthorized (invalid/missing token)
- `429` - Rate limit exceeded

### VNPay Callback

**Endpoint:** `GET /api/payment/vnpay/return`

**Authentication:** Not required (VNPay callback)

**Query Parameters:** All VNPay callback parameters including `vnp_SecureHash`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1234567890_abc123",
    "status": "completed",
    "message": "Giao dịch thành công",
    "transactionNo": "14012345"
  }
}
```

**Side Effects:**
- Updates payment status in database
- If successful: Activates premium subscription
- If successful: Sends confirmation email

**Error Responses:**
- `400` - Invalid signature
- `404` - Payment not found

### Get Payment Status

**Endpoint:** `GET /api/payment/status/:orderId`

**Authentication:** Required (JWT Bearer token)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1234567890_abc123",
    "status": "completed",
    "amount": 29000,
    "currency": "VND",
    "packageId": "basic",
    "packageName": "Cơ bản",
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z",
    "vnpayData": {
      "responseCode": "00",
      "transactionNo": "14012345",
      "message": "Giao dịch thành công"
    }
  }
}
```

**Error Responses:**
- `404` - Payment not found
- `403` - Payment belongs to different user
- `401` - Unauthorized

### Get Payment History

**Endpoint:** `GET /api/payment/history?page=1&limit=10`

**Authentication:** Required (JWT Bearer token)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "orderId": "ORDER_1234567890_abc123",
        "packageName": "Cơ bản",
        "amount": 29000,
        "currency": "VND",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00Z",
        "completedAt": "2024-01-01T00:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

## Payment Flow

### 1. Create Payment

```
User → Mobile App → POST /api/payment/vnpay/create
                  ↓
            Backend creates payment record (status: pending)
                  ↓
            Backend generates VNPay payment URL with signature
                  ↓
            Backend returns payment URL to app
```

### 2. User Completes Payment

```
Mobile App → Opens payment URL in WebView
           ↓
User completes payment on VNPay
           ↓
VNPay redirects to return URL with payment result
```

### 3. Process Callback

```
VNPay → GET /api/payment/vnpay/return?vnp_...
      ↓
Backend verifies VNPay signature
      ↓
Backend updates payment status
      ↓
If successful:
  - Activate premium subscription
  - Send confirmation email
      ↓
Backend returns result
```

### 4. Check Status

```
Mobile App → Polls GET /api/payment/status/:orderId
           ↓
Backend returns current payment status
           ↓
If completed: Show success message
If failed: Show error message
If pending: Continue polling
```

## Security Features

### 1. Signature Verification

All VNPay callbacks are verified using HMAC SHA512:
- Parameters are sorted alphabetically
- Query string is created from sorted parameters
- HMAC SHA512 hash is calculated using secret key
- Hash is compared with VNPay's signature

### 2. Rate Limiting

Payment endpoints are rate-limited to prevent abuse:
- Create payment: 3 requests per minute per user
- Other endpoints: Standard rate limits apply

### 3. Authorization

- Payment creation requires valid JWT token
- Payment status check verifies ownership
- Payment history is user-specific

### 4. Server-Side Validation

- All payment data is validated server-side
- Client-side payment data is never trusted
- VNPay signature must be valid before processing

## Testing

### Unit Tests

Run simple payment service tests:
```bash
node test-payment-simple.js
```

Tests:
- ✓ VNPay signature generation
- ✓ VNPay signature verification
- ✓ Invalid signature detection
- ✓ Response code parsing
- ✓ Payment URL generation
- ✓ Date formatting

### Integration Tests

Run full payment integration tests (requires running server and seeded database):
```bash
node test-payment.js
```

Tests:
- Login with test user
- Get premium packages
- Create VNPay payment
- Check payment status
- Get payment history

### Manual Testing with VNPay Sandbox

1. Create payment using API
2. Open payment URL in browser
3. Use VNPay sandbox test cards:
   - Card: 9704198526191432198
   - Name: NGUYEN VAN A
   - Date: 07/15
   - OTP: 123456
4. Complete payment
5. Verify callback is received
6. Check payment status is updated
7. Verify premium is activated
8. Check confirmation email is sent

## Database Schema

### Payments Table

```sql
CREATE TABLE Payments (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderId NVARCHAR(100) NOT NULL UNIQUE,
    PackageId NVARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    Status NVARCHAR(20) NOT NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'vnpay',
    VnpayData NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (PackageId) REFERENCES PremiumPackages(Id)
);
```

**Indexes:**
- `IX_Payments_UserId` - For user payment history
- `IX_Payments_OrderId` - For payment lookup
- `IX_Payments_Status` - For status filtering
- `IX_Payments_CreatedAt` - For date sorting

## Error Handling

### Payment Errors

- `INVALID_PACKAGE` - Package not found or inactive
- `PAYMENT_NOT_FOUND` - Payment record not found
- `INVALID_SIGNATURE` - VNPay signature verification failed
- `PAYMENT_EXPIRED` - Payment session expired (>15 minutes)
- `PAYMENT_FAILED` - Payment processing failed

### Email Errors

Email failures are logged but don't fail the payment:
- Payment is still processed successfully
- User can contact support for confirmation
- Email can be resent manually if needed

## Maintenance Tasks

### Expire Old Pending Payments

Run periodically (e.g., via cron job):
```javascript
const paymentService = require('./src/services/paymentService');
await paymentService.expireOldPendingPayments();
```

This marks payments older than 15 minutes as expired.

## Production Checklist

Before deploying to production:

- [ ] Update VNPay credentials in `.env`
- [ ] Change `VNPAY_URL` to production URL
- [ ] Update `VNPAY_RETURN_URL` to production domain
- [ ] Configure Gmail SMTP with production account
- [ ] Test payment flow in VNPay sandbox
- [ ] Set up monitoring for payment failures
- [ ] Set up alerts for signature verification failures
- [ ] Configure rate limiting appropriately
- [ ] Set up cron job for expiring old payments
- [ ] Test email delivery
- [ ] Verify premium activation works
- [ ] Test payment status polling
- [ ] Review error handling and logging

## Troubleshooting

### Payment URL Generation Fails

- Check VNPay credentials in `.env`
- Verify `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` are correct
- Check database connection
- Verify premium package exists and is active

### Signature Verification Fails

- Verify `VNPAY_HASH_SECRET` matches VNPay configuration
- Check parameter sorting is correct
- Ensure no URL encoding issues
- Log incoming parameters for debugging

### Premium Not Activated

- Check payment status is "completed"
- Verify premium service is working
- Check user premium subscription table
- Review logs for errors

### Email Not Sent

- Check SMTP configuration in `.env`
- Verify Gmail app password is correct
- Check email service logs
- Test SMTP connection manually
- Verify user email exists in database

## References

- [VNPay Documentation](https://sandbox.vnpayment.vn/apis/docs/)
- [VNPay Sandbox](https://sandbox.vnpayment.vn/)
- [Nodemailer Documentation](https://nodemailer.com/)
- Requirements: 10.1-10.10, 16.10
- Design: VNPay Integration Flow section
