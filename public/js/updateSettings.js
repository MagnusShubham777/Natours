

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

        }

    } catch (err) {
        showAlert("error", err.response.data.message);
    }
}