import axios from "axios";

const permitApiClient = axios.create({
  baseURL: "https://e-ptw-17wr.vercel.app/api/v1/permits",
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
});

// Request interceptor to add token if available
permitApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle errors globally
permitApiClient.interceptors.response.use(
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

export const createPermit = async (permitData) => {
  try {
    const response = await permitApiClient.post("/", permitData);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create permit.");
  }
};

export const getAllPermits = async () => {
  try {
    const response = await permitApiClient.get("/");
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch permits.");
  }
};

export const approvePermit = async (permitId) => {
  try {
    const response = await permitApiClient.post(`/${permitId}/approve`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve permit.");
  }
};

export const returnPermit = async (permitId, requiredChanges) => {
  try {
    const response = await permitApiClient.post(`/${permitId}/return`, { requiredChanges });
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to return permit.");
  }
};

export const editPermitDetails = async (permitId, updates) => {
  try {
    const response = await permitApiClient.put(`/${permitId}`, updates);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update permit.");
  }
};

export const searchPermits = async (searchParams) => {
  try {
    const response = await permitApiClient.get("/search", { params: searchParams });
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Search failed.");
  }
};

export const deletePermit = async (permitId) => {
  try {
    const response = await permitApiClient.delete(`/${permitId}`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete permit.");
  }
};

export const getPermitById = async (permitId) => {
  try {
    const response = await permitApiClient.get(`/${permitId}`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch permit details.");
  }
};

export const getPendingPermits = async () => {
  try {
    const response = await permitApiClient.get("/pending");
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch pending permits.");
  }
};

// Utility functions remain the same
export const getPermitStatusOptions = () => [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Returned", label: "Returned" },
];

export const getPermitTypeOptions = () => [
  { value: "General", label: "General Permit" },
  { value: "Height", label: "Height Work Permit" },
  { value: "Confined", label: "Confined Space Permit" },
  { value: "Excavation", label: "Excavation Permit" },
  { value: "Civil", label: "Civil Work Permit" },
  { value: "Hot", label: "Hot Work Permit" }
];

export const getLevelOptions = () => [
  { value: 1, label: "Level 1 (Final Approver)" },
  { value: 2, label: "Level 2" },
  { value: 3, label: "Level 3" },
  { value: 4, label: "Level 4 (Creator)" },
];