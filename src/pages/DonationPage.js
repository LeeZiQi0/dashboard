import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Heart, Landmark, Wallet } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import './Pages.css';

const DonationPage = ({ financialData }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [donorInfo, setDonorInfo] = useState({ name: '', email: '', message: '' });
    const [paymentMethod, setPaymentMethod] = useState('card');

    const presets = [10, 50, 100, 500];

    const handleDonate = async (e) => {
        e.preventDefault();
        const donationValue = parseFloat(amount);

        if (donationValue > 0) {
            const { error } = await supabase
                .from('donations')
                .insert([{
                    amount: donationValue,
                    name: donorInfo.name,
                    email: donorInfo.email,
                    message: donorInfo.message,
                    payment_method: paymentMethod
                }]);

            if (error) {
                console.error("Donation failed:", error.message);
                alert("There was an error processing your donation. Please try again.");
            } else {
                alert(`Thank you for your RM ${donationValue} donation, ${donorInfo.name}!`);
                navigate('/');
            }
        }
    };

    return (
        <div className="donation-page-container">
            <header className="donation-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <ChevronLeft size={24} /> Back to Dashboard
                </button>
                <div className="donation-logo">
                    <Heart size={28} fill="#f59e0b" color="#f59e0b" />
                    <span>Support BWM</span>
                </div>
            </header>

            <main className="donation-content">
                <section className="donation-card">
                    <div className="intro-text">
                        <h2>Preserve Our Heritage</h2>
                        <p>Your contribution directly supports the conservation of Malaysia's cultural landscape.</p>
                    </div>

                    <form onSubmit={handleDonate}>
                        <div className="form-group">
                            <label className="section-label">Select Amount (RM)</label>
                            <div className="preset-grid">
                                {presets.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`preset-item ${amount === val.toString() ? 'selected' : ''}`}
                                        onClick={() => setAmount(val.toString())}
                                    >
                                        RM {val}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                className="custom-amount-input"
                                placeholder="Or enter custom amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="section-label">Payment Method</label>
                            <div className="payment-grid">
                                <div className={`pay-method ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                                    <CreditCard size={20} /> Card
                                </div>
                                <div className={`pay-method ${paymentMethod === 'fpx' ? 'active' : ''}`} onClick={() => setPaymentMethod('fpx')}>
                                    <Landmark size={20} /> FPX
                                </div>
                                <div className={`pay-method ${paymentMethod === 'ewallet' ? 'active' : ''}`} onClick={() => setPaymentMethod('ewallet')}>
                                    <Wallet size={20} /> E-Wallet
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="section-label">Donor Information</label>
                            <div className="input-stack">
                                <input placeholder="Full Name" required onChange={e => setDonorInfo({...donorInfo, name: e.target.value})} />
                                <input type="email" placeholder="Email Address" required onChange={e => setDonorInfo({...donorInfo, email: e.target.value})} />
                                <textarea placeholder="Message (Optional)" rows="3" onChange={e => setDonorInfo({...donorInfo, message: e.target.value})} />
                            </div>
                        </div>

                        <button type="submit" className="submit-donation-btn">Complete RM {amount || '0'} Donation</button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default DonationPage;