import axios from "axios";

const apiClient = axios.create({
  baseURL:  "https://e-ptw-nine.vercel.app/api/v1/user",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const loginUser = async (email, password) => {
  try {
    const res = await apiClient.post("/login", { email, password });
    return {
      success: true,
      message: res.data.message,
      user: {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        level: res.data.level,
      },
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Unable to login");
  }
};

export const signupUser = async (
  name,
  email,
  password,
  role = "CLIENT",
  level = 4
) => {
  try {
    const res = await apiClient.post("/signup", {
      name,
      email,
      password,
      role,
      level,
    });
    return {
      success: true,
      message: res.data.message,
      user: {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        level: res.data.level,
      },
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to signup");
  }
};

export const logoutUser = async () => {
  try {
    const res = await apiClient.get("/logout");
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to logout");
  }
};

export const verifyUser = async () => {
  try {
    const res = await apiClient.get("/verify");
    return {
      success: true,
      message: res.data.message,
      user: {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        level: res.data.level,
      },
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to verify user");
  }
};
