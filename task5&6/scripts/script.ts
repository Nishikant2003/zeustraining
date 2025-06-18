

const passwordInput = document.querySelector<HTMLInputElement>(".passwordInput") 
const toggleBtns = document.querySelector<HTMLButtonElement>(".togglePassword")

if (toggleBtns) {
    toggleBtns.addEventListener('click', ()=>{
        if (passwordInput){
            passwordInput.type = passwordInput.type == 'password'? 'text' : 'password';
        }
    })
}

