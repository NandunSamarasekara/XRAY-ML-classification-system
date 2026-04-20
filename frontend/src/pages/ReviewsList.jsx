import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, MessageSquare } from 'lucide-react';
import './ReviewsList.css';

const ReviewsList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/reviews/all');
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'binary_model': return 'Binary Model';
            case 'multiclass_model': return 'Multiclass Model';
            case 'general_system': return 'General System';
            default: return type;
        }
    };

    return (
        <div className="reviews-page">
            <header className="reviews-header container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
                <h1>What <span className="text-cyan">Doctors</span> are saying</h1>
                <p className="subtitle">Explore all feedback from our medical community</p>
            </header>

            <main className="container reviews-container">
                {loading ? (
                    <div className="loading-state">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state">No reviews yet.</div>
                ) : (
                    <div className="reviews-grid">
                        {reviews.map((review) => (
                            <div key={review.id} className="public-review-card">
                                <div className="review-card-header">
                                    <div className="doctor-avatar">
                                        {review.doctor.first_name.charAt(0)}
                                    </div>
                                    <div className="doctor-meta">
                                        <h3>Dr. {review.doctor.first_name} {review.doctor.last_name}</h3>
                                        <p>{review.doctor.qualification}</p>
                                    </div>
                                </div>
                                <div className="review-type-badge">
                                    {getTypeLabel(review.review_type)}
                                </div>
                                <div className="review-stars">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star 
                                            key={s} 
                                            size={16} 
                                            fill={s <= review.rating ? "#22d3ee" : "none"}
                                            color={s <= review.rating ? "#22d3ee" : "#cbd5e1"}
                                        />
                                    ))}
                                </div>
                                <p className="review-content">
                                    <MessageSquare size={14} className="quote-icon" />
                                    {review.review_text}
                                </p>
                                <div className="review-date">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReviewsList;
