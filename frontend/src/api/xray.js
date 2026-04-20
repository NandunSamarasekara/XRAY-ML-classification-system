import client from './client';

export const uploadXRayToPredict = async (patientId, file, viewType = 'PA') => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('x_ray_view', viewType);
    formData.append('file', file);

    const response = await client.post('/xray/predict', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
