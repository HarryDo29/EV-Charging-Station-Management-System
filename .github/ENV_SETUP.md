# Hướng dẫn Setup GitHub Secret cho .env

## Bước 1: Copy nội dung file .env

Mở file `.env` ở local của bạn và copy toàn bộ nội dung.

## Bước 2: Tạo GitHub Secret

1. Vào GitHub repository của bạn
2. Click **Settings** (tab trên cùng)
3. Ở sidebar bên trái, click **Secrets and variables** → **Actions**
4. Click nút **New repository secret**

## Bước 3: Thêm Secret

- **Name**: `ENV_FILE`
- **Value**: Paste toàn bộ nội dung file .env của bạn vào đây (tất cả 51 dòng)

Ví dụ format:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
...
(tất cả các biến môi trường khác)
```

## Bước 4: Save

Click **Add secret**

## Bước 5: Test

- Push code lên branch `master`
- Hoặc vào tab **Actions** → chọn workflow → click **Run workflow** (nếu đã enable workflow_dispatch)

## ✅ Hoàn tất!

Workflow sẽ tự động tạo file `.env` từ secret `ENV_FILE` mỗi khi deploy.

## 🔒 Lưu ý bảo mật

- ✅ Secret được mã hóa trên GitHub
- ✅ Secret không hiển thị trong logs
- ✅ Chỉ workflow có quyền truy cập
- ⚠️ File `.env` đã được gitignore (không được commit lên GitHub)

