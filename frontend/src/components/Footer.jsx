import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="footer-container container">
                <div className="footer-grid">
                    <div className="footer-brand-col">
                        <div className="footer-brand-text">Wedakam <span className="text-cyan">●</span></div>
                        <p className="footer-brand-description">
                            Learn more than just <br /> a scanning tool
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-icon">f</a>
                            <a href="#" className="social-icon">i</a>
                            <a href="#" className="social-icon">in</a>
                        </div>
                    </div>

                    <div className="footer-links-grid">
                        <div className="links-group">
                            <h4>Find Models</h4>
                            <ul>
                                <li><a href="#">Chest X-Ray API</a></li>
                                <li><a href="#">Brain MRI Models</a></li>
                                <li><a href="#">Fracture Detection</a></li>
                                <li><a href="#">Custom Training</a></li>
                            </ul>
                        </div>
                        <div className="links-group">
                            <h4>Analysis</h4>
                            <ul>
                                <li><a href="#">Generate Reports</a></li>
                                <li><a href="#">DICOM Viewer</a></li>
                                <li><a href="#">PACS Integration</a></li>
                            </ul>
                        </div>
                        <div className="links-group">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">How it Works</a></li>
                                <li><a href="#">Team</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div className="links-group">
                            <h4>More</h4>
                            <ul>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">License</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Wedakam Systems. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
