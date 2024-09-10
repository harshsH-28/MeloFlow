import axios from "axios";

const baseURL = "http://localhost:8080/api/v1/";

const browseMusicAPI = (query) => {
    const response = axios.get(`${baseURL}search=${query}`);
}