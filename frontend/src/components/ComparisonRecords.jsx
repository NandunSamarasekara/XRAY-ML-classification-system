import React, { useEffect, useState } from 'react';
import { getComparisons, updateComparison, deleteComparison } from '../api/comparisons';
import { Edit2, Trash2, Eye, Check, X } from 'lucide-react';

export default function ComparisonRecords({ patient, onBack }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ disease: '', condition: '', doctor_note: '' });
    
    // For the View Modal
    const [viewingRecord, setViewingRecord] = useState(null);

    useEffect(() => {
        loadRecords();
    }, [patient]);

    const loadRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getComparisons();
            const patientName = `${patient.first_name} ${patient.last_name}`;
            const filtered = data.filter(d => d.patient_name === patientName);
            setRecords(filtered);
        } catch (err) {
            console.error(err);
            setError("Failed to load records.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (caseId) => {
        if (!window.confirm("Are you sure you want to delete this comparison record?")) return;
        try {
            await deleteComparison(caseId);
            setRecords(records.filter(r => r.case_id !== caseId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete the record. Please try again.");
        }
    };

    const startEdit = (record) => {
        setEditingId(record.case_id);
        setEditForm({
            disease: record.disease || '',
            condition: record.condition || '',
            doctor_note: record.doctor_note || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (caseId) => {
        try {
            const updated = await updateComparison(caseId, editForm);
            setRecords(records.map(r => r.case_id === caseId ? { ...r, ...updated } : r));
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update the record. Please try again.");
        }
    };

    const handleFormChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading comparisons...</div>;
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <button 
                onClick={onBack} 
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#14b8a6', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    fontSize: '1rem', 
                    marginBottom: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: 0 
                }}
            >
                ← Back to Patient Profile
            </button>

            <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 800, marginBottom: '32px' }}>
                Comparison Records for {patient.first_name} {patient.last_name}
            </h1>

            {error && (
                <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            {records.length === 0 && !error ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No comparison records found.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {records.map((record) => {
                        const isEditing = editingId === record.case_id;

                        return (
                            <div key={record.case_id} style={{ 
                                background: '#ffffff', 
                                borderRadius: '16px', 
                                padding: '24px', 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {record.created_date}
                                    </div>
                                </div>
                                
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Disease</label>
                                            <input 
                                                name="disease"
                                                value={editForm.disease}
                                                onChange={handleFormChange}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Condition</label>
                                            <input 
                                                name="condition"
                                                value={editForm.condition}
                                                onChange={handleFormChange}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Doctor's Note</label>
                                            <textarea 
                                                name="doctor_note"
                                                value={editForm.doctor_note}
                                                onChange={handleFormChange}
                                                rows="3"
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                                            {record.disease || 'Unknown Diagnosis'}
                                        </h2>
                                        <div style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500, marginBottom: '16px' }}>
                                            {record.condition || 'N/A'}
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '4px' }}>
                                                Doctor's Note:
                                            </div>
                                            <div style={{ color: '#475569', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                                {record.doctor_note || 'No notes provided.'}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!isEditing && (
                                    <button 
                                        onClick={() => setViewingRecord(record)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            background: '#14b8a6', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            fontWeight: 600, 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            marginBottom: '16px',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <Eye size={18} />
                                        View
                                    </button>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {isEditing ? (
                                        <>
                                            <button 
                                                onClick={() => cancelEdit()}
                                                style={{ 
                                                    flex: 1, padding: '10px', background: '#ffffff', color: '#64748b', 
                                                    border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', gap: '6px', fontSize: '0.9rem'
                                                }}
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                            <button 
                                                onClick={() => saveEdit(record.case_id)}
                                                style={{ 
                                                    flex: 1, padding: '10px', background: '#3b82f6', color: '#ffffff', 
                                                    border: 'none', borderRadius: '8px', fontWeight: 600, 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', gap: '6px', fontSize: '0.9rem'
                                                }}
                                            >
                                                <Check size={16} /> Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => startEdit(record)}
                                                style={{ 
                                                    flex: 1, padding: '10px', background: '#ffffff', color: '#14b8a6', 
                                                    border: '1px solid #14b8a6', borderRadius: '8px', fontWeight: 600, 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', gap: '6px', fontSize: '0.9rem'
                                                }}
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(record.case_id)}
                                                style={{ 
                                                    flex: 1, padding: '10px', background: '#ef4444', color: '#ffffff', 
                                                    border: 'none', borderRadius: '8px', fontWeight: 600, 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', gap: '6px', fontSize: '0.9rem'
                                                }}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Modal */}
            {viewingRecord && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '700px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Comparison Report</h2>
                            <button onClick={() => setViewingRecord(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Printable Area */}
                        <div id="print-area" style={{ padding: '32px', overflowY: 'auto' }}>
                            <style>
                                {`
                                    @media print {
                                        body * { visibility: hidden; }
                                        #print-area, #print-area * { visibility: visible; }
                                        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                                    }
                                `}
                            </style>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#14b8a6', margin: '0 0 8px 0' }}>Wedakam Health AI</h1>
                                <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>Clinical X-Ray Comparison Report</p>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Patient Name</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{patient.first_name} {patient.last_name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Date Generated</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{viewingRecord.created_date}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Diagnostic Breakdown</h3>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Primary AI Findings:</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14b8a6', marginBottom: '16px' }}>
                                    {viewingRecord.disease || 'Unknown Diagnosis'}
                                </div>
                                
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Comparison Outcome:</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#334155' }}>
                                    {viewingRecord.condition || 'N/A'}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Clinical Observations (Doctor's Note)</h3>
                                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', fontSize: '1rem', color: '#334155', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                                    {viewingRecord.doctor_note || 'No additional notes provided by the reviewing physician.'}
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ borderBottom: '1px solid #1e293b', width: '200px', marginBottom: '8px' }}></div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Physician Signature</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <button onClick={() => setViewingRecord(null)} style={{ padding: '10px 24px', background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
