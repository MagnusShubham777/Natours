import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe'
//DOM elements
const loginform = document.querySelector('.login-form');
const logoutbtn = document.querySelector('.nav__el--logout');
const signupform = document.querySelector('.signup-form ');
const updateData = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-settings');
const bookbtn = document.getElementById('book-tour')


if (loginform) {
    loginform.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);

    })
};

if (signupform) {
    signupform.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const passwordConfirm = document.getElementById('passwordconfirm').value;
        console.log()
        signup(name, email, password, passwordConfirm);

    })
};


if (logoutbtn) {
    logoutbtn.addEventListener('click', logout);
}

if (updateData) {
    updateData.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    })
}
if (updatePassword) {
    updatePassword.addEventListener('submit', e => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const currentPassword = document.getElementById('password-current').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        updateSettings({ password, currentPassword, passwordConfirm }, 'password');
    })
}
if (bookbtn) {
    bookbtn.addEventListener('click', e => {
        e.preventDefault();
        //console.log(e.target);
        const tourid = e.target.getAttribute("data-tour-id");
        //console.log(tourid);
        bookTour(tourid)

    })
}