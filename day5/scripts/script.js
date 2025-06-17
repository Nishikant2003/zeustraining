var passwordInput = document.querySelector(".passwordInput");
var toggleBtns = document.querySelector(".togglePassword");
if (toggleBtns) {
    toggleBtns.addEventListener('click', function () {
        if (passwordInput) {
            passwordInput.type = passwordInput.type == 'password' ? 'text' : 'password';
        }
    });
}
