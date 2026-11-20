export function getAuthErrorMessage(error, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  const message = typeof error === 'string' ? error : error?.message;
  const normalized = message?.toLowerCase() ?? '';

  if (/invalid login credentials|invalid email or password/.test(normalized)) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  if (/email not confirmed|email_not_confirmed/.test(normalized)) {
    return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.';
  }
  if (/user already registered|user_already_exists|already been registered|email.*already.*(registered|exist)|duplicate.*email/.test(normalized)) {
    return 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.';
  }
  if (/new password.*(different|same).*(old|current)|password.*same as.*(old|current)|different from.*(old|current) password/.test(normalized)) {
    return 'Mật khẩu mới không được trùng với mật khẩu hiện tại. Vui lòng chọn mật khẩu khác.';
  }
  if (/password.*(at least|characters|weak)|weak password|password should be/.test(normalized)) {
    return 'Mật khẩu chưa đáp ứng yêu cầu. Vui lòng chọn mật khẩu mạnh hơn.';
  }
  if (/invalid email|unable to validate email address/.test(normalized)) {
    return 'Địa chỉ email không hợp lệ.';
  }
  if (/rate limit|too many requests|security purposes/.test(normalized)) {
    return 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.';
  }
  if (/provider is not enabled|unsupported provider|provider.*not enabled/.test(normalized)) {
    return 'Phương thức đăng nhập này chưa được bật trong cấu hình Supabase.';
  }
  if (/session.*(missing|not found)|auth session missing/.test(normalized)) {
    return 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.';
  }
  if (/fetch failed|failed to fetch|network error|load failed/.test(normalized)) {
    return 'Không thể kết nối đến dịch vụ đăng nhập. Vui lòng kiểm tra mạng và cấu hình Supabase.';
  }

  return fallback;
}
