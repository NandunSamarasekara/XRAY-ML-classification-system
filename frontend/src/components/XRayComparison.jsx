import React, { useState } from 'react';
import { AlertCircle, Loader2, Save, LogOut } from 'lucide-react';
import { saveComparison } from '../api/comparisons';

export default function XRayComparison({ 
    patient, 
    baselineImage, 
    followUpImage, 
    diagnosis, 
    onFinalize, 
    onExit 
}) {
    const [outcome, setOutcome] = useState('Improved');
    const [observations, setObservations] = useState('patient condition good');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                patient_name: `${patient.first_name} ${patient.last_name}`,
                condition: outcome,
                disease: diagnosis,
                doctor_note: observations
            };
            await saveComparison(payload);
            onFinalize && onFinalize();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to save comparison.");
        } finally {
            setLoading(false);
        }
    };

    const greenButtonColor = "#14b8a6"; // Emerald-500
    const paleBackground = "#f8fafc";
    const whiteBackground = "#ffffff";
    const borderColor = "#e2e8f0";
    const inputBg = "#d1d5db"; // Matching the grayish read-only look in mockup

    return (
        <div className="comparison-container" style={{ padding: '32px', background: paleBackground, borderRadius: 20, maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>X-Ray Comparison</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
                {/* Before Image */}
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Baseline X-Ray (Before)</h2>
                    <div style={{ background: '#0f172a', borderRadius: 16, overflow: 'hidden', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={baselineImage} alt="Baseline" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                </div>

                {/* After Image */}
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Follow up X-Ray (After)</h2>
                    <div style={{ background: '#0f172a', borderRadius: 16, overflow: 'hidden', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={followUpImage} alt="Follow up" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                </div>
            </div>

            <div style={{ background: whiteBackground, borderRadius: 16, padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>Patient Diagnostic Information</h2>
                
                {error && (
                    <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Patient Name</span>
                        <div style={{ background: '#cbd5e1', padding: '12px 16px', borderRadius: 8, color: '#334155', fontWeight: 500 }}>
                            {patient.first_name} {patient.last_name}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Residential Address</span>
                        <div style={{ background: '#cbd5e1', padding: '12px 16px', borderRadius: 8, color: '#334155', fontWeight: 500 }}>
                            {patient.address || "N/A"}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Primary Diagnosis</span>
                        <div style={{ background: '#cbd5e1', padding: '12px 16px', borderRadius: 8, color: '#334155', fontWeight: 500 }}>
                            {diagnosis}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Comparison Outcome</span>
                        <select 
                            value={outcome} 
                            onChange={(e) => setOutcome(e.target.value)}
                            style={{ background: '#cbd5e1', padding: '12px 16px', borderRadius: 8, color: '#334155', fontWeight: 500, border: 'none', outline: 'none' }}
                        >
                            <option value="Improved">Improved</option>
                            <option value="Stable">Stable</option>
                            <option value="Deteriorated">Deteriorated</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Clinical Observations</span>
                        <textarea 
                            rows={4}
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            style={{ background: '#cbd5e1', padding: '12px 16px', borderRadius: 8, color: '#334155', fontWeight: 500, border: 'none', resize: 'none', outline: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    style={{ flex: 1, padding: '16px', borderRadius: 12, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Finalize and Save
                </button>
                <button 
                    onClick={onExit}
                    style={{ flex: 1, padding: '16px', borderRadius: 12, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                    <LogOut size={20} />
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
