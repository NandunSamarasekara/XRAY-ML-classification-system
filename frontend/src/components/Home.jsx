import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import '../App.css';
import Footer from './Footer';

const Home = () => {
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/reviews/featured');
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                console.error('Error fetching featured reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const nextReview = () => {
        if (reviews.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }
    };

    const prevReview = () => {
        if (reviews.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
        }
    };

    const currentReview = reviews[currentIndex];
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero container" id="home">
                <div className="hero-content">
                    <h1 className="hero-title">
                        We Are Ready to <br />
                        <span className="text-cyan">Scan the XRAYs</span> <br />
                        for you
                    </h1>
                    <p className="hero-subtitle">
                        In times like today, precision in diagnosis is very important, especially since the volume of imaging data is increasing day by day, so we are ready to help you with our advanced machine learning medical consultation.
                    </p>
                    <Link to="/register" className="pill-btn btn-cyan">Get Started</Link>
                </div>

                <div className="hero-visual">
                    <div className="hero-bg-arch"></div>
                    <div className="hero-arch-image arch-shape" style={{ background: 'url(https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80) no-repeat center center', backgroundSize: 'cover' }}>
                    </div>
                </div>
            </section>

            {/* CTA Banner Section */}
            <section className="cta-banner-section container">
                <div className="cta-banner-card">
                    <div className="cta-banner-content">
                        <h2>Get <span className="text-cyan">started with</span> Wedakam</h2>
                        <p>Integrate our precision machine learning models into your clinical workflow. Secure, fast, and reliable diagnostic assistance tailored for medical healthcare providers.</p>
                    </div>
                    <Link to="/register" className="pill-btn btn-cyan">Let's Get Started</Link>
                </div>
            </section>

            <Footer />

            {/* Special Services Section */}
            <section className="special-services-section container" id="services">
                <div className="special-services-layout">
                    <div className="special-visual-container">
                        <div className="special-image-arch arch-shape" style={{ background: 'url(https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80) no-repeat center center', backgroundSize: 'cover' }}>
                        </div>
                    </div>

                    <div className="special-content-container">
                        <h2 className="section-title">Our <span className="text-cyan">Special Services</span></h2>
                        <p className="section-subtitle">
                            In times like today, diagnostic accuracy is very important, especially since the number of challenging cases is increasing day by day, so we are ready to help you with our advanced models.
                        </p>

                        <div className="special-services-grid">
                            <div className="special-service-card">
                                <div className="special-icon-box">0/1</div>
                                <h3>Binary classification</h3>
                                <p>Upload an image of your patient's XRAY. There is a binary classification model with high accuracy to detect whether there is a disease or not.</p>
                            </div>
                            <div className="special-service-card">
                                <div className="special-icon-box">0</div>
                                <h3>Multi-class classification</h3>
                                <p>Automated detection of 12 diseases including pneumonia, pneumothorax, and cardiomegaly on standard PA films.</p>
                            </div>
                            <div className="special-service-card">
                                <div className="special-icon-box">🔧</div>
                                <h3>Fracture Detection</h3>
                                <p>Pinpoint hairline fractures and skeletal abnormalities with high precision algorithms.</p>
                            </div>
                            <div className="special-service-card">
                                <div className="special-icon-box">📱</div>
                                <h3>DICOM Viewer</h3>
                                <p>Integrated Web viewer for immediate manipulation and assessment of medical imaging data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Categories Section */}
            <section className="categories-section container" id="product">
                <div className="categories-header">
                    <h2 className="section-title center">Our <span className="text-cyan">Main Services</span> Categories</h2>
                </div>

                <div className="categories-layout">
                    <div className="category-item">
                        <div className="category-icon-circle">💬</div>
                        <h3>Interact with the patient</h3>
                        <p>Interact with the patient and get the proper diagnosis. You can send the medical reports using the system.</p>
                    </div>

                    <div className="category-item highlight">
                        <div className="category-icon-circle accent">🧬</div>
                        <h3>X-Ray Analysis</h3>
                        <p>Just upload an image of the XRAY. Heavily trained Machine Learning model will classify the XRAY and provide you with the proper diagnosis.</p>
                    </div>
                ) : (
                    <div className="doctors-layout">
                        <div className="doctor-info-card">
                            <h4>Cardiologist</h4>
                            <h3>Dr. James<br />Wellington</h3>
                            <a href="#readmore">Read More &rarr;</a>
                        </div>

                    <div className="category-item">
                        <div className="category-icon-circle">🏥</div>
                        <h3>Clinical Integration</h3>
                        <p>Get priority APIs in hospitals with Wedakam. Which allows you to integrate your local hospital's PACS practically and save time.</p>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="testimonial-section container" id="about">
                <div className="testimonial-layout">
                    <div className="testimonial-info-box">
                        <p className="box-tag">Cardiologist</p>
                        <h3>Dr. James Wellington</h3>
                        <a href="#readmore" className="read-more-link">Read More &rarr;</a>
                    </div>
                    <div className="testimonial-image-arch arch-shape" style={{ background: 'url(https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80) no-repeat center center', backgroundSize: 'cover' }}>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
