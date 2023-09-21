import axios from "axios";
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }

        });
        if (res.data.status === 'success') {
            showAlert('success', 'Signed up sucessfully');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500);
        }

    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
    }
}