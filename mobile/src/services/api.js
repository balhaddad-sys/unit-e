/**
 * API Service Layer
 * Handles all backend communication with Google Apps Script
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '@env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Handle responses and errors
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  },
);

// Authentication APIs
export const login = async (email, password) => {
  try {
    const response = await api.post('', {
      action: 'login',
      email,
      password,
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const register = async (name, email, password, role) => {
  try {
    const response = await api.post('', {
      action: 'register',
      name,
      email,
      password,
      role,
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await api.post('', {action: 'logout'});
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Patient APIs
export const getPatients = async () => {
  try {
    const response = await api.post('', {action: 'getPatients'});
    return response;
  } catch (error) {
    throw new Error('Failed to fetch patients');
  }
};

export const getPatient = async patientId => {
  try {
    const response = await api.post('', {
      action: 'getPatient',
      patientId,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to fetch patient details');
  }
};

export const addPatient = async patientData => {
  try {
    const response = await api.post('', {
      action: 'addPatient',
      ...patientData,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to add patient');
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await api.post('', {
      action: 'updatePatient',
      patientId,
      ...patientData,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to update patient');
  }
};

export const deletePatient = async patientId => {
  try {
    const response = await api.post('', {
      action: 'deletePatient',
      patientId,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to delete patient');
  }
};

// Ward Round APIs
export const getWardRounds = async () => {
  try {
    const response = await api.post('', {action: 'getWardRounds'});
    return response;
  } catch (error) {
    throw new Error('Failed to fetch ward rounds');
  }
};

export const getWardRound = async roundId => {
  try {
    const response = await api.post('', {
      action: 'getWardRound',
      roundId,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to fetch ward round details');
  }
};

export const createWardRound = async roundData => {
  try {
    const response = await api.post('', {
      action: 'createWardRound',
      ...roundData,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to create ward round');
  }
};

export const updateWardRound = async (roundId, roundData) => {
  try {
    const response = await api.post('', {
      action: 'updateWardRound',
      roundId,
      ...roundData,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to update ward round');
  }
};

// AI Consultation APIs
export const performOCR = async imageBase64 => {
  try {
    const response = await api.post('', {
      action: 'performOCR',
      image: imageBase64,
    });
    return response;
  } catch (error) {
    throw new Error('OCR processing failed');
  }
};

export const parseLabResults = async ocrText => {
  try {
    const response = await api.post('', {
      action: 'parseLabResults',
      text: ocrText,
    });
    return response;
  } catch (error) {
    throw new Error('Lab result parsing failed');
  }
};

export const getAIConsultation = async (question, context) => {
  try {
    const response = await api.post('', {
      action: 'aiConsultation',
      question,
      context,
    });
    return response;
  } catch (error) {
    throw new Error('AI consultation failed');
  }
};

export const getClinicalDecisionSupport = async patientData => {
  try {
    const response = await api.post('', {
      action: 'clinicalDecisionSupport',
      patientData,
    });
    return response;
  } catch (error) {
    throw new Error('Clinical decision support failed');
  }
};

// Analytics APIs
export const getDashboardStats = async () => {
  try {
    const response = await api.post('', {action: 'getDashboardStats'});
    return response;
  } catch (error) {
    throw new Error('Failed to fetch dashboard statistics');
  }
};

export default api;
