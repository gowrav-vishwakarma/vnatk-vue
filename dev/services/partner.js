import axios from "axios";
// import store from "../store";
//import mock_api from "@/services/mock_customer";

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL_PARTNER || "http://localhost:3006",
});

api.interceptors.request.use(
  async (config) => {
    var token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsImZpcnN0X25hbWUiOiJSYWtlc2giLCJsYXN0X25hbWUiOiJTIiwibW9iaWxlIjoiMDAwMDAwMDAwMCIsImVtYWlsIjoicmFrZXNoLnNAZnJlbmR5LmluIiwidXNlclR5cGUiOiJlbXBsb3llZSIsInByb2ZpbGVfaWQiOjEsInBhcnRuZXJJZCI6bnVsbCwicGFydG5lckluZm8iOm51bGwsIlByb2ZpbGUubmFtZSI6IlN1cGVyQWRtaW4iLCJFbXBsb3llZXMud2FyZWhvdXNlX2lkIjo0LCJFbXBsb3llZXMuZW1wbG95ZWVfaWQiOjQyLCJzZXJ2aWNlIjoid21zIiwiaWF0IjoxNjY3ODE0OTAzLCJleHAiOjE2OTkzNTA5MDN9.Za3_teg9ibTCp1_Wuv-w4F4CT5eOX_11GVA_eg5kK58";
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
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
