import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

export default function PatientOTPVerification({ patientEmail, loading, onVerify, onCancel }) {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit verification code.");
            return;
        }
        setError(null);
        onVerify(otp);
    };

    return (
        <div className="form" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={32} />
                </div>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: 12 }}>Verify Patient Email</h1>
            <p className="subtitle" style={{ marginBottom: 32 }}>
                We sent a 6-digit verification code to <strong style={{ color: 'var(--ink)' }}>{patientEmail}</strong>.
                Please enter the code below to activate the patient profile.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <label className="field">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        style={{ fontSize: '1.25rem', padding: '16px', textAlign: 'center', letterSpacing: '0.25em', fontWeight: 600 }}
                    />
                    {error && <small className="error-text" style={{ textAlign: 'center' }}>{error}</small>}
                </label>

                <button className="button primary" style={{ borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} type="submit" disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify & Activate"} <ArrowRight size={18} />
                </button>

                <button className="button ghost" type="button" onClick={onCancel} disabled={loading} style={{ marginTop: 8 }}>
                    Do this later
                </button>
            </form>
        </div>
    );
}
