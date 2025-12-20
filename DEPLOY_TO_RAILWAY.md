# Deploy Backend lên Railway.app (Miễn phí)

## Bước 1: Chuẩn bị code

### Tạo file railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && node src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Kiểm tra package.json có scripts
```json
{
  "scripts": {
    "start": "cd backend && node src/server.js"
  }
}
```

## Bước 2: Push code lên GitHub

1. Tạo repository mới trên GitHub
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Bước 3: Deploy trên Railway

1. Vào: https://railway.app
2. Click "Start a New Project"
3. Login bằng GitHub
4. Chọn "Deploy from GitHub repo"
5. Chọn repository của bạn
6. Railway sẽ tự động deploy!

## Bước 4: Setup Database (nếu cần)

1. Click "New" → "Database" → "Add MySQL"
2. Railway sẽ tự tạo database
3. Copy connection string
4. Add vào Environment Variables:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `DB_PORT`

## Bước 5: Lấy URL

Sau khi deploy xong:
1. Click vào service
2. Tab "Settings" → "Generate Domain"
3. Copy URL (ví dụ: `https://your-app.up.railway.app`)

## Bước 6: Build APK với URL Railway

Config app để dùng: `https://your-app.up.railway.app`

---

## Lưu ý:
- ✅ Free tier: 500 giờ/tháng ($5 credit)
- ✅ Tự động sleep khi không dùng (tiết kiệm giờ)
- ✅ HTTPS miễn phí
- ✅ Domain cố định
- ⚠️ Cần push code lên GitHub trước

---

## Nếu không muốn dùng GitHub:

### Deploy trực tiếp bằng Railway CLI:

1. Cài Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Deploy:
```bash
railway init
railway up
```

Done! 🚀
