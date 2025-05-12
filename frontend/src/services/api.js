import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/auth';

export const signup = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, formData);
        return response.data;
    } catch (error) {
        console.error('Signup error:', error.response?.data || error.message);
        throw error;
    }
};

export const login = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, formData);
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
};

export const askQuestion = async (question) => {
    try {
        const response = await axios.post('http://localhost:8000/chatbot', { question });
        return response.data;
    } catch (error) {
        console.error('Chatbot error:', error.response?.data || error.message);
        throw error;
    }
};