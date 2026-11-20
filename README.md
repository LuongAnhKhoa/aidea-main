# Hướng Dẫn Tích Hợp & Vận Hành Đăng Nhập Google & Facebook (AIDEA)

Dự án AIDEA đã được lập trình hoàn thiện 100% tính năng **Đăng nhập và Đăng ký bằng tài khoản Google & Facebook**.

## Bàn giao mã nguồn và cấu hình môi trường

Phần này dành cho người nhận mã nguồn hoặc người quản lý Supabase. Mã nguồn không chứa cấu hình Supabase của dự án đích; người triển khai cần tự tạo/cấp quyền cho project của họ và điền biến môi trường tương ứng.

### Không gửi file `.env`

- Chỉ chia sẻ mã nguồn và các file mẫu `.env.example`.
- Không đưa `backend/.env`, `frontend/.env.local` hoặc bất kỳ file môi trường thực tế nào lên Git hay gửi qua chat/email thông thường.
- `OPENAI_API_KEY` là khóa bí mật của backend: người triển khai tự tạo/cấu hình qua kênh bí mật của môi trường chạy. Không đặt khóa này trong frontend hoặc trong biến có tiền tố `VITE_`.
- `SUPABASE_PUBLISHABLE_KEY` và `VITE_SUPABASE_PUBLISHABLE_KEY` là publishable key dùng ở client/server; không thay thế các chính sách RLS. Không sử dụng Supabase secret/service-role key trong frontend.
- Nếu một khóa bí mật đã bị đưa lên Git hoặc gửi ra ngoài kênh tin cậy, hãy thu hồi/rotate khóa đó và cập nhật lại môi trường triển khai.

### Các biến cần cấu hình

Sao chép `backend/.env.example` thành `backend/.env` và `frontend/.env.example` thành `frontend/.env.local`, sau đó thay giá trị mẫu bằng cấu hình của project/môi trường đang triển khai.

| Biến | Nơi cấu hình | Ghi chú |
| --- | --- | --- |
| `SUPABASE_URL` | `backend/.env` | URL project Supabase. |
| `SUPABASE_PUBLISHABLE_KEY` | `backend/.env` | Publishable key của project Supabase. |
| `VITE_SUPABASE_URL` | `frontend/.env.local` | Cùng URL project Supabase. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `frontend/.env.local` | Publishable key; được đóng gói vào frontend. |
| `PORT` | `backend/.env` | Cổng backend; mặc định `3001`. |
| `FRONTEND_ORIGIN` | `backend/.env` | Origin frontend được phép gọi API; local mặc định `http://localhost:5173`. Có thể khai báo nhiều origin, ngăn cách bằng dấu phẩy. |
| `OPENAI_API_KEY` | `backend/.env` hoặc secret của backend hosting | Tùy chọn cho phiên âm tệp ghi âm; cần cấu hình để dùng tính năng này. |
| `OPENAI_TRANSCRIPTION_MODEL` | Backend | Tùy chọn; mặc định `gpt-4o-mini-transcribe`. |
| `TRANSCRIPTION_ALLOW_LOCAL_DEV` | Backend | Chỉ đặt `true` khi cần thử phiên âm local không đăng nhập; luôn đặt `false` ở production. |

### Khởi tạo Supabase và chạy ứng dụng

1. Tạo/chọn project Supabase do người nhận quản lý.
2. Trong Supabase SQL Editor, chạy lần lượt các migration: `backend/supabase/migrations/001_profiles.sql`, `002_project_drafts.sql`, `003_project_draft_product_info.sql` và `004_project_analyses.sql`.
3. Trong Supabase Auth, thiết lập Site URL và Redirect URLs cho địa chỉ local hoặc domain production. Nếu bật Google/Facebook, cấu hình provider credentials và callback URLs của chính project đó.
4. Cài dependencies và chạy backend, frontend ở hai terminal riêng:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Mở `http://localhost:5173`. Khi đăng nhập, người dùng đi qua các bước và bản nháp thông tin khách hàng/sản phẩm được lưu theo tài khoản Supabase.

### Test nhanh bước “Nội dung yêu cầu”

