import axios from 'axios';

export const api = axios.create({
    baseURL: "https://karrali-pos-backend.onrender.com/api",
    //baseURL: "http://localhost:3003/api",
});