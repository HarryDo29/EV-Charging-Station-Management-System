# Hướng dẫn Troubleshooting

## Vấn đề: App vẫn chạy ở local VPS thay vì Docker

### Kiểm tra nhanh trên VPS:

```bash
# 1. Kiểm tra process nào đang chạy trên port 3000
sudo lsof -i:3000

# 2. Kiểm tra Docker containers
docker compose ps

# 3. Kiểm tra logs của Docker
docker compose logs --tail=50
```

### Giải pháp 1: Stop process local thủ công

```bash
# Stop tất cả process Node.js trên port 3000
sudo kill -9 $(lsof -ti:3000)

# Hoặc stop tất cả process Node.js
pkill -9 node

# Sau đó chạy lại Docker
docker compose down
docker compose up -d --build
```

### Giải pháp 2: Kiểm tra PM2 (nếu dùng)

```bash
# Xem các process PM2 đang chạy
pm2 list

# Stop tất cả
pm2 stop all

# Xóa tất cả khỏi PM2
pm2 delete all

# Sau đó deploy lại với Docker
docker compose up -d --build
```

### Giải pháp 3: Kiểm tra systemd service (nếu có)

```bash
# Xem các service đang chạy
sudo systemctl list-units --type=service | grep node

# Stop service (thay YOUR_SERVICE bằng tên service thực tế)
sudo systemctl stop YOUR_SERVICE
sudo systemctl disable YOUR_SERVICE
```

### Verify app đang chạy trong Docker:

```bash
# Kiểm tra container details
docker compose ps

# Kiểm tra port mapping
docker compose port server 3000

# Test từ bên ngoài
curl http://localhost:3000

# Xem process trong container
docker compose exec server ps aux
```

### Kiểm tra logs nếu container không start:

```bash
# Xem logs chi tiết
docker compose logs -f

# Xem logs của service cụ thể
docker compose logs -f server

# Xem logs build
docker compose build --no-cache
```

## Port đã bị sử dụng

Nếu báo lỗi "port is already allocated":

```bash
# Tìm process đang dùng port 3000
sudo lsof -i:3000

# Kill process đó
sudo kill -9 <PID>

# Hoặc thay đổi port trong compose.yaml
# ports:
#   - 3001:3000  # Map port 3001 của host vào 3000 của container
```

## Workflow không chạy

```bash
# SSH vào VPS và kiểm tra GitHub Actions runner
cd /path/to/actions-runner
./run.sh

# Xem status
sudo systemctl status actions.runner.*
```

## Debug thêm

Thêm các lệnh debug vào workflow:

```yaml
- name: Debug info
  run: |
    echo "Current directory:"
    pwd
    echo ""
    echo "Docker version:"
    docker --version
    echo ""
    echo "Compose version:"
    docker compose version
    echo ""
    echo "Running processes:"
    ps aux | grep node || true
    echo ""
    echo "Port 3000 usage:"
    lsof -i:3000 || true
```

