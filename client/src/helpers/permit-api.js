import axios from "axios";

const isLocalhost = window.location.hostname === "localhost";

const apiClient = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:5000/api/v1/permits"
    : "https://e-ptw-17wr.vercel.app/api/v1/permits",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});



// Helper function to handle errors consistently
const handleError = (error) => {
  console.error("API Error:", error.response?.data || error);
  throw new Error(error.response?.data?.message || "An unexpected error occurred");
};

export const createPermit = async (permitData) => {
  try {
    const res = await apiClient.post("/", permitData);
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getAllPermits = async () => {
  try {
    const res = await apiClient.get("/");
    return {
      success: true,
      message: res.data.message,
      permits: res.data.permits,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const approvePermit = async (permitId) => {
  try {
    const res = await apiClient.get(`/approve/${permitId}`);
    return {
      success: true,
      message: res.data.message,
      approvedBy: res.data.approvedBy,
      currentLevel: res.data.currentLevel,
      permitStatus: res.data.permitStatus,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const returnPermit = async (permitId, requiredChanges) => {
  try {
    const res = await apiClient.put(`/return/${permitId}`, { requiredChanges });
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const editPermitDetails = async (permitId, updates) => {
  try {
    const res = await apiClient.put(`/edit/${permitId}`, updates);
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const searchPermits = async (searchParams) => {
  try {
    const res = await apiClient.get("/search", { params: searchParams });
    return {
      success: true,
      message: res.data.message,
      count: res.data.count,
      permits: res.data.permits,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const deletePermit = async (permitId) => {
  try {
    const res = await apiClient.delete(`/delete/${permitId}`);
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    return handleError(error);
  }
};

// Get a specific permit by ID
export const getPermitById = async (permitId) => {
  try {
    const res = await apiClient.get(`/${permitId}`);
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    return handleError(error);
  }
};

// Get pending permits for the current user's level
export const getPendingPermits = async () => {
  try {
    const res = await apiClient.get("/pending/user");
    return {
      success: true,
      message: res.data.message,
      count: res.data.count,
      permits: res.data.permits,
    };
  } catch (error) {
    return handleError(error);
  }
};

// Additional utility functions
export const getPermitStatusOptions = () => {
  return [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Returned", label: "Returned" },
  ];
};

export const getPermitTypeOptions = () => [
  { value: "General", label: "General Permit" },
  { value: "Height", label: "Height Work Permit" },
  { value: "Confined", label: "Confined Space Permit" },
  { value: "Excavation", label: "Excavation Permit" },
  { value: "Civil", label: "Civil Work Permit" },
  { value: "Hot", label: "Hot Work Permit" }
];

export const getLevelOptions = () => {
  return [
    { value: 1, label: "Level 1 (Final Approver)" },
    { value: 2, label: "Level 2" },
    { value: 3, label: "Level 3" },
    { value: 4, label: "Level 4 (Creator)" },
  ];
};