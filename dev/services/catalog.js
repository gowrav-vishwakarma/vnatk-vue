import axios from "axios";
// import store from "../store";
//import mock_api from "@/services/mock_customer";

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL_CUSTOMER || "http://localhost:3002"
});


api.interceptors.request.use(
  async config => {
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlN1cGVyQWRtaW5OYW1lIiwidHlwZSI6IkFkbWluIiwiaWF0IjoxNjEyNzY0NjQyLCJleHAiOjE2NDQzMDA2NDJ9.GIEAUVUMdFNiW_lCW---J1Qz5ABWTx8MC67I5SXRiZw";
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
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
