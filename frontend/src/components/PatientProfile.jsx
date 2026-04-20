import { Calendar, User as UserIcon, Phone, Mail, MapPin, Activity, Clock, Edit3, Plus, Upload, FileText } from "lucide-react";

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
};

const getInitials = (first, last) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

export default function PatientProfile({ patient, loading, onEdit, onBack, onDelete, onAuthorize, onNewVisit, onViewRecords }) {
    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading details...</div>;
    }

    if (!patient) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <p>No patient selected.</p>
                <button className="button ghost" onClick={onBack} style={{ marginTop: 16 }}>Go Back</button>
            </div>
        );
    }

    const pseudoId = `PT-${patient.id.toString().slice(0, 5)}`;

    return (
        <div className="profile">
            <button className="button ghost" onClick={onBack} style={{ width: 'fit-content', padding: '8px 18px', marginBottom: 24, fontSize: '0.85rem', background: '#f0f4ff', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, borderRadius: '8px' }}>
                ← Back to List
            </button>

            <div className="profile-header">
                <div className="profile-main-info">
                    <div className="profile-avatar-large">
                        {getInitials(patient.first_name, patient.last_name)}
                        <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: patient.is_active ? 'var(--primary)' : 'var(--muted)', border: '2px solid white', borderRadius: '50%' }}></div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{patient.first_name} {patient.last_name}</h1>
                        <div className="profile-id">Patient Profile · ID: {pseudoId}</div>
                    </div>
                </div>
                <div className="status-badge" style={{ color: patient.is_active ? 'var(--primary)' : '#ef4444' }}>
                    {patient.is_active ? 'Authorized' : 'Unauthorized'}
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="stat-box">
                    <Calendar className="stat-icon" size={20} />
                    <div>
                        <div className="label" style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>DATE OF BIRTH</div>
                        <div style={{ fontWeight: 500 }}>{formatDate(patient.dob)}</div>
                    </div>
                </div>
                <div className="stat-box">
                    <UserIcon className="stat-icon" size={20} />
                    <div>
                        <div className="label" style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>GENDER</div>
                        <div style={{ fontWeight: 500 }}>{patient.gender || "Unknown"}</div>
                    </div>
                </div>
                <div className="stat-box">
                    <Phone className="stat-icon" size={20} />
                    <div>
                        <div className="label" style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>PHONE</div>
                        <div style={{ fontWeight: 500 }}>{patient.phone || "N/A"}</div>
                    </div>
                </div>
            </div>

            <div className="info-cards">
                <div className="info-card">
                    <h3 className="profile-section-title">CONTACT</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <Mail className="info-item-icon" size={18} />
                            <div className="info-item-content">
                                <div className="label">EMAIL</div>
                                <p>{patient.email || "N/A"}</p>
                            </div>
                        </div>


                    </div>
                </div>

                <div className="info-card">
                    <h3 className="profile-section-title">ADDRESS</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <MapPin className="info-item-icon" size={18} />
                            <div className="info-item-content">
                                <div className="label">HOME</div>
                                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                                    {patient.address || "No address provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="notes-card">
                <div style={{ gridColumn: '1 / -1' }}>
                    <h3 className="profile-section-title">MEDICAL NOTES</h3>
                </div>

                <div className="info-item">
                    <Activity className="info-item-icon" size={18} color="#ef4444" />
                    <div className="info-item-content">
                        <div className="label">NOTES SUMMARY</div>
                        <p>{patient.notes || "No additional medical notes available."}</p>
                    </div>
                </div>

                <div className="info-item">
                    <Calendar className="info-item-icon" size={18} color="var(--primary)" />
                    <div className="info-item-content">
                        <div className="label">RECORD UPDATED</div>
                        <p>{formatDate(patient.updated_at)}</p>
                    </div>
                </div>
            </div>

            <div className="profile-actions" style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                {!patient.is_active && onAuthorize && (
                    <button className="button primary" style={{ backgroundColor: 'var(--ink)', flex: 1, width: 'auto', whiteSpace: 'nowrap' }} onClick={onAuthorize}>
                        Send Verification Code
                    </button>
                )}
                <button className="button danger" onClick={onDelete} style={{ flex: 1, whiteSpace: 'nowrap' }}>
                    Delete Patient
                </button>
                <button className="button ghost" onClick={onEdit} style={{ flex: 1, border: '1px solid var(--primary)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                    <Edit3 size={16} /> Edit Profile
                </button>
                <button
                    className="button ghost"
                    onClick={onViewRecords}
                    style={{ flex: 1, border: '1px solid #000000', color: '#000000', whiteSpace: 'nowrap', opacity: patient.is_active ? 1 : 0.5, cursor: patient.is_active ? 'pointer' : 'not-allowed' }}
                    disabled={!patient.is_active}
                    title={!patient.is_active ? "Please Authorize the patient by sending a verification code first." : "View Comparison Records"}
                >
                    <FileText size={16} style={{ marginRight: 6 }} /> Record
                </button>
                <button
                    className="button primary"
                    onClick={onNewVisit}
                    style={{ flex: 1, width: 'auto', whiteSpace: 'nowrap', opacity: patient.is_active ? 1 : 0.5, cursor: patient.is_active ? 'pointer' : 'not-allowed' }}
                    disabled={!patient.is_active}
                    title={!patient.is_active ? "Please Authorize the patient by sending a verification code first." : "Upload X-ray images"}
                >
                    <Upload size={16} style={{ marginRight: 6 }} /> X-ray upload
                </button>
            </div>

        </div>
    );
}
