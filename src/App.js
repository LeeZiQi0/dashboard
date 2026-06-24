// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Components & Pages
import PublicDashboard from './components/PublicDashboard';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './pages/AdminLogin'; // New Import
import DonationPage from './pages/DonationPage';
import EventRegistration from './pages/EventRegistration';
import LibraryArchive from './pages/LibraryArchive';
import LibraryItemDetail from './pages/LibraryItemDetail';
import MembershipRegistration from './pages/MembershipRegistration';
import VolunteerTimeline from './pages/VolunteerTimeline';
import VolunteerEventDetail from './pages/VolunteerEventDetail';

function App() {
    const [financialData, setFinancialData] = useState({ current: 0, target: 0 });
    const [membershipCount, setMembershipCount] = useState(0);
    const [campaigns, setCampaigns] = useState([]);
    const [volunteerEvents, setVolunteerEvents] = useState([]);
    const [libraryItems, setLibraryItems] = useState([]);
    
    // Auth State: Checks localStorage to persist login on refresh
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuth');
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: stats } = await supabase.from('site_stats').select('*').eq('id', 1).single();
            if (stats) {
                setFinancialData({ current: stats.financial_current, target: stats.financial_target });
                setMembershipCount(stats.membership_count);
            }
            const { data: campData } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
            if (campData) setCampaigns(campData);

            const { data: volData } = await supabase.from('volunteer_events').select('*').order('date', { ascending: false });
            if (volData) setVolunteerEvents(volData);

            const { data: libData } = await supabase.from('library_items').select('*').order('date', { ascending: false });
            if (libData) setLibraryItems(libData);
        };

        fetchData();

        // Real-time subscriptions
        const statsChannel = supabase.channel('realtime_stats')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_stats', filter: 'id=eq.1' }, (payload) => {
                setFinancialData({ current: payload.new.financial_current, target: payload.new.financial_target });
                setMembershipCount(payload.new.membership_count);
            }).subscribe();

        const campChannel = supabase.channel('realtime_campaigns')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, (payload) => {
                if (payload.eventType === 'INSERT') setCampaigns(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
                else if (payload.eventType === 'DELETE') setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
            }).subscribe();

        const volChannel = supabase.channel('realtime_volunteers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_events' }, (payload) => {
                if (payload.eventType === 'INSERT') setVolunteerEvents(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setVolunteerEvents(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
                else if (payload.eventType === 'DELETE') setVolunteerEvents(prev => prev.filter(v => v.id !== payload.old.id));
            }).subscribe();

        const libChannel = supabase.channel('realtime_library')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'library_items' }, (payload) => {
                if (payload.eventType === 'INSERT') setLibraryItems(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setLibraryItems(prev => prev.map(i => i.id === payload.new.id ? payload.new : i));
                else if (payload.eventType === 'DELETE') setLibraryItems(prev => prev.filter(i => i.id !== payload.old.id));
            }).subscribe();

        return () => {
            supabase.removeChannel(statsChannel);
            supabase.removeChannel(campChannel);
            supabase.removeChannel(volChannel);
            supabase.removeChannel(libChannel);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PublicDashboard campaigns={campaigns} libraryItems={libraryItems} volunteerEvents={volunteerEvents} membershipCount={membershipCount} financialData={financialData} />} />
                
                {/* Admin Routes with Auth Protection */}
                <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
                <Route 
                    path="/admin" 
                    element={isAuthenticated ? 
                        <AdminPanel 
                            campaigns={campaigns} 
                            libraryItems={libraryItems} 
                            volunteerEvents={volunteerEvents} 
                            financialData={financialData} 
                            membershipCount={membershipCount}
                            onLogout={handleLogout} // Pass logout function
                        /> : 
                        <Navigate to="/admin-login" />
                    } 
                />

                <Route path="/volunteer-timeline" element={<VolunteerTimeline events={volunteerEvents} />} />
                <Route path="/volunteer-detail/:id" element={<VolunteerEventDetail events={volunteerEvents} />} />
                <Route path="/library-archive" element={<LibraryArchive items={libraryItems} />} />
                <Route path="/library-detail/:id" element={<LibraryItemDetail items={libraryItems} />} />
                <Route path="/donate" element={<DonationPage financialData={financialData} />} />
                <Route path="/membership-registration" element={<MembershipRegistration membershipCount={membershipCount} />} />
                <Route path="/event-registration/:id" element={<EventRegistration />} />
            </Routes>
        </Router>
    );
}

export default App;