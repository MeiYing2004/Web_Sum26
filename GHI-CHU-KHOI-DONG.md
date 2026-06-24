# Ghi chú — Cách khởi động Cappy Bus

> **Bản quyền © 2026 Lữ Minh Hoàng.** Mọi quyền được bảo lưu.  
> Tài liệu nhanh để chạy web, tìm chuyến, đặt vé và Capy AI trên Windows.  
> **Cập nhật:** tháng 6/2026 — Gemini API, Docker gateway, gRPC ports.

**Nhóm 5 người — đọc thêm:**

| Tài liệu | Mục đích |
|----------|----------|
| [TEAM_STRUCTURE.md](./TEAM_STRUCTURE.md) | Vai trò FE/BE/DE/AI/DO, file phụ trách, lộ trình 4 tuần |
| [GIT_BRANCH_STRATEGY.md](./GIT_BRANCH_STRATEGY.md) | Nhánh Git, PR, commit convention |
| [MODULE_5.md](./MODULE_5.md) | Analytics, Capy AI, MCP (Module 5) |

---

## Bảng port quan trọng

| Port | Service | Ghi chú |
|------|---------|---------|
| **3000** | Web (Next.js) | Trình duyệt: http://localhost:3000 |
| **4000** | API Gateway (GraphQL) | **Bắt buộc** để tìm chuyến / đặt vé |
| **50060** | AI Service (Capy AI) | Chatbot góc phải trang chủ |
| **8080** | Nginx (proxy web + GraphQL) | Dự phòng: http://localhost:8080 |
| 50053 | trip-service (gRPC) | Backend tìm chuyến |
| 50054 | seat-inventory-service | Backend ghế |
| 50055 | booking-service | Backend đặt vé |
| 50051 | auth-service | Đăng nhập |
| 5432 | Postgres | Database |
| 6379 | Redis | Cache |

---

## Cách 1 — Docker một lệnh (khuyên dùng)

Mở **PowerShell** tại thư mục dự án:

```powershell
cd "d:\Web Sum 26"

# Lần đầu hoặc sau khi sửa code backend/docker
docker compose up -d --build

# Đợi service lên (30–60 giây)
Start-Sleep -Seconds 30
```

**Mở trình duyệt:** http://localhost:3000

| URL | Mô tả |
|-----|--------|
| http://localhost:3000 | Website Cappy Bus |
| http://localhost:4000/graphql | GraphQL trực tiếp (api-gateway) |
| http://localhost:4000/health | Health gateway + các service |
| http://localhost:8080/graphql | GraphQL qua Nginx |
| http://localhost:50060/health | AI service (Capy AI) |

**Tài khoản Admin demo:** `admin@bus.demo` / `admin123`

**Dừng toàn bộ:**

```powershell
docker compose down
```

**Deploy đầy đủ (build + test + docker):**

```powershell
npm run deploy
```

---

## Cách 2 — Dev local frontend (sửa UI thường xuyên)

### Bước 0 — Cài dependency (lần đầu)

```powershell
cd "d:\Web Sum 26"
npm install
```

### Backend Docker + frontend local (khuyên dùng khi dev UI)

**Terminal 1 — Backend Docker (gồm api-gateway, trip-service, …):**

```powershell
cd "d:\Web Sum 26"
docker compose stop web
docker compose up -d postgres redis kafka rabbitmq api-gateway trip-service seat-inventory-service booking-service payment-service auth-service analytics-service
```

> ⚠️ **Đừng** chạy `npm run dev:gateway` khi đã dùng Docker `api-gateway` — cả hai cùng cần port **4000** và gateway local **không** tự kết nối được microservice trong Docker (trừ khi bạn biết rõ cách cấu hình gRPC).

**Terminal 2 — Frontend:**

```powershell
cd "d:\Web Sum 26"
npm run dev:web
```

Mở: http://localhost:3000

> Nếu port 3000 bị chiếm bởi container `web`, chạy: `docker compose stop web`

**Terminal 3 (tuỳ chọn) — Capy AI local (Gemini):**

```powershell
cd "d:\Web Sum 26"
npm run dev:ai
```

Chỉ chạy khi **không** có Docker `ai-service` trên port 50060.

---

## Cách 3 — Dev full local (nâng cao, 4+ terminal)

Chỉ dùng khi dev sâu backend / không muốn Docker cho microservice.

**Terminal 1 — Hạ tầng:**

```powershell
npm run dev:infra
```

**Terminal 2 — Microservice backend** (trip, seat, booking, auth, …) — chạy từng service hoặc dùng Docker chỉ cho backend:

```powershell
docker compose up -d trip-service seat-inventory-service booking-service auth-service payment-service analytics-service
```

