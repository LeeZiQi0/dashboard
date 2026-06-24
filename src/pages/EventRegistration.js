import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Pages.css';

const EventRegistration = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL /event-registration/:id

    // State for fetching campaign details
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State for form inputs
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        attendees: 1
    });

    // 1. Fetch the specific campaign details on mount
    useEffect(() => {
        const fetchCampaign = async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setCampaign(data);
            } else if (error) {
                console.error("Error fetching campaign:", error.message);
            }
            setLoading(false);
        };

        fetchCampaign();
    }, [id]);

    // 2. Handle Form Submission
    const handleRegister = async (e) => {
        e.preventDefault();

        if (!campaign) return;

        // Calculate new seat count
        const newSlotsFilled = (campaign.slotsfilled || 0) + parseInt(formData.attendees);

        // Update Supabase
        const { error } = await supabase
            .from('campaigns')
            .update({ slotsfilled: newSlotsFilled })
            .eq('id', id);

        if (error) {
            alert("Registration failed: " + error.message);
        } else {
            alert(`Success! Registered ${formData.attendees} seat(s) for ${campaign.name}.`);
            navigate('/'); // Redirect back to dashboard to see the real-time update
        }
    };

    if (loading) return <div className="page-wrapper-cream"><Loader2 className="animate-spin" /> Loading...</div>;
    if (!campaign) return <div className="page-wrapper-cream">Campaign not found.</div>;

    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>
            
            <div className="form-card-centered">
                {/* Dynamically use campaign image and name */}
                <img src={campaign.image} className="form-hero" alt={campaign.name}/>
                <h2 className="form-header-text">{campaign.name}</h2>
                
                <div className="form-event-details">
                    <p><Calendar size={18}/> {new Date(campaign.created_at).toLocaleDateString()} onwards</p>
                    <p><MapPin size={18}/> Heritage Site - Malaysia</p>
                    <p><DollarSign size={18}/> Status: {campaign.status}</p>
                    <p><strong>Current Seats: {campaign.slotsfilled} / {campaign.targetgoal}</strong></p>
                </div>

                <form className="stacked-form" onSubmit={handleRegister}>
                    <div className="input-row">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="input-row">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="input-row">
                        <label>Phone Number</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="input-row">
                        <label>Number of people</label>
                        <input 
                            type="number" 
                            min="1" 
                            max={campaign.targetgoal - campaign.slotsfilled}
                            required 
                            value={formData.attendees}
                            onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="btn-form-submit">Confirm Registration</button>
                </form>
            </div>
        </div>
    );
};

export default EventRegistration;