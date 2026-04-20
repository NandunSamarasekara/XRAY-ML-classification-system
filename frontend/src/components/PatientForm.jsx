import { useEffect, useRef, useState } from "react";

const initialState = {
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
};

const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\d{10}$/;
const VALID_GENDERS = ["Male", "Female"];

export default function PatientForm({ mode, initialData, loading, onSubmit, onCancel }) {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    // Track whether the form has been submitted at least once
    const submitted = useRef(false);

    useEffect(() => {
        if (initialData && mode === "edit") {
            setForm({
                first_name: initialData.first_name ?? "",
                last_name: initialData.last_name ?? "",
                dob: initialData.dob ?? "",
                gender: initialData.gender ?? "",
                phone: initialData.phone ?? "",
                email: initialData.email ?? "",
                address: initialData.address ?? "",
                notes: initialData.notes ?? "",
            });
            setErrors({});
            setTouched({});
            submitted.current = false;
            return;
        }
        setForm(initialState);
        setErrors({});
        setTouched({});
        submitted.current = false;
    }, [initialData, mode]);

    // Clear error for a specific field when user starts typing
    const clearError = (field) => {
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    };

    // Only allow letters and spaces — strips numbers and symbols in real time
    const handleNameChange = (field, value) => {
        const filtered = value.replace(/[^A-Za-z\s]/g, '');
        setForm((prev) => ({ ...prev, [field]: filtered }));
        clearError(field);
    };

    // Block paste of invalid characters in name fields
    const handleNamePaste = (field, event) => {
        const pasted = event.clipboardData.getData('text');
        if (/[^A-Za-z\s]/.test(pasted)) {
            event.preventDefault();
            const filtered = pasted.replace(/[^A-Za-z\s]/g, '');
            setForm((prev) => ({ ...prev, [field]: prev[field] + filtered }));
        }
    };

    // Only allow digits — strips letters and symbols in real time
    const handlePhoneChange = (value) => {
        const filtered = value.replace(/[^0-9]/g, '');
        setForm((prev) => ({ ...prev, phone: filtered }));
        clearError('phone');
    };

    // Block paste of non-digit characters in phone field
    const handlePhonePaste = (event) => {
        const pasted = event.clipboardData.getData('text');
        if (/[^0-9]/.test(pasted)) {
            event.preventDefault();
            const filtered = pasted.replace(/[^0-9]/g, '');
            setForm((prev) => ({ ...prev, phone: prev.phone + filtered }));
        }
    };

    // Block keyboard entry of non-letter keys in name fields
    const handleNameKeyDown = (event) => {
        const key = event.key;
        // Allow control keys
        if (key.length > 1) return;
        if (!/^[A-Za-z\s]$/.test(key)) {
            event.preventDefault();
        }
    };

    // Block keyboard entry of non-digit keys in phone field
    const handlePhoneKeyDown = (event) => {
        const key = event.key;
        // Allow control keys (Backspace, Delete, Arrow keys, Tab, etc.)
        if (key.length > 1) return;
        if (!/^[0-9]$/.test(key)) {
            event.preventDefault();
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const validate = () => {
        const nextErrors = {};

        // --- First Name: letters and spaces only ---
        if (!form.first_name.trim()) {
            nextErrors.first_name = "First name is required.";
        } else if (!nameRegex.test(form.first_name)) {
            nextErrors.first_name = "First name can only contain letters and spaces. Numbers and symbols are not allowed.";
        }

        // --- Last Name: letters and spaces only ---
        if (!form.last_name.trim()) {
            nextErrors.last_name = "Last name is required.";
        } else if (!nameRegex.test(form.last_name)) {
            nextErrors.last_name = "Last name can only contain letters and spaces. Numbers and symbols are not allowed.";
        }

        // --- Date of Birth: required, not in future, max 120 years old ---
        const MAX_AGE_YEARS = 120;
        if (!form.dob) {
            nextErrors.dob = "Date of birth is required.";
        } else {
            const dobDate = new Date(form.dob);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dobDate > today) {
                nextErrors.dob = "Date of birth cannot be in the future.";
            } else {
                // Reject dates older than MAX_AGE_YEARS
                const minAllowedDate = new Date();
                minAllowedDate.setFullYear(minAllowedDate.getFullYear() - MAX_AGE_YEARS);
                if (dobDate < minAllowedDate) {
                    nextErrors.dob = `Date of birth cannot be more than ${MAX_AGE_YEARS} years ago. Please enter a valid date.`;
                }
            }
        }

        // --- Gender: must be Male or Female ---
        if (!form.gender) {
            nextErrors.gender = "Gender is required. Please select Male or Female.";
        } else if (!VALID_GENDERS.includes(form.gender)) {
            nextErrors.gender = "Please select a valid gender (Male or Female).";
        }

        // --- Phone: digits only, exactly 10 digits ---
        if (!form.phone || !form.phone.trim()) {
            nextErrors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(form.phone)) {
            nextErrors.phone = "Phone number must be exactly 10 digits. Letters and symbols are not allowed.";
        }

        // --- Email ---
        if (!form.email || !form.email.trim()) {
            nextErrors.email = "Email address is required.";
        } else if (!emailRegex.test(form.email)) {
            nextErrors.email = "Enter a valid email address.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Mark that form was submitted — errors now always show
        submitted.current = true;
        setTouched({
            first_name: true, last_name: true, dob: true,
            gender: true, phone: true, email: true,
        });
        if (!validate()) return;

        const payload = {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            dob: form.dob,
            gender: form.gender ? form.gender.toUpperCase() : null,
            phone: form.phone.trim() ? form.phone.trim() : null,
            email: form.email.trim(),
            address: form.address.trim() ? form.address.trim() : null,
            notes: form.notes.trim() ? form.notes.trim() : null,
        };

        onSubmit(payload);
    };

    // Show error if field was touched (blurred) OR if form was submitted
    const hasError = (field) => (touched[field] || submitted.current) && errors[field];

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {mode === "edit" && <p className="eyebrow">EDIT PATIENT</p>}
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
                            {mode === "edit" ? "Update Patient Profile" : "Create Patient Profile"}
                        </h1>
                    </div>
                    {mode === "edit" && (
                        <button className="button ghost" type="button" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                    )}
                    {mode === "create" && (
                        <button className="button" type="button" onClick={onCancel} disabled={loading}
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 600 }}>
                            Discard
                        </button>
                    )}
                </div>
                <p className="subtitle" style={{ maxWidth: 400 }}>
                    Please enter the patient's information below to {mode === "edit" ? "update the" : "create a new"} profile in the system.
                </p>
            </div>

            <div className="form-grid">
                <label className="field">
                    <span>First Name *</span>
                    <input
                        type="text"
                        className={hasError('first_name') ? 'input-error' : ''}
                        value={form.first_name}
                        onChange={(event) => handleNameChange("first_name", event.target.value)}
                        onKeyDown={handleNameKeyDown}
                        onPaste={(event) => handleNamePaste("first_name", event)}
                        onBlur={() => handleBlur('first_name')}
                        placeholder="e.g. Jordan"
                        maxLength={50}
                        autoComplete="given-name"
                    />
                    {(touched.first_name || submitted.current) && errors.first_name && <small className="error-text">{errors.first_name}</small>}
                </label>

                <label className="field">
                    <span>Last Name *</span>
                    <input
                        type="text"
                        className={hasError('last_name') ? 'input-error' : ''}
                        value={form.last_name}
                        onChange={(event) => handleNameChange("last_name", event.target.value)}
                        onKeyDown={handleNameKeyDown}
                        onPaste={(event) => handleNamePaste("last_name", event)}
                        onBlur={() => handleBlur('last_name')}
                        placeholder="e.g. Patel"
                        maxLength={50}
                        autoComplete="family-name"
                    />
                    {(touched.last_name || submitted.current) && errors.last_name && <small className="error-text">{errors.last_name}</small>}
                </label>

                <label className="field">
                    <span>Date of Birth *</span>
                    <input
                        type="date"
                        className={hasError('dob') ? 'input-error' : ''}
                        value={form.dob}
                        max={new Date().toISOString().split('T')[0]}
                        min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 120); return d.toISOString().split('T')[0]; })()}
                        onChange={(event) => handleChange("dob", event.target.value)}
                        onBlur={() => handleBlur('dob')}
                    />
                    {(touched.dob || submitted.current) && errors.dob && <small className="error-text">{errors.dob}</small>}
                </label>

                <label className="field">
                    <span>Gender *</span>
                    <select
                        className={hasError('gender') ? 'input-error' : ''}
                        value={form.gender}
                        onChange={(event) => handleChange("gender", event.target.value)}
                        onBlur={() => handleBlur('gender')}
                    >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    {(touched.gender || submitted.current) && errors.gender && <small className="error-text">{errors.gender}</small>}
                </label>

                <label className="field">
                    <span>Phone *</span>
                    <input
                        type="tel"
                        className={hasError('phone') ? 'input-error' : ''}
                        value={form.phone}
                        onChange={(event) => handlePhoneChange(event.target.value)}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={handlePhonePaste}
                        onBlur={() => handleBlur('phone')}
                        placeholder="0771234567"
                        maxLength={10}
                        autoComplete="tel"
                    />
                    {(touched.phone || submitted.current) && errors.phone && <small className="error-text">{errors.phone}</small>}
                </label>

                <label className="field">
                    <span>Email *</span>
                    <input
                        type="email"
                        className={hasError('email') ? 'input-error' : ''}
                        value={form.email}
                        onChange={(event) => handleChange("email", event.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="name@example.com"
                        autoComplete="email"
                    />
                    {(touched.email || submitted.current) && errors.email && <small className="error-text">{errors.email}</small>}
                </label>

                <label className="field field-full">
                    <span>Address</span>
                    <input
                        type="text"
                        value={form.address}
                        onChange={(event) => handleChange("address", event.target.value)}
                        placeholder="101 Maple Ave, Springfield"
                        maxLength={255}
                    />
                </label>

                <label className="field field-full">
                    <span>Notes</span>
                    <textarea
                        rows={5}
                        value={form.notes}
                        onChange={(event) => handleChange("notes", event.target.value)}
                        placeholder="Include medical history, allergies, treatment notes..."
                    />
                </label>
            </div>

            <button className="button primary" style={{ borderRadius: '12px', padding: '16px' }} type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Patient"}
            </button>
        </form>
    );
}