> Docker-compose đã expose gRPC ra host (`50053`, `50054`, `50055`, `50051`, `50059`) để gateway local kết nối được.

**Terminal 3 — API Gateway local:**

```powershell
npm run dev:gateway
```

Script tự set `TRIP_SERVICE_URL=localhost:50053`, … và tắt Docker `api-gateway` nếu đang chiếm port 4000.

**Terminal 4 — Frontend:**

```powershell
npm run dev:web
```

**Terminal 5 (tuỳ chọn) — Capy AI:**

```powershell
npm run dev:ai
```

Thứ tự: **infra → backend services → gateway → ai → web**.

---

## Script npm hữu ích

| Lệnh | Mô tả |
|------|--------|
| `npm run dev:web` | Chạy Next.js dev (port 3000) |
| `npm run dev:gateway` | Gateway local (4000) — **tự tắt Docker api-gateway + giải phóng port** |
| `npm run dev:ai` | Capy AI local (50060) — **tự tắt Docker ai-service + giải phóng port** |
| `npm run dev:infra` | Chỉ Postgres, Redis, Kafka, RabbitMQ |
| `npm run docker:up` | `docker compose up -d --build` |
| `npm run docker:down` | Dừng Docker |
| `npm run clean:deps` | **Xóa** `node_modules`, `dist`, `.next`, … (giảm dung lượng trước zip/copy) |
| `npm run setup` | **Cài lại** dependency sau clone hoặc sau `clean:deps` |

Script khởi động: `scripts/start-dev-service.cjs` (`gateway` | `ai`).

### Xóa & cài lại dependencies (Git / clone)

Git **đã ignore** `node_modules` — không bắt buộc xóa trước `git push`. Chỉ dùng khi muốn gọn thư mục:

```powershell
cd "d:\Web Sum 26"
npm run clean:deps          # xóa node_modules, dist, .next, ...
# git add / commit / push   # node_modules không lên remote

npm run setup               # sau clone hoặc sau clean:deps — cài lại hết
```

---

## Chạy lệnh ở terminal nào? Thứ tự ra sao?

### 🟢 Cách A — Chỉ cần mở web (1 terminal, khuyên dùng)

| Terminal | Lệnh | Ghi chú |
|----------|------|---------|
| **Terminal 1** | `cd "d:\Web Sum 26"` | Vào thư mục dự án |
| | `npm run docker:up` | Hoặc `docker compose up -d --build` |
| | *(đợi 30–60 giây)* | |
| | Mở **http://localhost:3000** | Tìm chuyến + Capy AI |

**Không cần** `dev:web`, `dev:gateway`, `dev:ai` riêng.

**Dừng:** `npm run docker:down`

---

### 🟡 Cách B — Sửa code frontend (2 terminal)

| Thứ tự | Terminal | Lệnh | Port |
|--------|----------|------|------|
| **1** | Terminal 1 | `docker compose stop web` | Tránh trùng 3000 |
| | | `docker compose up -d` *(hoặc chỉ backend như Cách 2)* | api-gateway **4000** |
| **2** | Terminal 2 | `npm run dev:web` | **3000** |

**Capy AI:** dùng Docker `ai-service` **hoặc** `npm run dev:ai` — **chọn một**, không cả hai.

---

### 🔵 Cách C — Dev full local (xem mục Cách 3 phía trên)

---

### Tóm tắt nhanh — Service nào chạy ở đâu?

| Chức năng | Docker (khuyên dùng) | Local dev |
|-----------|----------------------|-----------|
| Tìm chuyến / đặt vé | `docker compose up -d api-gateway` (+ trip, booking, …) | `dev:gateway` + backend gRPC trên localhost |
| Capy AI | `docker compose up -d ai-service` | `npm run dev:ai` |
| Frontend hot-reload | `docker compose stop web` + `dev:web` | `npm run dev:web` |

---

## Kiến trúc kết nối (quan trọng)

```
Trình duyệt
    │
    ├─► http://localhost:3000        (Web)
    │
    ├─► http://localhost:4000/graphql   (GraphQL — tìm chuyến, đặt vé)
    │       └─► api-gateway
    │               └─► trip-service :50053 (gRPC)
    │               └─► booking-service :50055
    │               └─► seat-inventory-service :50054
    │               └─► auth-service :50051
    │
    └─► http://localhost:50060/chat     (Capy AI)
            └─► Gemini API (Google AI Studio)
```

- Frontend (trình duyệt) gọi **trực tiếp** `http://localhost:4000/graphql` — không qua rewrite Next.js (đã sửa cho Docker standalone).
- Frontend gọi AI qua `/api/chat` → proxy tới **ai-service** port **50060**.

