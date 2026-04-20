import client from './client';

export const saveComparison = async (payload) => {
    const response = await client.post('/comparisons/', payload);
    return response.data;
};

export const getComparisons = async () => {
    const response = await client.get('/comparisons/');
    return response.data;
};

export const updateComparison = async (caseId, payload) => {
    const response = await client.put(`/comparisons/${caseId}`, payload);
    return response.data;
};

export const deleteComparison = async (caseId) => {
    const response = await client.delete(`/comparisons/${caseId}`);
    return response.data;
};
