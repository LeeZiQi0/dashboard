// src/pages/LibraryItemDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, ChevronRight, ChevronLeft, ImageIcon } from 'lucide-react';
import './Pages.css';

const LibraryItemDetail = ({ items }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = items.find(i => i.id === parseInt(id));
    const [imgIndex, setImgIndex] = useState(0);

    if (!item) return <div className="page-wrapper-cream">Item not found.</div>;

    const hasImages = item.images && item.images.length > 0;

    const handleNext = () => {
        setImgIndex((prev) => (prev + 1) % item.images.length);
    };

    const handlePrev = () => {
        setImgIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/library-archive')}>
                <ArrowLeft size={16} /> Back to Archive
            </button>
            <div className="detail-card">
                <div className="detail-header-teal">
                    <BookOpen size={40} color="white" />
                    <h1>{item.title}</h1>
                </div>
                <div className="detail-body">
                    {/* Consistent Resolution Image Slider */}
                    {hasImages && (
                        <div className="slider-container">
                            <div className="slider-main">
                                <img 
                                    src={item.images[imgIndex]} 
                                    alt="Library item" 
                                    className="slider-image-frame" 
                                />
                                {item.images.length > 1 && (
                                    <>
                                        <button className="slider-btn prev" onClick={handlePrev}><ChevronLeft /></button>
                                        <button className="slider-btn next" onClick={handleNext}><ChevronRight /> Next</button>
                                        <div className="slider-counter">{imgIndex + 1} / {item.images.length}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <section className="detail-section">
                        <h3><User size={18} /> Donor</h3>
                        <p className="group-highlight">{item.donor}</p>
                    </section>
                    <section className="detail-section">
                        <h3>Category</h3>
                        <p>{item.category}</p>
                    </section>
                    <section className="detail-section">
                        <h3>Description</h3>
                        <p className="main-description">{item.description}</p>
                    </section>
                    <div className="impact-footer">
                        <div className="impact-stat"><span className="label">Date: </span><span className="value">{item.date}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryItemDetail;