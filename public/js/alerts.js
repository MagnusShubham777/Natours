export const hideAlert = () => {
    const el = document.querySelector('.alert')
    if (el) el.parentElement.removeChild(el);
}
//Tyope can be success or error
export const showAlert = (type, mes) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${mes}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
}