import React from 'react';
import '../App.css';

const Footer = () => {
    return (
        <div className="footer-wrapper">
            {/* Floating CTA Box */}
            <div className="cta-box">
                <h2>Get <span className="text-cyan">started with</span> Wedakam</h2>
                <p>Integrate our precision machine learning models into your clinical workflow. Secure, fast, and reliable diagnostic assistance tailored for modern healthcare providers.</p>
                <button className="pill-btn btn-cyan">Lets Get Started</button>
            </div>

            <footer className="footer container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-accent-pill"></div>
                        <p style={{ fontWeight: '700', marginBottom: '1rem' }}>
                            Learn more than just<br />a scanning tool
                        </p>
                        <div className="social-icons">
                            <a href="#twitter" className="social-icon">t</a>
                            <a href="#instagram" className="social-icon">i</a>
                            <a href="#linkedin" className="social-icon">in</a>
                        </div>
                        <div style={{ marginTop: '2rem', fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-text)' }}>
                            Wedakam
                        </div>
                    </div>

                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Find Models</h4>
                            <a href="#chest">Chest X-Ray API</a>
                            <a href="#mri">Brain MRI Models</a>
                            <a href="#bone">Fracture Detectors</a>
                            <a href="#custom">Custom Training</a>
                        </div>

                        <div className="link-group">
                            <h4>Analysis</h4>
                            <a href="#reports">Generate Reports</a>
                            <a href="#dicom">DICOM Viewer</a>
                            <a href="#pacs">PACS Integration</a>
                        </div>

                        <div className="link-group">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#how">How it Works</a>
                            <a href="#term">Term</a>
                            <a href="#privacy">Privacy Policy</a>
                        </div>

                        <div className="link-group">
                            <h4>More</h4>
                            <a href="#docs">Documentation</a>
                            <a href="#license">License</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    Copyright &copy; 2026. Created with Wedakam Systems
                </div>
            </footer>
        </div>
    );
};

export default Footer;