File liên quan:
- `apps/web/src/lib/graphql.ts` — URL GraphQL
- `apps/web/next.config.js` — proxy `/api/chat`
- `services/api-gateway/src/index.ts` — gateway + graceful shutdown
- `services/ai-service/src/index.ts` — Gemini + fallback demo

---

## Cấu hình môi trường (`.env`)

File **`.env`** ở thư mục gốc `d:\Web Sum 26` (đã gitignore). Mẫu: `.env.example`

```env
# Capy AI — Gemini (ưu tiên)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here

# Tuỳ chọn: model Gemini (mặc định gemini-2.5-flash)
# GEMINI_MODEL=gemini-2.5-flash

# Dự phòng OpenAI (nếu không có Gemini key)
# OPENAI_API_KEY=sk-your-openai-key-here
```

| Biến | Mô tả |
|------|--------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Key từ [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | Mặc định `gemini-2.5-flash` (tránh `gemini-2.0-flash` nếu hết quota free tier) |
| `OPENAI_API_KEY` | Fallback nếu không có Gemini key |

**Sau khi sửa `.env`:** restart `npm run dev:ai` hoặc `docker compose restart ai-service`.

**Không** commit key lên git / chat / screenshot.

---

## Capy AI — Hướng dẫn & xử lý lỗi

### Cách hoạt động

- Nút **Capy AI** góc phải trang chủ → gửi tin nhắn
- Frontend → **`/api/chat`** → **ai-service** port **50060**
- Có `GOOGLE_GENERATIVE_AI_API_KEY` → dùng **Gemini** (`gemini-2.5-flash`)
- Có `OPENAI_API_KEY` (không có Gemini) → dùng GPT-4o-mini
- API lỗi / hết quota → **tự fallback chế độ demo** (vẫn trả lời cơ bản)

### Tin nhắn thường gặp trên UI

| Chat hiển thị | Ý nghĩa |
|---------------|---------|
| `Capy AI tạm thời không khả dụng` | ai-service **chưa chạy** |
| `⚠️ AI tạm không khả dụng... chế độ demo` | AI chạy nhưng **hết quota** API — kiểm tra Google AI Studio / OpenAI billing |
| Trả lời thông minh (không có ⚠️) | Gemini/OpenAI hoạt động bình thường |

### Khởi động Capy AI — chọn MỘT cách

| Cách | Lệnh |
|------|------|
| Local dev | `npm run dev:ai` |
| Docker | `docker compose up -d ai-service` |

### Kiểm tra AI

```powershell
Invoke-WebRequest -Uri "http://localhost:50060/health" -UseBasicParsing

$body = '{"messages":[{"role":"user","content":"xin chào"}]}'
Invoke-WebRequest -Uri "http://localhost:50060/chat" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

Qua proxy frontend (khi `dev:web` chạy):

```powershell
$body = '{"messages":[{"role":"user","content":"xin chào"}]}'
Invoke-WebRequest -Uri "http://localhost:3000/api/chat" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

---

## Tìm chuyến — Hướng dẫn & xử lý lỗi

### Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| `Không kết nối được máy chủ (port 4000)` | api-gateway **không chạy** | `docker compose up -d api-gateway` |
| Tìm chuyến lỗi sau khi `dev:gateway` | Gateway **local** không nối được trip-service trong Docker | Dùng Docker gateway: `docker compose up -d api-gateway` và **tắt** `dev:gateway` |
| `502 Bad Gateway` qua port 8080 | Nginx cache IP cũ sau khi restart gateway | `docker compose restart nginx` |
| `14 UNAVAILABLE` (gRPC) | Backend microservice chưa lên | `docker compose up -d trip-service booking-service seat-inventory-service` |

### Kiểm tra tìm chuyến hoạt động

```powershell
$body = '{"query":"query($o:String!,$d:String!,$t:String!){searchTrips(origin:$o,destination:$d,travelDate:$t){id price}}","variables":{"o":"TP.HCM","d":"Da Lat","t":"2026-06-15"}}'
Invoke-WebRequest -Uri "http://localhost:4000/graphql" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

Kết quả đúng: JSON có `"data":{"searchTrips":[...]}` với danh sách chuyến.

### Quy tắc vàng — api-gateway

| Muốn | Làm |
|------|-----|
| Dùng web bình thường (tìm chuyến, đặt vé) | `docker compose up -d api-gateway` (+ các service backend) |
| Dev sửa code gateway | `npm run dev:gateway` — **phải** có backend gRPC trên localhost (Docker expose port hoặc chạy local) |
| **Không** chạy đồng thời | Docker `api-gateway` **và** `npm run dev:gateway` — cùng port **4000** |

---

## Lỗi `EADDRINUSE` (port 4000 / 50060)

```
Error: listen EADDRINUSE: address already in use :::4000
Error: listen EADDRINUSE: address already in use :::50060
```

### Cách fix nhanh

| Lỗi port | Chạy lại | Hoặc dùng Docker |
|----------|----------|------------------|
| **4000** (gateway) | `npm run dev:gateway` | `docker compose up -d api-gateway` |
| **50060** (Capy AI) | `npm run dev:ai` | `docker compose up -d ai-service` |

Script `start-dev-service.cjs` tự:
1. Dừng container Docker tương ứng
2. Kill process cũ trên port đó
3. Khởi động bản local

### ⚠️ Lưu ý đặc biệt port 4000

- `npm run dev:gateway` **tắt** Docker `api-gateway` → nếu bạn chỉ cần **tìm chuyến**, nên **bật lại** Docker gateway thay vì chạy gateway local:
  ```powershell
  docker compose up -d api-gateway
  ```
- Gateway local có **graceful shutdown** khi `tsx watch` reload — tránh port bị kẹt sau khi sửa code.

### Kiểm tra port đang bị ai chiếm

```powershell
netstat -ano | findstr ":4000"
netstat -ano | findstr ":50060"
```

Cột cuối là **PID**. Tắt thủ công:

```powershell
taskkill /PID <PID> /F
```

> Tránh `taskkill /IM node.exe /F` nếu đang chạy `dev:web` — sẽ tắt hết Node.

### Tránh xung đột Local vs Docker

| Tình huống | Xử lý |
|------------|--------|
| Tìm chuyến / đặt vé | Dùng **Docker** `api-gateway` |
| Dev code gateway | `dev:gateway` + backend gRPC sẵn sàng |
| Capy AI local | `docker compose stop ai-service` trước `dev:ai` |
| Capy AI Docker | Không chạy `dev:ai` |

```powershell
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | findstr -i "gateway ai-service"
```

---

## Xử lý lỗi thường gặp (tổng hợp)

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Port 3000 đã dùng | `docker compose stop web` hoặc tắt Next.js khác |
| Không tìm được chuyến | Kiểm tra `http://localhost:4000/health` — bật `api-gateway` + `trip-service` |
| `Không kết nối được máy chủ (4000)` | `docker compose up -d api-gateway` — **đừng** chỉ chạy `dev:gateway` nếu backend trong Docker |
| Capy AI không trả lời | `npm run dev:ai` hoặc `docker compose up -d ai-service` |
| Capy AI chế độ demo (⚠️) | Nạp quota Gemini / OpenAI hoặc kiểm tra `.env` |
| `EADDRINUSE :::4000` | Chọn **một**: Docker gateway **hoặc** `dev:gateway` |
| `EADDRINUSE :::50060` | Chọn **một**: Docker ai-service **hoặc** `dev:ai` |
| `502` qua :8080 | `docker compose restart nginx` |
| Đổi code frontend không thấy | Ctrl+Shift+R hoặc restart `dev:web` |
| Đổi code Docker web | `docker compose build web && docker compose up -d web` |
| Sửa `.env` / `next.config.js` | Restart service tương ứng |

---

## Luồng demo nhanh (5 phút)

1. `docker compose up -d` → đợi 30s
2. Mở http://localhost:3000
3. Tìm chuyến **TP.HCM → Đà Lạt** → **Tìm chuyến**
4. Chọn chuyến → **Chọn ghế** → điền hành khách → **Tiếp tục thanh toán**
5. Tạo booking → **Thanh toán thành công**
6. **Tra cứu vé** tại `/lookup` với mã booking + email
7. Thử **Capy AI** góc phải — hỏi *"tìm chuyến TP.HCM đi Đà Lạt"*

---

## Checklist khởi động nhanh (copy-paste)

```powershell
cd "d:\Web Sum 26"

# 1. Bật toàn bộ Docker
docker compose up -d --build
Start-Sleep -Seconds 30

# 2. Kiểm tra gateway + tìm chuyến
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing

# 3. Kiểm tra Capy AI
Invoke-WebRequest -Uri "http://localhost:50060/health" -UseBasicParsing

# 4. Mở web
start http://localhost:3000
```

**Dev frontend thêm:**

```powershell
docker compose stop web
npm run dev:web
```

**Capy AI local (có Gemini key trong .env):**

```powershell
docker compose stop ai-service
npm run dev:ai
```

---

*Bản quyền © 2026 **Lữ Minh Hoàng**. All rights reserved. — Cappy Bus*
