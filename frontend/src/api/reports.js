import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
};

export const createReport = async (payload) => {
    const res = await axios.post(`${API_BASE}/reports/`, payload, { headers: getAuthHeaders() });
    return res.data;
};

export const listReports = async () => {
    const res = await axios.get(`${API_BASE}/reports/`, { headers: getAuthHeaders() });
    return res.data;
};

export const getReport = async (id) => {
    const res = await axios.get(`${API_BASE}/reports/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const updateReport = async (id, payload) => {
    const res = await axios.put(`${API_BASE}/reports/${id}`, payload, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteReport = async (id) => {
    await axios.delete(`${API_BASE}/reports/${id}`, { headers: getAuthHeaders() });
};

export const sendReportEmail = async (id, email, normalImage = null, heatmapImage = null, patientContext = {}) => {
    const res = await axios.post(
        `${API_BASE}/reports/${id}/send-email`,
        { email, normal_image: normalImage, heatmap_image: heatmapImage, patient_context: patientContext },
        { headers: getAuthHeaders() }
    );
    return res.data;
};
