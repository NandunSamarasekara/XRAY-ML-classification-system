import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, Trash2, MessageSquare } from 'lucide-react';
import './ReviewForm.css';

const ReviewForm = () => {
    const [reviewType, setReviewType] = useState('general_system');
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [myReviews, setMyReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const fetchMyReviews = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('http://127.0.0.1:8000/reviews/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMyReviews(data);
        } catch (err) {
            console.error('Error fetching my reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const token = localStorage.getItem('access_token');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/reviews/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    review_type: reviewType,
                    rating: rating,
                    review_text: reviewText
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            setSubmitted(true);
            setReviewText('');
            setRating(5);
            fetchMyReviews(); // Refresh list
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://127.0.0.1:8000/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete review');

            // Refresh list
            fetchMyReviews();
        } catch (err) {
            alert(err.message);
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'binary_model': return 'Binary Model';
            case 'multiclass_model': return 'Multiclass Model';
            case 'general_system': return 'General System';
            default: return type;
        }
    };

    if (submitted) {
        return (
            <div className="review-success-card">
                <CheckCircle2 size={64} className="text-cyan mb-4" />
                <h2>Thank You!</h2>
                <p>Your review has been submitted successfully and will help us improve.</p>
                <button className="pill-btn btn-cyan mt-4" onClick={() => setSubmitted(false)}>
                    Submit Another Review
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-card review-form-card">
            <h2 className="card-title mb-4">Share Your Experience</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                    <label className="form-label">What are you reviewing?</label>
                    <div className="review-type-selector">
                        {[
                            { id: 'binary_model', label: 'Binary Model' },
                            { id: 'multiclass_model', label: 'Multiclass Model' },
                            { id: 'general_system', label: 'General System' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                className={`type-btn ${reviewType === type.id ? 'active' : ''}`}
                                onClick={() => setReviewType(type.id)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group mb-4">
                    <label className="form-label">Rating</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="star-btn"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={32}
                                    fill={(hover || rating) >= star ? "#22d3ee" : "none"}
                                    color={(hover || rating) >= star ? "#22d3ee" : "#cbd5e1"}
                                    className="star-icon"
                                />
                            </button>
                        ))}
                        <span className="rating-text">{rating} / 5 Stars</span>
                    </div>
                </div>

                <div className="form-group mb-4">
                    <label className="form-label">Review Details</label>
                    <textarea
                        className="form-textarea"
                        placeholder="Tell us what you think about this feature..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        rows={5}
                    ></textarea>
                </div>

                {error && <p className="error-message mb-3">{error}</p>}

                <button 
                    type="submit" 
                    className="pill-btn btn-cyan submit-btn"
                    disabled={submitting}
                >
                    {submitting ? 'Submitting...' : (
                        <>
                            <Send size={18} /> Submit Review
                        </>
                    )}
                </button>
            </form>

            <div className="my-reviews-section mt-5">
                <h3 className="card-title mb-4">Your Past Reviews</h3>
                {loadingReviews ? (
                    <p>Loading your reviews...</p>
                ) : myReviews.length === 0 ? (
                    <p className="text-muted">You haven't submitted any reviews yet.</p>
                ) : (
                    <div className="my-reviews-list">
                        {myReviews.map((review) => (
                            <div key={review.id} className="my-review-item">
                                <div className="my-review-header">
                                    <span className="review-type-badge">{getTypeLabel(review.review_type)}</span>
                                    <div className="my-review-stars">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star 
                                                key={s} 
                                                size={14} 
                                                fill={s <= review.rating ? "#22d3ee" : "none"} 
                                                color={s <= review.rating ? "#22d3ee" : "#cbd5e1"} 
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        className="delete-review-btn" 
                                        onClick={() => handleDelete(review.id)}
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="my-review-text">
                                    <MessageSquare size={14} className="quote-icon" />
                                    {review.review_text}
                                </p>
                                <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewForm;
