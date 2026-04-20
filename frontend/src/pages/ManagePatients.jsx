import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardCheck, FileText, Settings, CreditCard, UserCircle, HelpCircle, Search, Bell, LogOut
} from 'lucide-react';
import PatientForm from "../components/PatientForm";
import PatientProfile from "../components/PatientProfile";
import PatientTable from "../components/PatientTable";
import PatientOTPVerification from "../components/PatientOTPVerification";
import XRayUpload from "../components/XRayUpload";
import XRayComparison from "../components/XRayComparison";
import ComparisonRecords from "../components/ComparisonRecords";
import CreateReport from "../components/CreateReport";
import ReportDistribution from "../components/ReportDistribution";
import { createPatient, deletePatient, getPatient, listPatients, updatePatient, verifyPatientOTP, sendPatientOTP } from "../api/patients";

import './Dashboard.css';
import '../Patient.css';

const successTimeoutMs = 2500;

const normalizeError = (error) => {
    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
            return detail.map(d => `${d.loc ? d.loc.join('.') : 'Field'}: ${d.msg}`).join(', ');
        }
        if (typeof detail === 'string') return detail;
        return JSON.stringify(detail);
    }
    if (error instanceof Error) return error.message;
    return "Unexpected error. Please try again.";
};

export default function ManagePatients() {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);

    const [view, setView] = useState("list");
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [reportContext, setReportContext] = useState(null);
    const [finalizedReport, setFinalizedReport] = useState(null);

    const [listLoading, setListLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const doctorData = localStorage.getItem('doctor');

        if (!token || !doctorData) {
            navigate('/login');
            return;
        }
        setDoctor(JSON.parse(doctorData));
        loadPatients();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('doctor');
        navigate('/login');
    };

    const loadPatients = async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await listPatients();
            setPatients(data);
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setListLoading(false);
        }
    };

    const handleView = async (patientId) => {
        setView("profile");
        setDetailsLoading(true);
        setError(null);
        try {
            const data = await getPatient(patientId);
            setSelectedPatient(data);
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setSelectedPatient(patient);
        setView("form");
    };

    const handleCreateNew = () => {
        setEditingPatient(null);
        setSelectedPatient(null);
        setView("form");
    };

    const handleDelete = async (patient) => {
        const confirmed = window.confirm(`Delete ${patient.first_name} ${patient.last_name}? This cannot be undone.`);
        if (!confirmed) return;

        setError(null);
        setFormLoading(true);
        try {
            await deletePatient(patient.id);
            await loadPatients();
            if (selectedPatient?.id === patient.id) setSelectedPatient(null);
            if (editingPatient?.id === patient.id) setEditingPatient(null);
            setSuccess("Patient deleted successfully.");
            setView("list");
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setFormLoading(false);
            window.setTimeout(() => setSuccess(null), successTimeoutMs);
        }
    };

    const handleSubmit = async (payload) => {
        setError(null);
        setFormLoading(true);
        try {
            let result;
            if (editingPatient) {
                result = await updatePatient(editingPatient.id, payload);
                setSuccess("Patient updated successfully.");
                setSelectedPatient(result);
                setEditingPatient(null);
                setView("profile");
            } else {
                result = await createPatient(payload);
                setSelectedPatient(result);
                setEditingPatient(null);
                if (result.is_active === false) {
                    setView("otp");
                    setSuccess("Verification code sent to email.");
                } else {
                    setSuccess("Patient created successfully.");
                    setView("profile");
                }
            }
            await loadPatients();
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setFormLoading(false);
            window.setTimeout(() => setSuccess(null), successTimeoutMs);
        }
    };

    const handleVerifyOTP = async (otp) => {
        if (!selectedPatient) return;
        setError(null);
        setFormLoading(true);
        try {
            const result = await verifyPatientOTP(selectedPatient.id, otp);
            setSelectedPatient(result);
            setSuccess("Patient successfully authorized.");
            setView("profile");
            await loadPatients();
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setFormLoading(false);
            window.setTimeout(() => setSuccess(null), successTimeoutMs);
        }
    };

    const handleSendOTPAction = async () => {
        if (!selectedPatient) return;
        setError(null);
        setFormLoading(true);
        try {
            await sendPatientOTP(selectedPatient.id);
            setSuccess("Verification code sent to email.");
            setView("otp");
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setFormLoading(false);
            window.setTimeout(() => setSuccess(null), successTimeoutMs);
        }
    };

    const handleCancelForm = () => {
        setEditingPatient(null);
        setView(selectedPatient ? "profile" : "list");
    };

    const handleBackToList = () => {
        setView("list");
    };

    const filteredPatients = patients.filter((p) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        const phone = p.phone ? p.phone.toLowerCase() : "";
        return fullName.includes(query) || phone.includes(query);
    });

    if (!doctor) return null;

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
                    <a href="/patients" className="sidebar-link active">
                        <span className="sidebar-icon"><Users size={18} /></span> Manage Patients
                    </a>
                    <a href="/reports" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/reports'); }}>
                        <span className="sidebar-icon"><FileText size={18} /></span> Manage Reports
                    </a>
                    <a href="#" className="sidebar-link">
                        <span className="sidebar-icon"><ClipboardCheck size={18} /></span> Review
                    </a>

                    <p className="sidebar-section-label">OTHERS</p>
                    <a href="/account-settings" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/account-settings'); }}>
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

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="dashboard-search-container">
                        <Search className="search-icon-placeholder" size={18} />
                        <input type="text" className="dashboard-search" placeholder="Search Patients" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

                <main className="dashboard-content" style={{ padding: '0 40px 40px' }}>
                    {error && <div className="status error" style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
                    {success && <div className="status success" style={{ padding: '12px', background: '#dcfce3', color: '#166534', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

                    {view === "list" && (
                        <PatientTable
                            patients={filteredPatients}
                            loading={listLoading}
                            onView={handleView}
                            onCreateNew={handleCreateNew}
                        />
                    )}

                    {view === "form" && (
                        <div className="panel" style={{ maxWidth: 800, margin: '20px auto 0' }}>
                            <PatientForm
                                mode={editingPatient ? "edit" : "create"}
                                initialData={editingPatient}
                                onSubmit={handleSubmit}
                                onCancel={handleCancelForm}
                                loading={formLoading}
                            />
                        </div>
                    )}

                    {view === "otp" && selectedPatient && (
                        <div className="panel" style={{ maxWidth: 800, margin: '20px auto 0', padding: '40px' }}>
                            <PatientOTPVerification
                                patientEmail={selectedPatient.email || "No email provided"}
                                loading={formLoading}
                                onVerify={handleVerifyOTP}
                                onCancel={() => setView("profile")}
                            />
                        </div>
                    )}

                    {view === "profile" && (
                        <div className="panel" style={{ maxWidth: 900, margin: '20px auto 0' }}>
                            <PatientProfile
                                patient={selectedPatient}
                                loading={detailsLoading}
                                onEdit={() => selectedPatient && handleEdit(selectedPatient)}
                                onBack={handleBackToList}
                                onDelete={() => selectedPatient && handleDelete(selectedPatient)}
                                onAuthorize={handleSendOTPAction}
                                onNewVisit={() => setView("xray-upload")}
                                onViewRecords={() => setView("comparison-records")}
                            />
                        </div>
                    )}

                    {view === "xray-upload" && (
                        <XRayUpload
                            patient={selectedPatient}
                            onCancel={() => setView(selectedPatient ? "profile" : "list")}
                            onGenerateReport={(ctx) => {
                                setReportContext(ctx);
                                setView("create-report");
                            }}
                            onCompareRequested={(data) => {
                                setComparisonData(data);
                                setView("xray-compare");
                            }}
                        />
                    )}

                    {view === "xray-compare" && selectedPatient && comparisonData && (
                        <XRayComparison
                            patient={selectedPatient}
                            baselineImage={comparisonData.baselineImage}
                            followUpImage={comparisonData.followUpImage}
                            diagnosis={comparisonData.diagnosis}
                            onFinalize={() => {
                                setSuccess("Comparison saved successfully.");
                                setView("comparison-records");
                                window.setTimeout(() => setSuccess(null), successTimeoutMs);
                            }}
                            onExit={() => navigate('/dashboard')}
                        />
                    )}

                    {view === "comparison-records" && selectedPatient && (
                        <ComparisonRecords
                            patient={selectedPatient}
                            onBack={() => setView("profile")}
                        />
                    )}

                    {view === "create-report" && selectedPatient && (
                        <CreateReport
                            patient={selectedPatient}
                            doctor={doctor}
                            reportContext={reportContext}
                            onBack={() => setView("xray-upload")}
                            onSaveDraft={() => navigate('/reports')}
                            onFinalize={(report) => {
                                setFinalizedReport(report);
                                setView("report-distribution");
                            }}
                        />
                    )}

                    {view === "report-distribution" && (
                        <ReportDistribution
                            report={finalizedReport}
                            patient={selectedPatient}
                            heatmapImage={reportContext?.heatmap_base64 || null}
                            normalImage={reportContext?.normal_image || null}
                            onBack={() => navigate('/reports')}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
