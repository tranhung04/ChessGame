# Setup Laptop làm Public Server

## Yêu cầu
- Laptop luôn bật và kết nối internet
- Có quyền truy cập router WiFi
- IP public (kiểm tra tại: https://whatismyipaddress.com)

## Bước 1: Tìm IP Local của Laptop
Chạy: `find-my-ip.bat`
Ví dụ: `192.168.1.100`

## Bước 2: Setup Port Forwarding trên Router

### Cách vào Router:
1. Mở trình duyệt, vào: `192.168.1.1` hoặc `192.168.0.1`
2. Đăng nhập (thường là admin/admin hoặc xem dưới router)

### Cấu hình Port Forwarding:
```
Service Name: ToolChess Backend
External Port: 3000
Internal IP: 192.168.1.100 (IP laptop của bạn)
Internal Port: 3000
Protocol: TCP
```

## Bước 3: Mở Firewall trên Laptop
Chạy as Administrator: `open-firewall-port-3000.bat`

## Bước 4: Lấy Public IP
Chạy: `show-public-ip.bat`
Ví dụ: `123.45.67.89`

## Bước 5: Build APK với Public IP
Config app để dùng: `http://123.45.67.89:3000`

## Bước 6: Chạy Backend
```
start-backend.bat
```

## Lưu ý:
- ⚠️ IP public có thể thay đổi khi router restart
- ⚠️ Cần setup Dynamic DNS nếu muốn domain name cố định
- ⚠️ Laptop phải luôn bật và online
- ⚠️ Cần bảo mật backend (authentication, HTTPS)

---

## Giải pháp 2: Dùng Ngrok (Dễ hơn, có domain)

### Cài Ngrok:
1. Tải tại: https://ngrok.com/download
2. Đăng ký tài khoản miễn phí
3. Chạy: `ngrok http 3000`

### Kết quả:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

### Build APK với:
```
https://abc123.ngrok.io
```

### Ưu điểm Ngrok:
- ✅ Không cần port forwarding
- ✅ Có HTTPS miễn phí
- ✅ Có domain name
- ✅ Hoạt động với mọi mạng

### Nhược điểm:
- ❌ Domain thay đổi mỗi lần restart (bản free)
- ❌ Giới hạn bandwidth

---

## Giải pháp 3: Deploy lên Cloud (Tốt nhất)

### Các dịch vụ miễn phí:
- Railway.app (500 giờ/tháng miễn phí)
- Render.com (miễn phí)
- Fly.io (miễn phí tier)
- Heroku (có free tier)

### Ưu điểm:
- ✅ Luôn online 24/7
- ✅ Domain cố định
- ✅ HTTPS miễn phí
- ✅ Không cần laptop bật

Bạn muốn dùng giải pháp nào?
