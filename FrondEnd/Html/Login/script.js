// const togglePassword = document.querySelector('#togglePassword');
// const passwordInput = document.querySelector('input[type="password"]');

// togglePassword.addEventListener('click', function () {
//     // Chuyển đổi qua lại giữa 'password' và 'text'
//     const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//     passwordInput.setAttribute('type', type);
    
//     // Đổi icon con mắt
//     this.classList.toggle('fa-eye');
//     this.classList.toggle('fa-eye-slash');
// });
// Thanh Phong 4/2/2026 lỗi hiệu ứng 

function togglePass(inputId, icon) {
    const passwordInput = document.getElementById(inputId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

