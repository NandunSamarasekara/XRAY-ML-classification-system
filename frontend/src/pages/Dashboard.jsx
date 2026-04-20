import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    Settings,
    CreditCard,
    UserCircle,
    HelpCircle,
    Search,
    Bell,
    LogOut,
    TrendingDown
} from 'lucide-react';
import './Dashboard.css';
import ReviewForm from '../components/ReviewForm';

const Dashboard = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'review'

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const doctorData = localStorage.getItem('doctor');

        if (!token || !doctorData) {
            navigate('/login');
            return;
        }
        setDoctor(JSON.parse(doctorData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('doctor');
        navigate('/login');
    };

    const handleSettingsClick = () => {
        navigate('/account-settings');
    };

    if (!doctor) return null;

    // Mock data for RECORDS chart
    const recordData = [
        { d: 40, n: 60 }, { d: 50, n: 30 }, { d: 30, n: 70 }, { d: 45, n: 40 },
        { d: 60, n: 55 }, { d: 70, n: 45 }, { d: 55, n: 60 }, { d: 40, n: 65 },
        { d: 50, n: 40 }, { d: 35, n: 50 }, { d: 55, n: 45 }, { d: 65, n: 50 }
    ];

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-container">
                        <div className="logo-text">Wedakam</div>
                        <div className="logo-icon"></div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="sidebar-section-label">MENU</p>
                    <a href="#" className={`sidebar-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); }}>
                        <span className="sidebar-icon"><LayoutDashboard size={18} /></span> Dashboard
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><Users size={18} /></span> Manage Patients
                    </a>
                    <a href="#" className={`sidebar-link ${activeView === 'review' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('review'); }}>
                        <span className="sidebar-icon"><ClipboardCheck size={18} /></span> Review
                    </a>

                    <p className="sidebar-section-label">OTHERS</p>
                    <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); handleSettingsClick(); }}>
                        <span className="sidebar-icon"><Settings size={18} /></span> Settings
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><CreditCard size={18} /></span> Payment
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><UserCircle size={18} /></span> Accounts
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><HelpCircle size={18} /></span> Help
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Topbar */}
                <header className="dashboard-topbar">
                    <div className="dashboard-search-container">
                        <Search className="search-icon-placeholder" size={18} />
                        <input type="text" className="dashboard-search" placeholder="Search" />
                    </div>

                    <div className="dashboard-user-info">
                        <button className="notification-btn">
                            <Bell size={20} />
                        </button>
                        <div className="dashboard-avatar-container">
                            <span className="dashboard-greeting">Hello, Dr. {doctor.first_name}</span>
                            <Link to="/dashboard" className="dashboard-avatar" style={{ textDecoration: 'none' }}>{doctor.first_name.charAt(0)}</Link>
                        </div>
                        <button className="dashboard-logout-btn" onClick={handleLogout}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </header>

                <main className="dashboard-content">
                    {activeView === 'dashboard' ? (
                        <>
                            <h1 className="dashboard-title">Dashboard</h1>

                            {/* Welcome card / Summary */}
                            <div className="welcome-summary">
                                <h2>Welcome back, Dr. {doctor.first_name} {doctor.last_name}!</h2>
                                <div className="welcome-details">
                                    <div className="detail-item"><span>Email</span> <p>{doctor.email}</p></div>
                                    <div className="detail-item"><span>Phone</span> <p>{doctor.phone_no}</p></div>
                                    <div className="detail-item"><span>Qualification</span> <p>{doctor.qualification}</p></div>
                                    <div className="detail-item"><span>Username</span> <p>{doctor.username}</p></div>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="grid-left">
                                    {/* RECORDS Card */}
                                    <div className="dashboard-card mb-4">
                                        <div className="card-header">
                                            <div>
                                                <div className="card-title">RECORDS</div>
                                                <div className="card-subtitle">Reports from 1-12 Dec, 2020</div>
                                            </div>
                                            <button className="view-report-btn">View Report</button>
                                        </div>
                                        <div className="records-chart-container">
                                            {recordData.map((item, idx) => (
                                                <div key={idx} className="bar-group">
                                                    <div className="bar deceased" style={{ height: `${item.d}%` }}></div>
                                                    <div className="bar normal" style={{ height: `${item.n}%` }}></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="chart-legend">
                                            <div className="legend-item"><span className="legend-bullet deceased"></span> Deceased ECG</div>
                                            <div className="legend-item"><span className="legend-bullet normal"></span> Normal ECG</div>
                                        </div>
                                    </div>

                                    {/* Tested Results and Patients Row */}
                                    <div className="tested-results-row">
                                        <div className="dashboard-card" style={{ flex: 1 }}>
                                            <div className="card-header">
                                                <div className="card-title">Tested results</div>
                                            </div>
                                            <div className="card-subtitle mb-4">Detected deceases by percentage</div>
                                            <div className="tested-results-grid">
                                                {[
                                                    { name: 'Mass', percent: 85, color: '#8b5cf6' },
                                                    { name: 'Pneumonia', percent: 85, color: '#f97316' },
                                                    { name: 'Nodule', percent: 92, color: '#22d3ee' }
                                                ].map((res, idx) => (
                                                    <div key={idx} className="result-bubble-container">
                                                        <svg width="100" height="100" className="circle-progress">
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke={res.color} strokeWidth="8"
                                                                strokeDasharray={`${(res.percent / 100) * 282}, 282`} />
                                                        </svg>
                                                        <div className="result-label">
                                                            <div className="result-percent">{res.percent}%</div>
                                                            <div className="result-name">{res.name}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="dashboard-card" style={{ flex: 1, marginLeft: '24px' }}>
                                            <div className="card-header">
                                                <div className="card-title">Most Recent Patients</div>
                                            </div>
                                            <div className="card-subtitle">Recently created patient portfolios</div>
                                            <div className="patient-placeholder-text mt-4">None</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-right">
                                    {/* INFERENCE ENGINE Card */}
                                    <div className="dashboard-card mb-4">
                                        <div className="card-header">
                                            <div className="card-title">INFERENCE ENGINE</div>
                                            <button className="view-report-btn">View Report</button>
                                        </div>
                                        <div className="card-subtitle">From 1-6 Dec, 2020</div>
                                        <div className="engine-content mt-4">
                                            <div className="donut-chart">
                                                <svg width="150" height="150">
                                                    <circle cx="75" cy="75" r="60" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                                                    <circle cx="75" cy="75" r="60" fill="none" stroke="#22d3ee" strokeWidth="15"
                                                        strokeDasharray="150, 377" strokeDashoffset="-75" />
                                                    <circle cx="75" cy="75" r="60" fill="none" stroke="#8b5cf6" strokeWidth="15"
                                                        strokeDasharray="120, 377" strokeDashoffset="75" />
                                                </svg>
                                            </div>
                                            <div className="accuracy-label">
                                                <span className="legend-bullet deceased"></span>
                                                <span className="card-subtitle">Accuracy</span>
                                                <span className="accuracy-value">40%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Scans Card */}
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <div className="card-title">Recent scans</div>
                                            <button className="view-report-btn">View Report</button>
                                        </div>
                                        <div className="scans-data">
                                            <div className="scans-value">2.568</div>
                                            <div className="scans-diff"><TrendingDown size={14} /> 2.1% vs last week</div>
                                        </div>
                                        <div className="card-subtitle mt-2">Scans from 1-6 Dec, 2020</div>
                                        <div className="line-chart-placeholder">
                                            {/* Simplified SVG line chart */}
                                            <svg width="100%" height="100" viewBox="0 0 100 40" preserveAspectRatio="none">
                                                <path d="M0,35 Q20,30 40,32 T80,10 T100,5" fill="none" stroke="#22d3ee" strokeWidth="2" />
                                                <path d="M0,30 Q25,20 50,25 T100,20" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="review-view">
                            <h1 className="dashboard-title">Review Management</h1>
                            {/* Review Form will go here */}
                            <ReviewForm />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
