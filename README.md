# 🎵 VanhSound - Open Audio Universe & V-Music Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80" alt="VanhSound Banner" width="100%" style="border-radius: 16px;" />
</p>

<p align="center">
  <b>Nền tảng phát trực tuyến âm nhạc mở thế hệ mới kết hợp giữa SoundCloud, Spotify và Linear Design System.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 11" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Audius_API-Decentralized-8B5CF6?style=for-the-badge" alt="Audius API" />
</p>

---

## ✨ Tính Năng Nổi Bật

### 💎 Nhận Diện Thương Hiệu Độc Quyền: VanhSound
- **Signature Monogram Logo:** Chữ **"V"** cách điệu với 4 dải sóng âm (Equalizer Spectrum) đổi màu Gradient Neon (`#5E6AD2` → `#8B5CF6` → `#EC4899`) và tự động nhảy nhịp theo nhạc đang phát.
- **Linear / Modern Aesthetics:** Bảng màu Deep Space (`#050506`, `#020203`), hiệu ứng Mouse-Tracking Spotlight trên các thẻ nhạc, bóng đổ 3 lớp và viền hairline siêu mảnh.

### 🌊 Tính Năng Chuẩn SoundCloud
- **Interactive Waveform Scrubber:** Hiển thị 75 cột sóng âm thực tế của từng bài hát, rê chuột xem trước timestamp và click tua nhạc trực tiếp trên từng đỉnh sóng.
- **Timed Comments (Bình luận theo từng giây):** Người nghe có thể gửi bình luận ghim vào đúng giây của bài hát. Avatar người bình luận xuất hiện dạng chấm nổi trên thanh sóng âm, click vào để nhảy audio tới khoảnh khắc đó.
- **Creator Studio:** Cho phép tải lên bài hát cá nhân, tự động trích xuất phổ sóng âm và xuất bản lên cộng đồng.

### ⚡ Kho Nhạc Không Giới Hạn (Full Length 100% - Không Giới Hạn 30s)
- **Audius Open Network API:** Phát trực tiếp hàng trăm nghìn bài hát EDM, Trap, House, Lofi quốc tế trọn vẹn chất lượng phòng thu 320kbps.
- **Open Remix & Video Audio Network:** Tìm bài nào có bài đó! Hỗ trợ mọi phiên bản Remix TikTok, Vinahouse 30 - 60 phút, Speed up, Nightcore, V-Pop (Sơn Tùng M-TP, Đen Vâu, HIEUTHUHAI, Vũ., Chillies, MONO...).
- **Không tốn dung lượng lưu trữ CSDL:** Phát trực tiếp qua API và CDN stream tốc độ cao.

### 🎤 Lời Bài Hát Đồng Bộ (Karaoke LRC) & Phím Tắt Toàn Cục
- **Karaoke Real-time Sync:** Lời bài hát tự động cuộn và phát sáng theo từng câu hát.
- **Phím tắt nhanh:** `Space` (Play/Pause), `M` (Mute), `Arrow Left/Right` (Tua ±5s), `Arrow Up/Down` (Âm lượng), `L` (Lời bài hát), `Q` (Hàng đợi), `F` (Toàn màn hình).
- **Hệ thống Auth:** Đăng ký, đăng nhập tài khoản với Laravel Sanctum & giao diện Glassmorphism.

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend:** PHP 8.2+ / Laravel 11 API (Sanctum Auth, Eloquent ORM).
- **Database:** MySQL on Laragon.
- **Frontend:** React 19, Vite 7, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **State Management:** Zustand (Global Persistent Audio Engine).
- **Music APIs:** Audius Discovery Provider API, Open Audio Stream Resolver.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Clone repository
```bash
git clone https://github.com/vanh1711/VanhSound.git
cd VanhSound
```

### 2. Cài đặt các gói phụ thuộc
```bash
# Cài đặt PHP packages
composer install

# Cài đặt Node packages
npm install
```

### 3. Cấu hình môi trường (.env)
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
php artisan key:generate
```
Cấu hình kết nối MySQL trong `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=musicweb
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrate và Seed dữ liệu mẫu
```bash
php artisan migrate:fresh --seed
```

### 5. Khởi chạy máy chủ
Mở 2 terminal chạy đồng thời:
```bash
# Terminal 1: Laravel Backend
php artisan serve

# Terminal 2: Vite Frontend Dev Server
npm run dev
```

Truy cập trình duyệt: 👉 `http://127.0.0.1:8000`

---

## 👨‍💻 Tác Giả

- **GitHub:** [@vanh1711](https://github.com/vanh1711)
- **Dự án:** VanhSound - Open Audio Universe

---

## 📄 Giấy Phép
Dự án được phân phối dưới giấy phép **MIT License**.
