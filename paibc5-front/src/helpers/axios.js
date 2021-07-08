import axios from 'axios';

export const axiosInstance = (token) => {
    return axios.create({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token
        }
    })
};