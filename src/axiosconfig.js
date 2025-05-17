// src/api/axiosConfig.js
import axios from "axios";

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// import { supabase } from "../path/to/your/supabaseClient"; // Adjust path

const apiClient = axios.create({
  baseURL: "https://flask-production-1e2d.up.railway.app/api", // Your API base URL
});

// apiClient.interceptors.request.use(
//   async (config) => {
//     // Only add auth header for requests to your API, not external ones
//     if (config.url.startsWith("http://127.0.0.1:8000/api")) {
//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) {
//         console.error(
//           "Error getting Supabase session for Axios interceptor:",
//           sessionError
//         );
//         // Potentially redirect to login or handle error
//         return Promise.reject(sessionError);
//       }

//       if (session?.user?.id) {
//         // Using Supabase user ID directly as X-User-Id
//         // Your backend's get_authenticated_user_profile() must expect this.
//         config.headers["X-User-Id"] = session.user.id;
//         console.log(
//           "Axios Interceptor: Added X-User-Id header:",
//           session.user.id
//         );
//       }
//       // If using JWT tokens from Supabase:
//       // if (session?.access_token) {
//       //   config.headers['Authorization'] = `Bearer ${session.access_token}`;
//       // }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }

export default apiClient;
