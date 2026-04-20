import { Plus, User, Settings as SettingsIcon, ChevronRight } from "lucide-react";

const getInitials = (first, last) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

export default function PatientTable({ patients, loading, onView, onCreateNew }) {
    const mostRecent = patients.slice(0, 3);
    const others = patients.slice(3);

    return (
        <div className="table-wrap">
            <div className="table-header" style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 700 }}>Manage portfolios</h1>
            </div>

            <button className="button primary" style={{ width: 'fit-content', borderRadius: '999px', padding: '10px 24px' }} type="button" onClick={onCreateNew}>
                Add patient <Plus size={18} style={{ marginLeft: 8 }} />
            </button>

            {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Loading patients...</div>
            ) : patients.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'var(--card)', borderRadius: 16 }}>No patient portfolios yet. Click Add patient to create one.</div>
            ) : (
                <>
                    {mostRecent.length > 0 && (
                        <div>
                            <h2 className="section-title" style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 600 }}>Most recent</h2>
                            <div className="patient-grid">
                                {mostRecent.map((patient) => (
                                    <PatientCard key={patient.id} patient={patient} onView={() => onView(patient.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {others.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                            <h2 className="section-title" style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 600 }}>Other patients</h2>
                            <div className="patient-grid">
                                {others.map((patient) => (
                                    <PatientCard key={patient.id} patient={patient} onView={() => onView(patient.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function PatientCard({ patient, onView }) {
    return (
        <div className="patient-card" onClick={onView}>
            <div className="patient-card-header">
                <div className="patient-avatar">
                    {getInitials(patient.first_name, patient.last_name)}
                </div>
                <div>
                    <div className="patient-name">{patient.first_name} {patient.last_name}</div>
                    <div className="patient-email">{patient.email || `${patient.first_name.toLowerCase()}@example.com`}</div>
                </div>
            </div>

            <div className="patient-links">
                <div className="patient-link">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={16} /> Profile
                    </div>
                    <ChevronRight size={16} />
                </div>
                <div className="patient-link">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SettingsIcon size={16} /> Status
                    </div>
                    <span style={{ color: patient.is_active ? 'var(--primary)' : '#ef4444', fontWeight: 600 }}>
                        {patient.is_active ? 'Authorized' : 'Unauthorized'}
                    </span>
                </div>
            </div>
        </div>
    );
}