Trong môi trường development, mở `http://localhost:5173/ai-tools?localTest=1&step=3` để vào thẳng bước 3 mà không cần đăng nhập. Chế độ này không tải/lưu bản nháp; form không được lưu. Chỉ dùng với backend local/non-production. Muốn thử gửi tệp ghi âm phiên âm mà không đăng nhập, backend local còn cần `TRANSCRIPTION_ALLOW_LOCAL_DEV=true` và một `OPENAI_API_KEY` hợp lệ. Không bật tùy chọn bỏ qua xác thực này trên production.

Tài liệu này được biên soạn thành **2 phần**:
- **Phần A:** Dành cho **Người ngoài ngành / Chủ dự án không chuyên công nghệ** (Hướng dẫn dạng *Cầm tay chỉ việc*, chỉ cần bấm link và Copy - Dán như điền form).
- **Phần B:** Dành cho **Lập trình viên / Đội ngũ kỹ thuật** (Cấu trúc code, biến môi trường, bảo mật và vận hành).
- **Phần C:** Bảng tra cứu và khắc phục lỗi thường gặp.

---

# PHẦN A: HƯỚNG DẪN DÀNH CHO NGƯỜI NGOÀI NGÀNH (KHÔNG CẦN BIẾT CODE)

> 💡 **Hiểu nhanh cơ chế trong 30 giây:**  
> Tính năng này hoạt động giống như việc bạn dùng **Tài khoản Google / Facebook** làm "Thẻ căn cước" để đăng nhập vào trang web AIDEA.  
> Để Google và Facebook tin tưởng AIDEA, bạn chỉ cần lên Google và Facebook tạo một "Mã định danh" (**Client ID**) và một "Khóa bí mật" (**Client Secret**), sau đó dán 2 mã này vào dịch vụ trung tâm của bạn (**Supabase**) là xong.

Bạn chỉ cần làm đúng **4 bước Copy - Dán** dưới đây:

---

### 🟢 BƯỚC 1: Lấy đường dẫn kết nối từ Supabase

