// src/pages/VolunteerEventDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import './Pages.css';

const VolunteerEventDetail = ({ events }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = events.find(e => e.id === parseInt(id));
    const [imgIndex, setImgIndex] = useState(0);

    if (!event) return <div className="page-wrapper-cream">Event not found.</div>;

    const hasImages = event.images && event.images.length > 0;

    const handleNext = () => {
        setImgIndex((prev) => (prev + 1) % event.images.length);
    };

    const handlePrev = () => {
        setImgIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    };

    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/volunteer-timeline')}>
                <ArrowLeft size={16} /> Back to Timeline
            </button>

            <div className="detail-card">
                <div className="detail-header-teal">
                    <Heart size={40} color="white" />
                    <h1>{event.title}</h1>
                </div>

                <div className="detail-body">
                    {/* Consistent Resolution Image Slider */}
                    {hasImages && (
                        <div className="slider-container">
                            <div className="slider-main">
                                <img 
                                    src={event.images[imgIndex]} 
                                    alt="Impact" 
                                    className="slider-image-frame" 
                                />
                                {event.images.length > 1 && (
                                    <>
                                        <button className="slider-btn prev" onClick={handlePrev}><ChevronLeft /></button>
                                        <button className="slider-btn next" onClick={handleNext}><ChevronRight /> Next</button>
                                        <div className="slider-counter">{imgIndex + 1} / {event.images.length}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <section className="detail-section">
                        <h3><Users size={18} /> Organizing Group</h3>
                        <p className="group-highlight">{event.group_name}</p>
                    </section>

                    <section className="detail-section">
                        <h3>Event Narrative</h3>
                        <p className="main-description">{event.description}</p>
                    </section>

                    <div className="impact-footer">
                        <div className="impact-stat">
                            <span className="label">Total Impact: </span>
                            <span className="value">{event.impact}</span>
                        </div>
                        <div className="impact-stat">
                            <span className="label">Date: </span>
                            <span className="value">{event.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerEventDetail;