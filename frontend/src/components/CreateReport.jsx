import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { createReport, updateReport } from '../api/reports';
import { saveDraftImages, getDraftImages, deleteDraftImages } from '../utils/draftStorage';

export default function CreateReport({ patient, doctor, reportContext, initialReport, onSaveDraft, onFinalize, onBack }) {
    const [form, setForm] = useState({
        diagnosis: initialReport?.diagnosis || reportContext?.predictionText || '',
        clinical_observations: initialReport?.clinical_observations || '',
        treatment_plan: initialReport?.treatment_plan || '',
        additional_comments: initialReport?.additional_comments || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const patientName = initialReport?.patient_name || (patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient');
    const [heatmapImage, setHeatmapImage] = useState(reportContext?.heatmap_base64 || null);
    const [normalImage, setNormalImage] = useState(reportContext?.normal_image || null);

    useEffect(() => {
        if (initialReport?.report_id && !reportContext) {
            getDraftImages(initialReport.report_id).then(data => {
                if (data) {
                    if (data.heatmapImage) setHeatmapImage(data.heatmapImage);
                    if (data.normalImage) setNormalImage(data.normalImage);
                }
            });
        }
    }, [initialReport, reportContext]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };
    const patientAge = calculateAge(patient?.dob);
    const patientEmail = patient?.email || 'N/A';

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = { ...form, patient_name: patientName, status: 'Draft' };
            let savedReport;
            if (initialReport?.report_id) {
                savedReport = await updateReport(initialReport.report_id, payload);
            } else {
                savedReport = await createReport(payload);
            }
            
            // Save images to IndexedDB mapped by report_id
            const reportIdToSave = savedReport?.report_id || initialReport?.report_id;
            if (reportIdToSave) {
                await saveDraftImages(reportIdToSave, normalImage, heatmapImage);
            }

            onSaveDraft && onSaveDraft();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save draft.');
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = { ...form, patient_name: patientName, status: 'Finalized' };
            let finalizedRecord;
            if (initialReport?.report_id) {
                finalizedRecord = await updateReport(initialReport.report_id, payload);
            } else {
                finalizedRecord = await createReport(payload);
            }

            // Cleanup local images
            const finalizedId = finalizedRecord?.report_id || initialReport?.report_id;
            if (finalizedId) {
                await deleteDraftImages(finalizedId);
            }

            onFinalize && onFinalize(finalizedRecord);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to finalize report.');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '8px',
        border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155',
        outline: 'none', background: '#fff', resize: 'vertical',
        fontFamily: 'inherit'
    };
    const labelStyle = { fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' };

    return (
        <div style={{ width: '100%', padding: '32px 40px', boxSizing: 'border-box' }}>
            {/* Back */}
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#14b8a6', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
                <ArrowLeft size={18} /> Back
            </button>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Create New Report</h1>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>Patient: <strong>{patientName}</strong></p>

            {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'start' }}>
                {/* Left: Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section 1: Patient & Doctor Info */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6', fontSize: '1.1rem' }}>①</div>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Patient &amp; Doctor Information</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Patient Full Name</label>
                                <input type="text" value={patientName} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <input type="text" value={patient?.gender || 'N/A'} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Age</label>
                                <input type="text" value={patientAge} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="text" value={patientEmail} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Doctor Name</label>
                                <input type="text" value={doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : ''} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Registration ID</label>
                                <input type="text" value={doctor ? `REG-${doctor.id}` : ''} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Clinical Notes */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6', fontSize: '1.1rem' }}>②</div>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Clinical Notes</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Final Diagnosis</label>
                                <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} rows={3} placeholder="Enter diagnosis here..." style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Clinical Observations</label>
                                <textarea name="clinical_observations" value={form.clinical_observations} onChange={handleChange} rows={3} placeholder="Enter clinical observations..." style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Treatment Plan</label>
                                <textarea name="treatment_plan" value={form.treatment_plan} onChange={handleChange} rows={3} placeholder="Enter treatment plan..." style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Additional Comments</label>
                                <textarea name="additional_comments" value={form.additional_comments} onChange={handleChange} rows={3} placeholder="Any other notes..." style={inputStyle} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Image Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flex: 1 }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>X-Ray Analysis Images</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            {/* Normal X-Ray */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'center' }}>Normal X-Ray</div>
                                {normalImage ? (
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000', minHeight: '200px' }}>
                                        <img src={normalImage} alt="Original X-Ray" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    </div>
                                ) : (
                                    <div style={{ height: '200px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No image</div>
                                )}
                            </div>
                            {/* Grad-CAM */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'center' }}>Grad-CAM Analysis</div>
                                {heatmapImage ? (
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000', minHeight: '200px' }}>
                                        <img src={heatmapImage} alt="Grad-CAM Heatmap" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    </div>
                                ) : (
                                    <div style={{ height: '200px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No heatmap</div>
                                )}
                            </div>
                        </div>
                        {reportContext?.predictionText && (
                            <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14b8a6', marginBottom: '4px', textTransform: 'uppercase' }}>AI Findings</div>
                                <div style={{ fontSize: '0.95rem', color: '#334155' }}>{reportContext.predictionText}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    style={{ padding: '12px 28px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Save size={16} /> Save Draft
                </button>
                <button
                    onClick={handleFinalize}
                    disabled={saving}
                    style={{ padding: '12px 28px', background: '#14b8a6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <CheckCircle size={16} /> {saving ? 'Saving...' : 'Finalize & Approve'}
                </button>
            </div>
        </div>
    );
}
