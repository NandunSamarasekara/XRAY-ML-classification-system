import React from 'react';

export default function ResultCard({ predictionResult, patientData, onReset, onCompare, onGenerateReport }) {
    if (!predictionResult) return null;

    const { predictions, heatmap_base64 } = predictionResult;
    const greenButtonColor = "#14b8a6"; // Emerald-500

    // Build the AI text summary
    const predictionText = predictions?.map(p => `${p.name} (${p.percent}%)`).join(", ") || "No specific findings.";
    const analysisText = `AI Analysis for ${patientData?.name || "Patient"} (Age: ${patientData?.age || "N/A"}, Gender: ${patientData?.gender || "N/A"}):\n\nResults: ${predictionText}\n\nModel predictions applied successfully to the uploaded scan.`;

    return (
        <div className="result-card-container" style={{ padding: '24px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Result</h2>
            
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: 12 }}>AI Solution</h3>
            
            {/* The Text Box from Mockup */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 24, minHeight: 180, marginBottom: 32 }}>
                <p style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {analysisText}
                </p>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                <button type="button" onClick={() => onGenerateReport && onGenerateReport({ predictionText, heatmap_base64 })} style={{ flex: 1, padding: '16px', borderRadius: 8, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                    Generate Report
                </button>
                <button 
                    type="button" 
                    onClick={() => onCompare && onCompare(predictionText)}
                    style={{ flex: 1, padding: '16px', borderRadius: 8, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                >
                    Compare with this image
                </button>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: 24 }}>Detailed Visuals</h3>
                <div className="xray-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 32 }}>
                    {/* Image & Heatmap Panel */}
                    <div className="xray-column">
                        <div className="details-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Grad-CAM Visualization</h4>
                            <div style={{ width: '100%', maxWidth: 300, borderRadius: 12, overflow: 'hidden', border: '1px solid #cbd5e1', background: '#000' }}>
                                <img src={heatmap_base64} alt="Grad-CAM Heatmap" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <p style={{ marginTop: 16, fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                                Thermal overlay indicates areas of highest attention from the AI model (PyTorch inference).
                            </p>
                        </div>
                    </div>

                    {/* Analysis Details Panel */}
                    <div className="xray-column">
                        <div className="dashboard-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, height: '100%' }}>
                            <div className="card-header" style={{ marginBottom: 24 }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 600 }}>Detected Diseases Breakdown</div>
                            </div>
                            <div className="tested-results-grid" style={{ gridTemplateColumns: '1fr', gap: 20, display: 'grid' }}>
                                {predictions.map((res, idx) => (
                                    <div key={idx} className="result-row" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div className="result-bubble-container" style={{ margin: 0, scale: '0.7', width: 70, height: 70, position: 'relative' }}>
                                            <svg width="70" height="70" className="circle-progress" style={{ transform: 'rotate(-90deg)' }}>
                                                <circle cx="35" cy="35" r="31" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                                <circle cx="35" cy="35" r="31" fill="none" stroke={res.color} strokeWidth="6"
                                                    strokeDasharray={`${(res.percent / 100) * 194.7}, 194.7`} />
                                            </svg>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                {res.percent}%
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0', color: '#1e293b' }}>{res.name}</h5>
                                            <div style={{ width: '100%', background: '#e2e8f0', height: 6, borderRadius: 3 }}>
                                                <div style={{ width: `${res.percent}%`, background: res.color, height: '100%', borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
                <button type="button" onClick={onReset} style={{ padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                    ← Start New Scan
                </button>
            </div>
        </div>
    );
}
