import axios from "axios";
// import store from "../store";
//import mock_api from "@/services/mock_customer";

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL_CUSTOMER || "http://localhost:3002"
});


api.interceptors.request.use(
  async config => {
    // var token = store.state.User.token;
    // if (token) {
    //   config.headers.Authorization = "Bearer " + token;
    // }
    if (!config.params) {
      config.params = {};
    }

    // if (store.state.currentSelected.pinCode) {
    //   config.params["pincode"] = store.state.currentSelected.pinCode;
    // }

    // if (store.state.currentSelected.partnerId) {
    //   config.params["partnerId"] = store.state.currentSelected.partnerId;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;
