import axios from "axios";
import BASE_API_FRTNEND from "../config/apiConifg";

const API = BASE_API_FRTNEND;

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_API_FRTNEND}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
      mode: 'cors'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }

    return data;
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error(error.message || "Login failed. Please try again.");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${BASE_API_FRTNEND}/api/auth/forgot-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    throw new Error("Failed to process password reset. Please try again later.");
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${BASE_API_FRTNEND}/api/auth/verify-otp`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, otp }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw new Error("OTP verification failed. Please try again.");
  }
};

export const resetPassword = async (email, password) => {
  try {
    const response = await fetch(`${BASE_API_FRTNEND}/api/auth/reset-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Reset password error:", error);
    throw new Error("Password reset failed. Please try again.");
  }
};