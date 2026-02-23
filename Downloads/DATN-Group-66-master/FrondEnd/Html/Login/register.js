document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('reg-pass').value;
  const confirm = document.getElementById('confirm-pass').value;

  if (!fullName || !email || !password || !confirm) {
    showToast("Vui lòng nhập đầy đủ thông tin", "error");
    return;
  }

  if (password !== confirm) {
    showToast("Mật khẩu xác nhận không khớp", "error");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Đăng ký thất bại", "error");
      return;
    }

    // ✅ Chỉ hiện khi backend trả thành công
    showToast(data.message, "success", true);

  } catch (error) {
    console.error('Lỗi:', error);
    showToast("Không kết nối được server", "error");
  }
});


function showToast(message, type = "success", redirect = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
    if (redirect) {
      window.location.href = "index.html";
    }
  }, 3000);
}