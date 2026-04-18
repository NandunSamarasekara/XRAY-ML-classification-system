import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Plus,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
    Star,
} from 'lucide-react';
import './Reviews.css';

const API_BASE = '/api';

function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

function handle401(navigate) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('doctor');
    navigate('/login', { state: { error: 'Session expired. Please sign in again.' } });
}

/* ── Star Rating Component ── */
function StarRating({ value, onChange, readonly = false }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-btn ${(hovered || value) >= star ? 'active' : ''}`}
                    onClick={() => !readonly && onChange && onChange(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    disabled={readonly}
                    aria-label={`${star} star`}
                >
                    <Star size={24} fill={(hovered || value) >= star ? '#f59e0b' : 'none'} />
                </button>
            ))}
            {value > 0 && <span className="star-value-label">{value}/5</span>}
        </div>
    );
}

/* ── Review Modal (Create / Edit) ── */
function ReviewModal({ mode, initial, onClose, onSaved, currentDoctorName }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        doctor_name: initial?.doctor_name || currentDoctorName || '',
        rating: initial?.rating || 0,
        comment: initial?.comment || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.rating === 0) { setError('Please select a rating (1–5 stars)'); return; }
        if (!form.comment.trim()) { setError('Please provide a comment'); return; }
        setLoading(true);
        setError('');
        try {
            const url = isEdit ? `${API_BASE}/reviews/${initial.id}` : `${API_BASE}/reviews/`;
            const method = isEdit ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify({
                    doctor_name: form.doctor_name,
                    rating: form.rating,
                    comment: form.comment || null,
                }),
            });
            if (!res.ok) {
                if (res.status === 401) {
                    handle401(navigate);
                    return;
                }
                const d = await res.json();
                throw new Error(d.detail || 'Request failed');
            }
            onSaved(await res.json());
        } catch (err) {
            console.error('Submit review error:', err);
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? 'Edit Review' : 'New Review'}</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {error && <div className="modal-error"><AlertCircle size={16} /> {error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Doctor Name */}
                    <div className="form-group">
                        <label>Doctor Name *</label>
                        <input
                            value={form.doctor_name}
                            onChange={(e) => setForm((p) => ({ ...p, doctor_name: e.target.value }))}
                            required
                            placeholder="e.g. Dr. Amal Perera"
                            className="modal-input"
                        />
                    </div>

                    {/* Star Rating */}
                    <div className="form-group">
                        <label>Rating *</label>
                        <StarRating
                            value={form.rating}
                            onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
                        />
                    </div>

                    {/* Comment */}
                    <div className="form-group">
                        <label>Comment *</label>
                        <textarea
                            value={form.comment}
                            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                            rows={4}
                            placeholder="Share your experience..."
                            className="modal-input modal-textarea"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading && <Loader2 size={16} className="spin" />}
                            {isEdit ? 'Save Changes' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ review, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/reviews/${review.id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
            onDeleted(review.id);
        } catch (err) { setError(err.message); setLoading(false); }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Delete Review</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <p className="delete-confirm-text">
                    Are you sure you want to delete the review for <strong>{review.doctor_name}</strong>? This cannot be undone.
                </p>
                {error && <div className="modal-error"><AlertCircle size={16} /> {error}</div>}
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />} Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Stars Display (readonly) ── */
function StarsDisplay({ value }) {
    return (
        <div className="stars-display">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16}
                    fill={value >= s ? '#f59e0b' : 'none'}
                    stroke={value >= s ? '#f59e0b' : '#d1d5db'}
                />
            ))}
        </div>
    );
}

/* ── Main Page ── */
const Reviews = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const PAGE_SIZE = 10;

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const doctorData = localStorage.getItem('doctor');
        if (!token || !doctorData) { navigate('/login'); return; }
        setDoctor(JSON.parse(doctorData));
    }, [navigate]);

    const fetchReviews = useCallback(async () => {
        setLoading(true); setFetchError('');
        try {
            const params = new URLSearchParams({ skip: page * PAGE_SIZE, limit: PAGE_SIZE });
            const res = await fetch(`${API_BASE}/reviews/?${params}`, { headers: authHeaders() });
            if (res.status === 401) {
                handle401(navigate);
                return;
            }
            if (!res.ok) throw new Error('Failed to load reviews');
            const data = await res.json();
            setReviews(data);
            setHasMore(data.length === PAGE_SIZE);
        } catch (err) { 
            console.error('Fetch reviews error:', err);
            setFetchError(err.message); 
        }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => { if (doctor) fetchReviews(); }, [doctor, fetchReviews]);

    const onCreated = () => { setShowCreate(false); setPage(0); fetchReviews(); };
    const onUpdated = (r) => { setEditTarget(null); setReviews((prev) => prev.map((x) => x.id === r.id ? r : x)); };
    const onDeleted = (id) => { setDeleteTarget(null); setReviews((prev) => prev.filter((r) => r.id !== id)); };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('doctor');
        navigate('/login');
    };

    const displayed = reviews.filter((r) =>
        search === '' || r.doctor_name.toLowerCase().includes(search.toLowerCase())
    );

    if (!doctor) return null;

    /* average rating */
    const avg = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';

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
                    <a href="/dashboard" className="sidebar-link"><span className="sidebar-icon"><LayoutDashboard size={18} /></span> Dashboard</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><Users size={18} /></span> Manage Patients</a>
                    <a href="/reviews" className="sidebar-link active"><span className="sidebar-icon"><ClipboardCheck size={18} /></span> Review</a>
                    <p className="sidebar-section-label">OTHERS</p>
                    <a href="/account-settings" className="sidebar-link"><span className="sidebar-icon"><Settings size={18} /></span> Settings</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><CreditCard size={18} /></span> Payment</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><UserCircle size={18} /></span> Accounts</a>
                    <a href="#" className="sidebar-link"><span className="sidebar-icon"><HelpCircle size={18} /></span> Help</a>
                </nav>
            </aside>

            <div className="dashboard-main">
                {/* Topbar */}
                <header className="dashboard-topbar">
                    <div className="dashboard-search-container">
                        <Search className="search-icon-placeholder" size={18} />
                        <input
                            type="text"
                            className="dashboard-search"
                            placeholder="Search by doctor name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="dashboard-user-info">
                        <button className="notification-btn"><Bell size={20} /></button>
                        <div className="dashboard-avatar-container">
                            <span className="dashboard-greeting">Hello, Dr. {doctor.first_name}</span>
                            <div className="dashboard-avatar">{doctor.first_name.charAt(0)}</div>
                        </div>
                        <button className="dashboard-logout-btn" onClick={handleLogout}><LogOut size={16} /></button>
                    </div>
                </header>

                <main className="dashboard-content">
                    {/* Header */}
                    <div className="reviews-page-header">
                        <div>
                            <h1 className="dashboard-title">Service Review Management</h1>
                            <p className="reviews-subtitle">Manage doctor ratings and service reviews</p>
                        </div>
                        <button className="btn-primary reviews-add-btn" onClick={() => setShowCreate(true)}>
                            <Plus size={18} /> New Review
                        </button>
                    </div>

                    {/* Summary chips */}
                    <div className="reviews-stats-row">
                        <div className="review-stat-chip" style={{ background: '#fffbeb', color: '#92400e' }}>
                            <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                            <span className="stat-chip-count">{avg}</span>
                            <span className="stat-chip-label">Avg Rating</span>
                        </div>
                        <div className="review-stat-chip" style={{ background: '#eff6ff', color: '#1e40af' }}>
                            <ClipboardCheck size={16} />
                            <span className="stat-chip-count">{reviews.length}</span>
                            <span className="stat-chip-label">Total Reviews</span>
                        </div>
                    </div>

                    {/* Table card */}
                    <div className="reviews-card">
                        {loading ? (
                            <div className="reviews-loading"><Loader2 size={32} className="spin" /><p>Loading reviews…</p></div>
                        ) : fetchError ? (
                            <div className="reviews-error"><AlertCircle size={24} /><p>{fetchError}</p><button className="btn-secondary" onClick={fetchReviews}>Retry</button></div>
                        ) : displayed.length === 0 ? (
                            <div className="reviews-empty">
                                <ClipboardCheck size={48} strokeWidth={1} />
                                <p>No reviews found</p>
                                <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Add your first review</button>
                            </div>
                        ) : (
                            <div className="reviews-table-wrapper">
                                <table className="reviews-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Doctor Name</th>
                                            <th>Rating</th>
                                            <th>Comment</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map((r, idx) => (
                                            <tr key={r.id} className="review-row">
                                                <td className="review-id">{page * PAGE_SIZE + idx + 1}</td>
                                                <td className="review-patient">{r.doctor_name}</td>
                                                <td><StarsDisplay value={r.rating} /></td>
                                                <td className="review-comments">
                                                    {r.comment
                                                        ? <span title={r.comment}>{r.comment.length > 50 ? r.comment.slice(0, 50) + '…' : r.comment}</span>
                                                        : <span className="review-na">—</span>}
                                                </td>
                                                <td className="review-date">
                                                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                                                </td>
                                                <td>
                                                    <div className="review-actions">
                                                        <button className="review-action-btn edit" title="Edit" onClick={() => setEditTarget(r)}><Pencil size={15} /></button>
                                                        <button className="review-action-btn delete" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !fetchError && (
                            <div className="reviews-pagination">
                                <button className="page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <span className="page-info">Page {page + 1}</span>
                                <button className="page-btn" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showCreate && (
                <ReviewModal 
                    mode="create" 
                    initial={null} 
                    onClose={() => setShowCreate(false)} 
                    onSaved={onCreated} 
                    currentDoctorName={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                />
            )}
            {editTarget && (
                <ReviewModal 
                    mode="edit" 
                    initial={editTarget} 
                    onClose={() => setEditTarget(null)} 
                    onSaved={onUpdated} 
                    currentDoctorName={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                />
            )}
            {deleteTarget && <DeleteConfirm review={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={onDeleted} />}
        </div>
    );
};

export default Reviews;
