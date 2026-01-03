import { isValidName ,isValidEmail ,isStrongPassword } from "./validation.js";


const {log} = console;
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const errMsg = document.getElementById('errMsg');
const popupIconContainer = document.getElementById('popupIconContainer'); 
const smileIcon = `<i class="fa-solid fa-face-smile"></i>`;
const errIcon = '<i class="fa-solid fa-circle-exclamation"></i>';
const errPopup = document.getElementById('errPopup');
const errMsgContainer = document.getElementById('errMsgContainer');

signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const validName = isValidName(name);
    
    if(!validName.ok) return showError(validName.msg,true);

    const validEmail = isValidEmail(email);

    if(!validEmail.ok) return showError(validEmail.msg);

    const validPassword = isStrongPassword(password);

    if(!validPassword.ok) return showError(validPassword.msg);


    const response = await fetch('/signup',{
        method : 'post',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({name,email,password})
    });

    const data = response.json();

    if (!response.ok) {
        if(response.status == 401){
            showError("An account with this email already exists. Please sign in.",true);
        }else{
            showError("Something went wrong! please try again")
        }
    }else{
        window.location.href = '/';          
    }
    
    console.log(data);

    
})


function showError(msg,warn){
    if(errPopup.classList.contains('hidden')){
        errPopup.classList.remove('hidden');
        errMsgContainer.classList.add('info');
        setTimeout(() => {
            errPopup.classList.add('hidden');
            errMsgContainer.classList.remove('info');
        }, 4000);
    }

    popupIconContainer.innerHTML = warn ? smileIcon : errIcon ;
    errMsg.innerText = msg;
}



signinForm?.addEventListener('submit',async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const validEmail = isValidEmail(email);

    if(!validEmail.ok) return showError(validEmail.msg);

    const response = await fetch('/signIn',{
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({email,password})
    });

    const data = await response.json();

    if (!response.ok) {
        if(response.status == 401){
            showError("Invalid username or Password")
        }else{
            showError("Something went wrong! please try again")
        }
    }else{
        window.location.href = '/';          
    }
    
    console.log(data);



});


