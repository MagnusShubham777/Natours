

import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? "/api/v1/users/updatemypassword" : "/api/v1/users/updateMe"
        const res = await axios({
            method: "PATCH",
            url,
            data
        });
        if (res.data.status === 'success') {
            //console.log(res);
            showAlert("success", `${type.toUpperCase()} changed successfully`);
            if (type === 'password') {
                res.cookie('jwt', 'loggedout', {
                    expires: new Date(Date.now() + 10 * 1000),
                    httpOnly: true
                });
            }
            window.setTimeout(() => {
                location.assign('/login')
            }, 1500);

        }

    } catch (err) {
        showAlert("error", err.response.data.message);
    }
}