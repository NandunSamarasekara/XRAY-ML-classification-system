import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import '../App.css';

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
            <section className="hero container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        We Are Ready to <br />
                        <span className="text-cyan">Scan the XRAYs</span> <br />
                        for you
                    </h1>
                    <p className="hero-subtitle">
                        In times like today, precision in diagnosis is very important, especially since the volume of imaging data is increasing day by day, so we are ready to help you with our advanced machine learning medical consultation.
                    </p>
                    <Link to="/register" className="pill-btn btn-cyan" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>Get Started</Link>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <h3>2<span className="stat-plus"></span></h3>
                            <p>Active<br /> ML Models</p>
                        </div>
                        <div className="stat-item">
                            <h3>1000<span className="stat-plus">+</span></h3>
                            <p>Active<br />Scans</p>
                        </div>
                        <div className="stat-item">
                            <h3>1<span className="stat-plus">+</span></h3>
                            <p>Medical<br />Partners</p>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-bg-arch"></div>
                    {/* Using a placeholder visual that resembles the shape */}
                    <div className="hero-arch-image arch-shape" style={{ background: 'url(https://plus.unsplash.com/premium_photo-1661665815817-1f8920d839f2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center bottom', backgroundSize: 'cover' }}>
                        {/* The image is loaded from unspash as a placeholder for doctors */}
                    </div>
                </div>
            </section>

            {/* Services Categories */}
            <section className="services-section container">
                <div className="section-header">
                    <h2>Our <span className="text-cyan">Main Services</span><br />Categories</h2>
                </div>

                <div className="categories-grid">
                    <div className="category-card">
                        <div className="category-icon-wrapper">
                            <span className="category-icon">💬</span>
                        </div>
                        <h3>Interact with the patient</h3>
                        <p>Interact with the patient and get the proper diagnosis. You can send the medicle reports using the system</p>
                    </div>

                    <div className="category-card cyan-card">
                        <div className="category-icon-wrapper" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <span className="category-icon" style={{ filter: 'contrast(0)' }}>🧬</span>
                        </div>
                        <h3>X-Ray Analysis</h3>
                        <p>Just upload an image of the XRAY. Heavily trained Machine Learning model will classify the XRAY and provide you with the proper diagnosis. </p>
                    </div>

                    <div className="category-card">
                        <div className="category-icon-wrapper">
                            <span className="category-icon">🏥</span>
                        </div>
                        <h3>Clinical Integration</h3>
                        <p>Get priority APIs in hospitals with Wedakam. Which allows you to integrate your local hospital's PACS practically and save time.</p>
                    </div>
                </div>
            </section>

            {/* Special Services */}
            <section className="special-section container">
                <div className="special-visual">
                    <div className="special-arch arch-shape" style={{ background: 'url(https://plus.unsplash.com/premium_photo-1680608979589-e9349ed066d5?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center bottom 40%' }}>
                        {/* Placeholder doctor research image */}
                    </div>
                </div>

                <div className="special-content">
                    <h2>Our <span className="text-cyan">Special Services</span></h2>
                    <p>
                        In times like today, diagnostic accuracy is very important, especially since the number of challenging cases is increasing day by day, so we are ready to help you with our advanced models.
                    </p>

                    <div className="special-grid">
                        <div className="special-item">
                            <div className="special-item-icon">0/1</div>
                            <h4>Binary classification</h4>
                            <p>Upload an image of your patient's XRAY. There is a binary classification model with high accuracy to detect whether there is a disease or not</p>
                        </div>
                        <div className="special-item">
                            <div className="special-item-icon">🫁</div>
                            <h4>Multi-class classification</h4>
                            <p>Automated detection of 12 diseases including pneumonia, pneumothorax, and cardiomegaly on standard PA films.</p>
                        </div>
                        <div className="special-item">
                            <div className="special-item-icon">🦴</div>
                            <h4>Fracture Detection</h4>
                            <p>Pinpoint hairline fractures and skeletal abnormalities with high precision algorithms.</p>
                        </div>
                        <div className="special-item">
                            <div className="special-item-icon">📊</div>
                            <h4>DICOM Viewer</h4>
                            <p>Integrated Web viewer for immediate manipulation and assessment of medical imaging data.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section className="doctors-section container">
                <div className="doctors-header">
                    <p className="pre-title">User Reviews</p>
                    <h2><span className="text-cyan">What doctors</span> Say about us</h2>
                    <p className="subtitle">Real-world feedback from doctors who actively use a machine-learning-powered web application in their clinical practice.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>
                ) : reviews.length > 0 ? (
                    <div className="doctors-layout">
                        <div className="doctor-info-card">
                            <h4>{currentReview.doctor.qualification}</h4>
                            <h3>Dr. {currentReview.doctor.first_name}<br />{currentReview.doctor.last_name}</h3>
                            <div className="home-review-stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star 
                                        key={s} 
                                        size={16} 
                                        fill={s <= currentReview.rating ? "#fff" : "none"} 
                                        color={s <= currentReview.rating ? "#fff" : "rgba(255,255,255,0.4)"} 
                                    />
                                ))}
                            </div>
                            <p className="home-review-text">"{currentReview.review_text}"</p>
                            <Link to="/reviews" style={{ color: 'white', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Read More <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="doctor-image-container arch-shape" style={{ position: 'relative' }}>
                            <div className="carousel-nav-btns">
                                <button className="nav-btn prev" onClick={prevReview}><ChevronLeft size={20} /></button>
                                <button className="nav-btn next" onClick={nextReview}><ChevronRight size={20} /></button>
                            </div>
                            <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentReview.doctor.first_name}`} 
                                alt="Doctor" 
                                style={{ filter: 'none', background: '#e2e8f0' }} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="doctors-layout">
                        <div className="doctor-info-card">
                            <h4>Cardiologist</h4>
                            <h3>Dr. James<br />Wellington</h3>
                            <a href="#readmore">Read More &rarr;</a>
                        </div>

                        <div className="doctor-image-container arch-shape" style={{ position: 'relative' }}>
                            <div className="carousel-nav">&lt;</div>
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80" alt="Doctor" style={{ filter: 'none' }} />
                        </div>
                    </div>
                )}

                <div className="doctors-footer-action">
                    <Link to="/reviews" className="pill-btn btn-cyan" style={{ textDecoration: 'none', marginLeft: '0' }}>View All Experts</Link>
                    <div className="carousel-dots" style={{ display: 'inline-flex', float: 'right', marginTop: '1rem' }}>
                        {reviews.length > 0 ? (
                            reviews.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`dot ${currentIndex === idx ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(idx)}
                                ></span>
                            ))
                        ) : (
                            <>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot active"></span>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
