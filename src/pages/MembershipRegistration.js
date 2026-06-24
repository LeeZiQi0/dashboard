import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient'; // 1. Import Supabase client
import './Pages.css';

const MembershipRegistration = ({ membershipCount }) => { // 2. Accept prop
    const navigate = useNavigate();
    const [selectedTier, setSelectedTier] = useState('Individual');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    const tiers = [
        { name: 'Student (RM 20)', value: 'Student' },
        { name: 'Individual (RM 50)', value: 'Individual' },
        { name: 'Corporate', value: 'Corporate' }
    ];

    // 3. Create the submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from('members')
            .insert([{
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                tier: selectedTier
            }]);

        if (error) {
            console.error("Registration failed:", error.message);
            alert("Error joining membership. Please try again.");
        } else {
            alert(`Welcome to BWM, ${formData.name}!`);
            navigate('/');
        }
    };

    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="form-card-centered">
                <img
                    src="https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=1000"
                    className="form-hero"
                    alt="Membership"
                />

                <h2 className="form-header-text">Become a BWM Member</h2>

                {/* 4. Add onSubmit handler */}
                <form className="stacked-form" onSubmit={handleSubmit}>
                    <div className="input-row">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            required 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="input-row">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="email@example.com" 
                            required 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="input-row">
                        <label>Phone Number</label>
                        <input 
                            type="text" 
                            placeholder="+60..." 
                            required 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="input-row tier-selector-container">
                        <label>Membership Tier</label>
                        <div className="tier-options">
                            {tiers.map((tier) => (
                                <button
                                    key={tier.value}
                                    type="button"
                                    className={`tier-btn ${selectedTier === tier.value ? 'active' : ''}`}
                                    onClick={() => setSelectedTier(tier.value)}
                                >
                                    {tier.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-form-submit">Confirm Registration</button>
                </form>
            </div>
        </div>
    );
};

export default MembershipRegistration;