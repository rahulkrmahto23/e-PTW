import axios from "axios";

const userApiClient = axios.create({
  baseURL: "https://e-ptw-17wr.vercel.app/api/v1/user",
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
});

// Request interceptor to add token if available
userApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle errors globally
userApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  try {
    const response = await userApiClient.post("/login", { email, password });
    // Store token if returned in response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed. Please try again.");
  }
};

export const signupUser = async (name, email, password, role = "CLIENT", level = 4) => {
  try {
    const response = await userApiClient.post("/signup", { 
      name, 
      email, 
      password, 
      role, 
      level 
    });
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
  }
};

export const logoutUser = async () => {
  try {
    const response = await userApiClient.get("/logout");
    localStorage.removeItem('token');
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed. Please try again.");
  }
};

export const verifyUser = async () => {
  try {
    const response = await userApiClient.get("/verify");
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Session verification failed.");
  }
};