1. Mở trang quản trị dự án của bạn: 👉 **[https://supabase.com/dashboard](https://supabase.com/dashboard)** (Đăng nhập tài khoản của bạn và bấm vào dự án).
2. Nhìn cột menu bên trái, bấm vào biểu tượng **Authentication** (hình ổ khóa) -> Chọn dòng **Sign In / Providers** (hoặc **Providers**).
3. Bấm vào chữ **Google** (hoặc **Facebook**).
4. Bạn sẽ thấy dòng **Callback URL (for OAuth)** có dạng:
   ```text
   https://<mã-dự-án-của-bạn>.supabase.co/auth/v1/callback
   ```
5. Bấm vào biểu tượng **Copy** bên cạnh đường dẫn này và cất vào đâu đó tạm thời (sẽ dùng ở Bước 2 và Bước 3).

---

### 🟢 BƯỚC 2: Cài đặt bên Google (Lấy mã Client ID Google)

1. Mở trang quản lý Google: 👉 **[https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)**
2. Nhìn lên góc trên cùng bên trái (ngay cạnh chữ Google Cloud), chọn đúng tên dự án của bạn (ví dụ: `AIDEA`).
3. Nhìn menu bên trái, bấm vào **OAuth consent screen** (hoặc *Google Auth Platform*):
   - Chọn **External** -> Bấm **Create**.
   - Điền tên ứng dụng: `AIDEA`, chọn email của bạn ở ô Support email và ô Developer email dưới cùng -> Bấm **Save and continue** đến khi hoàn tất.
   - *(Nếu app ở chế độ thử nghiệm: Trong mục **Test users**, bấm Add users và nhập email Gmail bạn muốn dùng để đăng nhập thử)*.
4. Nhìn menu bên trái, bấm vào **Credentials** (Thông tin xác thực):
   - Nhìn lên đỉnh trang, bấm nút **`+ Create Credentials`** -> Chọn **`OAuth client ID`**.
   - Mục **Application type**: Chọn **Web application**.
   - Mục **Authorized JavaScript origins**: Bấm *+ Add URI* -> Nhập: `http://localhost:5173` (và link web thật của bạn khi chạy chính thức).
   - Mục **Authorized redirect URIs**: Bấm *+ Add URI* -> **Dán đường dẫn Callback đã copy ở Bước 1** vào đây.
   - Bấm nút **Create**.
5. Google sẽ hiện bảng popup:
   - **Client ID**: Bấm nút Copy và lưu lại.
   - **Client Secret**: Bấm nút Copy và lưu lại.

---

### 🟢 BƯỚC 3: Cài đặt bên Facebook (Lấy mã App ID Facebook)

1. Mở trang quản lý Facebook Developer: 👉 **[https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)**
2. Bấm nút **Tạo ứng dụng** *(Create App)*:
   - Chọn mục đích: **Xác thực và yêu cầu dữ liệu từ người dùng bằng Đăng nhập bằng Facebook** *(Authenticate and request data with Facebook Login)*.
   - Đặt tên ứng dụng và bấm Tạo.
3. Thêm quyền đọc Email:
   - Ở cột bên trái, bấm vào **Đăng nhập bằng Facebook** -> chọn **Quyền và tính năng**.
   - Tìm dòng chữ **email** -> Bấm nút **+ Thêm** (+ Add).
4. Khai báo đường dẫn chuyển hướng:
   - Ở cột bên trái, bấm vào **Đăng nhập bằng Facebook** -> chọn **Cài đặt** *(Settings)*.
   - Kéo xuống tìm ô: **`URI chuyển hướng OAuth hợp lệ`** *(Valid OAuth Redirect URIs)*.
   - **Dán đường dẫn Callback đã copy ở Bước 1** vào ô này.
   - Nhấn **Enter** trên bàn phím -> Kéo xuống góc dưới bên phải bấm **Lưu thay đổi** *(Save changes)*.
   - *(Lưu ý: Không dán vào ô Miền ứng dụng hay ô Kiểm tra thử)*.
5. Lấy mã ID và Secret:
   - Nhìn menu bên trái, bấm vào **Cài đặt ứng dụng** *(App settings)* -> chọn **Cơ bản** *(Basic)*.
   - Copy **ID ứng dụng** (App ID).
   - Ở ô **Khóa bí mật của ứng dụng** (App Secret), bấm nút **Hiển thị** (nhập mật khẩu Facebook nếu hỏi) -> Copy mã bí mật.
6. Kích hoạt quyền đăng nhập:
   - Trong mục Cơ bản này, bạn điền link web vào ô *Chính sách quyền riêng tư* và chọn một *Hạng mục*, tải lên 1 ảnh logo vuông, bấm Lưu.
   - Bấm vào mục **Phát hành** *(Publish)* ở menu bên trái để chuyển App sang trạng thái công khai cho mọi người cùng đăng nhập.

---

### 🟢 BƯỚC 4: Dán các mã vào Supabase & Khởi động Web

1. Mở lại trang Supabase: 👉 **[https://supabase.com/dashboard](https://supabase.com/dashboard)** (Vào dự án của bạn).
2. Vào **Authentication** -> **Sign In / Providers**:
   - **Mục Google:** Bật công tắc ON -> Dán Client ID & Client Secret của Google vào -> Bấm **Save**.
   - **Mục Facebook:** Bật công tắc ON -> Dán Client ID (App ID) & Client Secret của Facebook vào -> Bấm **Save**.
3. Vào **Authentication** -> **URL Configuration**:
   - Tìm ô **Redirect URLs** -> Nhập vào: `http://localhost:5173/**` -> Bấm **Save**.
4. Tạo bảng lưu trữ người dùng:
   - Vào menu bên trái chọn **SQL Editor** -> Bấm **New query**.
   - Mở file `backend/supabase/migrations/001_profiles.sql` trong thư mục mã nguồn bằng Notepad, copy toàn bộ nội dung và dán vào ô trên màn hình -> Bấm nút xanh **Run**.
5. Cập nhật file cấu hình trên máy tính:
   - Vào thư mục `frontend/` trên máy tính của bạn.
   - Tìm file tên là `.env.local` (nếu chưa có thì copy file `.env.example` và đổi tên thành `.env.local`).
   - Nhấp chuột phải vào file `.env.local` -> Chọn **Open with** (Mở bằng) -> Chọn **Notepad**.
   - Sửa 2 dòng thành thông tin của Supabase bạn:
     ```env
     VITE_SUPABASE_URL=https://<mã-dự-án-của-bạn>.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=<mã-anon-key-lấy-ở-mục-Project-Settings-API>
     ```
   - Nhấn **Ctrl + S** để lưu lại và đóng Notepad.

---

# PHẦN B: DÀNH CHO LẬP TRÌNH VIÊN & VẬN HÀNH KỸ THUẬT

### 1. Kiến trúc luồng xác thực (Authentication Flow)
```
[Người dùng click nút Google/Facebook]
                 │
                 ▼
[Frontend: AuthForms.jsx gọi signInWithProvider()]
                 │
                 ▼
[Supabase Auth Service: Chuyển hướng OAuth sang Provider]
                 │
                 ▼
[Google / Facebook xác thực danh tính người dùng]
                 │
                 ▼
[Redirect về: https://<project>.supabase.co/auth/v1/callback]
                 │
                 ▼
[Supabase tạo User & Session -> Kích hoạt Trigger SQL tự động tạo Profiles]
                 │
                 ▼
[Chuyển hướng người dùng về lại Frontend http://localhost:5173 kèm Access Token]
```

### 2. Các file mã nguồn chính đã được lập trình

- [`frontend/src/components/AuthForms.jsx`](file:///c:/xampp/htdocs/aidea-main/frontend/src/components/AuthForms.jsx):
  - Thành phần `SocialButtons`: Kết nối `signInWithProvider('google')` và `signInWithProvider('facebook')`.
  - Quản lý trạng thái loading `Đang chuyển hướng...` và hiển thị thông báo lỗi `AuthFeedback`.
- [`frontend/src/auth/AuthContext.jsx`](file:///c:/xampp/htdocs/aidea-main/frontend/src/auth/AuthContext.jsx):
  - Quản lý trạng thái đăng nhập tập trung, tự động khôi phục phiên (`getSession`) và lắng nghe sự kiện (`onAuthStateChange`).
- [`frontend/src/auth/supabase.js`](file:///c:/xampp/htdocs/aidea-main/frontend/src/auth/supabase.js):
  - Khởi tạo client Supabase với các biến môi trường Vite.
- [`backend/supabase/migrations/001_profiles.sql`](file:///c:/xampp/htdocs/aidea-main/backend/supabase/migrations/001_profiles.sql):
  - Bảng `profiles` kèm trigger `on_auth_user_created` tự động trích xuất thông tin người dùng từ metadata OAuth.

### 3. Lệnh khởi chạy ứng dụng

```bash
# Di chuyển vào frontend
cd frontend

# Cài đặt thư viện phụ thuộc
npm install

# Chạy server phát triển
npm run dev
```

---

# PHẦN C: BẢNG TRA CỨU & XỬ LÝ LỖI NHANH (FAQ)

| Hiện tượng / Thông báo lỗi | Nguyên nhân | Cách khắc phục nhanh |
| :--- | :--- | :--- |
| **Error 400: `redirect_uri_mismatch`** *(Google)* | Đường dẫn Callback trong Google Cloud Console chưa đúng với mã Supabase đang chạy. | Vào Google Cloud -> Credentials -> Bấm vào Client ID -> Thêm chính xác `https://<mã-supabase>.supabase.co/auth/v1/callback` vào ô **Authorized redirect URIs** và bấm Lưu. |
| **`Ứng dụng không hoạt động`** *(Facebook)* | App Facebook đang ở chế độ Chưa công bố và tài khoản đăng nhập không phải là Admin tạo app. | Vào Facebook Developer -> App của bạn -> Điền Privacy Policy URL trong phần Cơ bản và chuyển trạng thái sang **Đã phát hành (Live)**, hoặc vào mục **Vai trò (Roles)** thêm nick test vào. |
| **`Đây là URI chuyển hướng không hợp lệ`** *(Facebook)* | Người dùng dán nhầm Callback URL vào ô "Trình kiểm tra thử" ở dưới. | Kéo lên phía trên, dán vào đúng ô **`URI chuyển hướng OAuth hợp lệ`** và bấm **Lưu thay đổi**. |
| **`Miền thuộc sở hữu người khác`** *(Facebook)* | Người dùng điền chữ `supabase.co` vào ô "Miền ứng dụng" (App Domains). | Xóa trắng ô Miền ứng dụng. Đường dẫn Supabase chỉ được phép dán vào ô **URI chuyển hướng OAuth hợp lệ**. |
| **Bấm nút không phản hồi hoặc báo cấu hình** | File `.env.local` chưa có thông tin Supabase hoặc server chưa nhận file. | Mở file `.env.local` kiểm tra lại 2 dòng URL và Key, sau đó tắt cửa sổ terminal chạy web và gõ lại `npm run dev`. |
