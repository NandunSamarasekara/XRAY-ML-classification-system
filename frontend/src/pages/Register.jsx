import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone_no: '',
        qualification: '',
        password: '',
        otp_code: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSendOTP = async () => {
        if (!form.email) {
            setError('Please enter your email first.');
            return;
        }
        setOtpLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || 'Failed to send OTP.');
            } else {
                setOtpSent(true);
                setSuccess(data.detail || 'OTP sent successfully!');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!otpSent) {
            setError('Please request and enter an OTP code.');
            setLoading(false);
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || 'Registration failed. Please try again.');
                return;
            }

            // Success — redirect to login
            navigate('/login', { state: { registered: true } });
        } catch (err) {
            setError('Could not connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            headerRightText="Already have an account? "
            headerRightLink="/login"
            headerRightLinkText="Sign In"
        >
            <div className="auth-form-wrapper">
                <h2 className="auth-title">Sign up</h2>

                {error && (
                    <div className="auth-error-banner">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="auth-success-banner" style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0', fontSize: '0.9rem' }}>
                        {success}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="email"
                            name="email"
                            className="auth-input"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                            style={{
                                padding: '0 15px',
                                borderRadius: '8px',
                                border: '1px solid #7c3aed',
                                background: 'white',
                                color: '#7c3aed',
                                fontWeight: '600',
                                cursor: otpLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                    </div>

                    {otpSent && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="otp_code"
                                className="auth-input"
                                placeholder="Enter 6-digit OTP"
                                value={form.otp_code}
                                onChange={handleChange}
                                required
                                maxLength="6"
                                style={{ border: '2px solid #7c3aed' }}
                            />
                        </div>
                    )}

                    <div className="name-grid">
                        <div className="form-group">
                            <input
                                type="text"
                                name="first_name"
                                className="auth-input"
                                placeholder="First name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="last_name"
                                className="auth-input"
                                placeholder="Last name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone_no"
                            className="auth-input"
                            placeholder="Phone number"
                            value={form.phone_no}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <select
                            name="qualification"
                            className="auth-input"
                            value={form.qualification}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Qualification</option>
                            <option value="MBBS/MBChB">MBBS / MBChB (Bachelor of Medicine, Bachelor of Surgery)</option>
                            <option value="MD">MD (Doctor of Medicine)</option>
                            <option value="BMBS/BMed">BMBS / BMed (Bachelor of Medicine, Bachelor of Surgery)</option>
                            <option value="MRCP">MRCP (Member of the Royal College of Physicians)</option>
                        </select>
                    </div>

                    <div className="form-group position-relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="auth-input pr-10"
                            placeholder="Password (minimum 8 characters)"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength="8"
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            {showPassword ? <EyeOff size={20} color="#718096" /> : <Eye size={20} color="#718096" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn mb-4 mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Creating account…' : 'Sign Up'}
                    </button>

                    <div className="terms-checkbox-container">
                        <input type="checkbox" id="terms" className="auth-checkbox" required />
                        <label htmlFor="terms" className="auth-checkbox-label">
                            By clicking Create account, I agree that I have read and accepted the Terms of Use and Privacy Policy.
                        </label>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Register;
