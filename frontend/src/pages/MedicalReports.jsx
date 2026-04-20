import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardCheck, FileText, Settings, CreditCard, UserCircle, HelpCircle, Search, Bell, LogOut, Plus, Star, Trash2, Eye, Edit2, Activity
} from 'lucide-react';
import { listReports, deleteReport } from '../api/reports';
import CreateReport from '../components/CreateReport';
import './Dashboard.css';

export default function MedicalReports() {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('list');
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const doctorData = localStorage.getItem('doctor');
        if (!token || !doctorData) { navigate('/login'); return; }
        setDoctor(JSON.parse(doctorData));
        loadReports();
    }, [navigate]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await listReports();
            setReports(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Delete this report? This cannot be undone.')) return;
        try {
            await deleteReport(reportId);
            setReports(prev => prev.filter(r => r.report_id !== reportId));
        } catch (err) {
            alert('Failed to delete report.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('doctor');
        navigate('/login');
    };

    const filtered = reports.filter(r => {
        if (!searchQuery) return true;
        return r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const drafts = filtered.filter(r => r.status === 'Draft');
    const finalized = filtered.filter(r => r.status === 'Finalized');

    if (!doctor) return null;

    const cardStyle = {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
    };

    const renderCard = (report, isDraft) => (
        <div key={report.report_id} style={cardStyle}>
            {/* Watermark graph */}
            <div style={{ position: 'absolute', right: 8, bottom: 8, opacity: 0.06 }}>
                <Activity size={80} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#14b8a6" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Report #{report.report_id}</span>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{report.created_date}</div>
                </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Patient</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{report.patient_name}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Diagnosis</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.diagnosis || 'Not specified'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                {isDraft ? (
                    <>
                        <button
                            onClick={() => {
                                setSelectedReport(report);
                                setView('edit-report');
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Eye size={14} color="#14b8a6" /> Review Report
                        </button>
                        <button
                            onClick={() => {
                                setSelectedReport(report);
                                setView('edit-report');
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Edit2 size={14} color="#3b82f6" /> Edit Draft Details
                        </button>
                        <button
                            onClick={() => handleDelete(report.report_id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Trash2 size={14} /> Delete Report
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate(`/patients`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Eye size={14} color="#14b8a6" /> Review Report
                        </button>
                        <button
                            onClick={() => navigate(`/patients`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Activity size={14} color="#8b5cf6" /> Actions &amp; Distribution
                        </button>
                        <button
                            onClick={() => handleDelete(report.report_id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, padding: '4px 0' }}
                        >
                            <Trash2 size={14} /> Delete Report
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-container">
                        <div className="logo-text">Wedakam</div>
                        <div className="logo-icon"></div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <p className="sidebar-section-label">MENU</p>
                    <a href="/dashboard" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                        <span className="sidebar-icon"><LayoutDashboard size={18} /></span> Dashboard
                    </a>
                    <a href="/patients" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/patients'); }}>
                        <span className="sidebar-icon"><Users size={18} /></span> Manage Patients
                    </a>
                    <a href="/reports" className="sidebar-link active">
                        <span className="sidebar-icon"><FileText size={18} /></span> Manage Reports
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><ClipboardCheck size={18} /></span> Review
                    </a>
                    <p className="sidebar-section-label">OTHERS</p>
                    <a href="/account-settings" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/account-settings'); }}>
                        <span className="sidebar-icon"><Settings size={18} /></span> Settings
                    </a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><CreditCard size={18} /></span> Payment</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><UserCircle size={18} /></span> Accounts</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><HelpCircle size={18} /></span> Help</a>
                </nav>
            </aside>

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="dashboard-search-container">
                        <Search className="search-icon-placeholder" size={18} />
                        <input type="text" className="dashboard-search" placeholder="Search reports or patients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="dashboard-user-info">
                        <button className="notification-btn"><Bell size={20} /></button>
                        <div className="dashboard-avatar-container">
                            <span className="dashboard-greeting">Logged in as Attending Physician</span>
                            <Link to="/dashboard" className="dashboard-avatar" style={{ textDecoration: 'none' }}>{doctor.first_name.charAt(0)}{doctor.last_name?.charAt(0)}</Link>
                        </div>
                        <button className="dashboard-logout-btn" onClick={handleLogout}><LogOut size={16} /></button>
                    </div>
                </header>

                <main className="dashboard-content" style={{ padding: '24px 40px 40px' }}>
                    {/* Header Row */}
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>Medical Reports</h1>
                        <p style={{ color: '#64748b', margin: 0 }}>Manage, draft, and share clinical patient reports.</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading reports...</div>
                    ) : (
                        <>
                            {view === 'list' && (
                                <>
                                    {/* Active Drafts */}
                                    {drafts.length > 0 && (
                                        <div style={{ marginBottom: '40px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Active Drafts</h2>
                                                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                                {drafts.map(r => renderCard(r, true))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Finalized Reports */}
                                    {finalized.length > 0 && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Finalized Reports</h2>
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{finalized.length}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                                {finalized.map(r => renderCard(r, false))}
                                            </div>
                                        </div>
                                    )}

                                    {reports.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                                            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                                            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No reports yet.</p>
                                            <p style={{ fontSize: '0.9rem' }}>Create a report from a patient's X-ray analysis.</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {view === 'edit-report' && selectedReport && (
                                <CreateReport 
                                    initialReport={selectedReport}
                                    doctor={doctor}
                                    onBack={() => {
                                        setView('list');
                                        setSelectedReport(null);
                                    }}
                                    onSaveDraft={() => {
                                        setView('list');
                                        setSelectedReport(null);
                                        loadReports();
                                    }}
                                    onFinalize={() => {
                                        setView('list');
                                        setSelectedReport(null);
                                        loadReports();
                                    }}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
