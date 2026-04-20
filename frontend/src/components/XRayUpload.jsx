import { Upload, X, Loader2, Folder, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { uploadXRayToPredict } from "../api/xray";
import ResultCard from "./ResultCard";

export default function XRayUpload({ patient, onCancel, onCompareRequested, onGenerateReport }) {
    const [viewToggle, setViewToggle] = useState('PA');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [predictionResult, setPredictionResult] = useState(null);

    const fileInputRef = useRef(null);

    const calculateAge = (dobString) => {
        if (!dobString) return "";
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const [patientData, setPatientData] = useState({
        name: "",
        age: "",
        gender: "",
        contact: ""
    });

    useEffect(() => {
        if (patient) {
            setPatientData({
                name: `${patient.first_name} ${patient.last_name}`,
                age: calculateAge(patient.dob).toString(),
                gender: patient.gender || "",
                contact: patient.email || patient.phone || ""
            });
        }
    }, [patient]);

    const handlePatientChange = (field, value) => {
        setPatientData(prev => ({ ...prev, [field]: value }));
    };

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const fileType = selectedFile.type.toLowerCase();
        const fileName = selectedFile.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        if (!ALLOWED_TYPES.includes(fileType) || !hasValidExtension) {
            setError('Invalid file type. Please upload only JPG, JPEG, or PNG image files.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setError(null);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClearData = () => {
        setPatientData({ name: "", age: "", gender: "", contact: "" });
        setViewToggle("PA");
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Please upload an image before proceeding.");
            return;
        }
        if (!patient || !patient.id) {
            setError("No valid patient linked. Proceeding with prediction anyway.");
        }

        setLoading(true);
        setError(null);
        try {
            const response = await uploadXRayToPredict(patient?.id || '00000000-0000-0000-0000-000000000000', file, viewToggle);
            if (response && response.status === "success") {
                setPredictionResult(response.data);
            } else {
                throw new Error("Invalid response format from server.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Failed to process image.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPredictionResult(null);
        handleRemoveFile();
    };

    if (predictionResult) {
        return (
            <ResultCard 
                predictionResult={predictionResult} 
                patientData={patientData} 
                onReset={handleReset} 
                onGenerateReport={async (ctx) => {
                    // Convert blob URL to base64 so it embeds in the PDF correctly
                    let normalBase64 = null;
                    if (previewUrl) {
                        try {
                            const res = await fetch(previewUrl);
                            const blob = await res.blob();
                            normalBase64 = await new Promise(resolve => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                        } catch(e) { console.warn('Image conversion failed:', e); }
                    }
                    onGenerateReport && onGenerateReport({ ...ctx, normal_image: normalBase64 });
                }}
                onCompare={(diagnosis) => onCompareRequested && onCompareRequested({
                    baselineImage: previewUrl,
                    followUpImage: predictionResult.heatmap_base64,
                    diagnosis: diagnosis
                })}
            />
        );
    }

    // Colors matching user requirements from the new UI
    const greenButtonColor = "#14b8a6"; // Emerald-500
    const blueButtonColor = "#2563eb";  // Bright Blue
    const paleBackground = "#f8fafc";
    const whiteBackground = "#ffffff";
    const borderColor = "#e2e8f0";

    return (
        <div className="xray-upload-container" style={{ padding: '32px', background: paleBackground, borderRadius: 20, minHeight: '80vh' }}>
            <button type="button" onClick={onCancel} style={{ width: 'fit-content', padding: '8px 18px', marginBottom: 24, fontSize: '0.85rem', background: '#f0f4ff', border: '1px solid #14b8a6', color: '#14b8a6', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
                ← Back to Profile
            </button>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 800 }}>X-ray upload</h1>
            </div>

            {error && (
                <div style={{ padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertCircle size={24} />
                    <span style={{ fontSize: '1.1rem' }}>{error}</span>
                </div>
            )}

            <div className="xray-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 40, alignItems: 'stretch' }}>
                {/* Left Panel: Upload Image */}
                <div className="xray-column" style={{ background: whiteBackground, borderRadius: 16, padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Upload Image</h2>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: 24 }}>Upload your X-ray images here</p>
                    
                    <div className="upload-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {!previewUrl ? (
                            <div className="dropzone" onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${borderColor}`, borderRadius: 16, flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, cursor: 'pointer', background: '#fcfcfc', transition: 'background 0.2s' }}>
                                <div style={{ background: '#f1f5f9', padding: '16px 32px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <Folder size={24} color="#eab308" />
                                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>Click to upload X-ray</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Accepted formats: <strong>JPG, JPEG, PNG</strong></p>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        ) : (
                            <div className="preview-container" style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', border: `2px dashed ${borderColor}`, background: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flex: 1, minHeight: 400 }}>
                                <img src={previewUrl} alt="X-Ray Preview" style={{ maxWidth: '100%', maxHeight: 350, objectFit: 'contain' }} />
                                <button type="button" className="remove-preview-btn" onClick={handleRemoveFile} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
                            <button type="button" onClick={handleSubmit} disabled={loading || !file} style={{ width: '100%', background: blueButtonColor, color: '#fff', padding: '16px 32px', borderRadius: 8, fontWeight: 700, fontSize: '1.15rem', border: 'none', cursor: (loading || !file) ? 'not-allowed' : 'pointer', opacity: (loading || !file) ? 0.6 : 1, transition: 'all 0.2s' }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                        <Loader2 size={24} className="animate-spin" /> Processing AI...
                                    </span>
                                ) : "Proceed to AI solution"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Patient's Details */}
                <div className="xray-column" style={{ background: whiteBackground, borderRadius: 16, padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 32, color: '#1e293b' }}>Patient's Details</h2>
                    
                    <div style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>Patient Name *</span>
                            <input type="text" value={patientData.name} onChange={(e) => handlePatientChange('name', e.target.value)} placeholder="Enter patient name" style={{ border: `1px solid ${borderColor}`, padding: '14px 16px', borderRadius: 8, width: '100%', outline: 'none', fontSize: '1rem', color: '#1e293b' }} />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>Age *</span>
                            <input type="text" value={patientData.age} onChange={(e) => handlePatientChange('age', e.target.value)} placeholder="Enter age" style={{ border: `1px solid ${borderColor}`, padding: '14px 16px', borderRadius: 8, width: '100%', outline: 'none', fontSize: '1rem', color: '#1e293b' }} />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>Gender *</span>
                            <select value={patientData.gender} onChange={(e) => handlePatientChange('gender', e.target.value)} style={{ border: `1px solid ${borderColor}`, padding: '14px 16px', borderRadius: 8, width: '100%', background: '#fff', outline: 'none', fontSize: '1rem', color: '#1e293b' }}>
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>Email / Phone *</span>
                            <input type="text" value={patientData.contact} onChange={(e) => handlePatientChange('contact', e.target.value)} placeholder="Enter email or phone number" style={{ border: `1px solid ${borderColor}`, padding: '14px 16px', borderRadius: 8, width: '100%', outline: 'none', fontSize: '1rem', color: '#1e293b' }} />
                            <small style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>Format: email@example.com or +94123456789 / 0123456789</small>
                        </label>

                        <div style={{ marginTop: 12 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>X ray view: *</span>
                            <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input type="radio" name="xrayView" checked={viewToggle === 'PA'} onChange={() => setViewToggle('PA')} style={{ accentColor: '#475569', transform: 'scale(1.4)' }} />
                                    <span style={{ fontSize: '1rem', color: '#475569' }}>Posteroanterior (PA)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input type="radio" name="xrayView" checked={viewToggle === 'AP'} onChange={() => setViewToggle('AP')} style={{ accentColor: '#475569', transform: 'scale(1.4)' }} />
                                    <span style={{ fontSize: '1rem', color: '#475569' }}>Anteposterior (AP)</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 'auto', paddingTop: 24 }}>
                            <button type="button" onClick={handleClearData} style={{ flex: 1, padding: '14px', borderRadius: 8, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                                Clear Data
                            </button>
                            <button type="button" onClick={() => {}} style={{ flex: 1, padding: '14px', borderRadius: 8, border: 'none', background: greenButtonColor, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
