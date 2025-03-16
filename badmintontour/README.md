# ROLEX CHAMPION Tournament Management

Ứng dụng quản lý giải đấu cầu lông ROLEX CHAMPION 2024, được xây dựng bằng Next.js và TypeScript.

## Tính năng

- Quản lý các trận đấu vòng bảng
- Tự động tạo các trận tứ kết, bán kết và chung kết
- Hiển thị sơ đồ cây giải đấu
- Cập nhật điểm số trực tiếp
- Tính toán bảng xếp hạng tự động
- Giao diện responsive, thân thiện với người dùng

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd badmintontour
```

2. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

3. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
# hoặc
yarn dev
```

4. Mở trình duyệt và truy cập `http://localhost:3000`

## Công nghệ sử dụng

- Next.js 14
- TypeScript
- React
- Bootstrap 5
- IndexedDB (để lưu trữ dữ liệu locally)

## Cấu trúc thư mục

```
badmintontour/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── page.tsx          # Main page component
├── types/                 # TypeScript type definitions
├── services/             # Database and other services
├── utils/                # Utility functions
├── data/                 # Initial data and constants
└── public/               # Static files
```

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request để cải thiện ứng dụng.

## License

MIT