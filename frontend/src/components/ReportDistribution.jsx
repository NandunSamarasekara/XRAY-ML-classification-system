import React, { useState } from 'react';
import { ArrowLeft, Download, Mail, Share2, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { sendReportEmail } from '../api/reports';

export default function ReportDistribution({ report, patient, heatmapImage, normalImage, onBack }) {
    const [emailInput, setEmailInput] = useState(patient?.email || '');
    const [emailSent, setEmailSent] = useState(false);
    const [sending, setSending] = useState(false);

    const patientName = report?.patient_name || (patient ? `${patient.first_name} ${patient.last_name}` : 'Patient');
    const reportId = report?.report_id;

    // Build image HTML snippet (kept for reference, jsPDF handles actual rendering)
    const hasImages = normalImage || heatmapImage;

    // ── Helper: detect format from data URI or raw base64 ──
    const detectImageFormat = (src) => {
        if (!src) return null;
        if (src.startsWith('data:image/png')) return 'PNG';
        if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/jpg')) return 'JPEG';
        if (src.startsWith('data:image/')) return 'PNG'; // fallback for other data URIs
        // Raw base64 without mime - assume JPEG (most X-rays)
        return 'JPEG';
    };

    // ── Helper: convert blob URL → base64 data URI if needed ──
    const resolveImageSrc = async (src) => {
        if (!src) return null;
        if (src.startsWith('blob:')) {
            try {
                const res = await fetch(src);
                const blob = await res.blob();
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn('Failed to resolve blob URL:', e);
                return null;
            }
        }
        return src; // already base64 or data URI
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 10;

        // ── Top meta bar ──
        const now = new Date();
        const printDateTime = now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(printDateTime, margin, y);
        doc.text(`Medical Report #${reportId}`, pageWidth / 2, y, { align: 'center' });
        y += 12;

        // ── Main Title ──
        doc.setTextColor(20, 184, 166);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.text('Wedakam Health AI', pageWidth / 2, y, { align: 'center' });
        y += 8;

        // ── Subtitle ──
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Clinical X-Ray Medical Report', pageWidth / 2, y, { align: 'center' });
        y += 6;

        // ── Teal separator ──
        doc.setDrawColor(20, 184, 166);
        doc.setLineWidth(0.8);
        doc.line(margin, y, margin + contentWidth, y);
        doc.setLineWidth(0.2);
        y += 10;

        // ── Patient & Doctor Info Box (2x3 grid) ──
        const col1 = margin + 4;
        const col2 = margin + contentWidth / 2 + 4;
        const colW = contentWidth / 2 - 8;

        // Helper to draw a labelled field
        const drawField = (label, value, x, yPos) => {
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(label, x, yPos);
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(String(value || 'N/A'), colW);
            doc.text(lines, x, yPos + 6);
        };

        const boxH = 72;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, 'F');

        const patientGender = patient?.gender || report?.gender || 'N/A';
        const patientAge = (() => {
            if (patient?.dob) {
                const today = new Date();
                const birth = new Date(patient.dob);
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                return String(age);
            }
            return 'N/A';
        })();
        const patientEmail = patient?.email || 'N/A';
        const doctorName = patient ? `Dr. ${report?.doctor_name || ''}`.trim() : 'N/A';
        const regId = `REG-${report?.doctor_id || ''}` || 'N/A';

        drawField('PATIENT NAME', patientName, col1, y + 8);
        drawField('REPORT ID', `#${reportId}`, col2, y + 8);
        drawField('GENDER', patientGender, col1, y + 26);
        drawField('AGE', patientAge, col2, y + 26);
        drawField('EMAIL', patientEmail, col1, y + 44);
        drawField('DATE GENERATED', String(report?.created_date || new Date().toLocaleDateString()), col2, y + 44);
        y += boxH + 6;

        // ── Doctor Info ──
        doc.setFillColor(230, 255, 250);
        doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');
        drawField('STATUS', 'Finalized & Approved', col1, y + 8);
        y += 36;

        // ── Section helper ──
        const addSection = (title, content) => {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, y);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, y + 2, margin + contentWidth, y + 2);
            y += 7;
            doc.setFont('helvetica', content ? 'normal' : 'italic');
            doc.setFontSize(10);
            doc.setTextColor(content ? 51 : 148, content ? 65 : 163, content ? 85 : 184);
            const lines = doc.splitTextToSize(content || 'Not specified', contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * 6 + 10;
        };

        addSection('FINAL DIAGNOSIS', report?.diagnosis);
        addSection('CLINICAL OBSERVATIONS', report?.clinical_observations);
        addSection('TREATMENT PLAN', report?.treatment_plan);
        addSection('ADDITIONAL COMMENTS', report?.additional_comments);

        // ── Signature ──
        if (y > 245) { doc.addPage(); y = 20; }
        doc.setDrawColor(30, 41, 59);
        doc.line(pageWidth - margin - 60, y + 16, pageWidth - margin, y + 16);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Authorized Physician Signature', pageWidth - margin - 60, y + 21);

        // ── Footer ──
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `Wedakam Health AI  |  Report #${reportId}  |  Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 8,
                { align: 'center' }
            );
        }

        // ── Save (no images) ──
        const safePatientName = patientName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
        doc.save(`${safePatientName}_Medical_Report_${reportId}.pdf`);
    };


    const handleSendEmail = async () => {
        if (!emailInput) return;
        setSending(true);
        try {
            // Resolve blob URLs to base64 before sending
            const resolvedNormal = await resolveImageSrc(normalImage);
            const resolvedHeatmap = await resolveImageSrc(heatmapImage);

            // Build extra patient context to include in email
            const patientContext = {
                gender: patient?.gender || 'N/A',
                age: (() => {
                    if (patient?.dob) {
                        const today = new Date();
                        const birth = new Date(patient.dob);
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        return String(age);
                    }
                    return 'N/A';
                })(),
                email: patient?.email || 'N/A',
            };

            await sendReportEmail(
                reportId,
                emailInput,
                resolvedNormal,
                resolvedHeatmap,
                patientContext
            );
            setEmailSent(true);
        } catch (err) {
            console.error("Failed to send email:", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
            {/* Back */}
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#14b8a6', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
                <ArrowLeft size={18} /> Back to Reports
            </button>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>Report Distribution</h1>

            {/* Status Card */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <Share2 size={40} color="#14b8a6" />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
                    {patientName}'s Report
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                    Ref ID: <strong>#{reportId}</strong> is approved and ready.
                </p>

                {/* Action Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
                    {/* Download PDF */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <Download size={28} color="#475569" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: '8px' }}>Download PDF</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '16px' }}>
                            Download a formatted PDF formatted for print or personal records.
                        </p>
                        <button
                            onClick={handleDownload}
                            style={{ width: '100%', padding: '10px', background: '#14b8a6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Download File
                        </button>
                    </div>

                    {/* Email Document */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <Mail size={28} color="#475569" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: '8px' }}>Email Document</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '12px' }}>
                            Send a secure attachment directly to the patient's inbox.
                        </p>
                        {!emailSent ? (
                            <>
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    placeholder="Patient's Email Address"
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }}
                                />
                                <button
                                    onClick={handleSendEmail}
                                    disabled={sending || !emailInput}
                                    style={{ width: '100%', padding: '10px', background: sending ? '#94a3b8' : '#14b8a6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: (sending || !emailInput) ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                                >
                                    {sending ? 'Sending...' : 'Send with Attachment'}
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#14b8a6', fontWeight: 600, padding: '12px' }}>
                                <CheckCircle size={20} /> Email Sent Successfully!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
