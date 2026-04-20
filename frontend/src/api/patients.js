import apiClient from "./client";

export async function listPatients() {
    const response = await apiClient.get("/patients/");
    return response.data;
}

export async function getPatient(id) {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
}

export async function createPatient(patientData) {
    const response = await apiClient.post("/patients/", patientData);
    return response.data;
}

export async function updatePatient(id, patientData) {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
}

export async function deletePatient(id) {
    await apiClient.delete(`/patients/${id}`);
}

export async function verifyPatientOTP(id, otp) {
    const response = await apiClient.post(`/patients/${id}/verify-otp`, { otp });
    return response.data;
}

export async function sendPatientOTP(id) {
    const response = await apiClient.post(`/patients/${id}/send-otp`);
    return response.data;
}
