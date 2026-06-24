// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    X, ClipboardList, BookCheck, DollarSign, Users,
    LogOut, Plus, Trash2, Upload, ImageIcon
} from 'lucide-react';
import './Admin.css';

const AdminPanel = ({ campaigns, libraryItems, volunteerEvents, financialData, membershipCount, onLogout }) => {
    const [currentView, setCurrentView] = useState('campaigns');
    const [showModal, setShowModal] = useState(false);
    const [showVolModal, setShowVolModal] = useState(false);
    const [showLibModal, setShowLibModal] = useState(false);
    
    // Upload/Processing State
    const [uploading, setUploading] = useState(false);

    // Campaign State (Single Image)
    const [newCampaign, setNewCampaign] = useState({ name: '', targetGoal: 0, status: 'Active' });
    const [imageFile, setImageFile] = useState(null);

    // Volunteer State (Multiple Images)
    const [newVolunteer, setNewVolunteer] = useState({ title: '', group_name: '', impact: '', date: '', description: '' });
    const [volImageFiles, setVolImageFiles] = useState([]);

    // Library State (Multiple Images)
    const [newLibraryItem, setNewLibraryItem] = useState({ title: '', donor: '', category: '', date: '', description: '' });
    const [libImageFiles, setLibImageFiles] = useState([]);

    const [localMembership, setLocalMembership] = useState(membershipCount || 0);
    const [localFinancial, setLocalFinancial] = useState(financialData || { current: 0, target: 0 });

    useEffect(() => {
        if (membershipCount !== undefined) setLocalMembership(membershipCount);
        if (financialData) setLocalFinancial(financialData);
    }, [membershipCount, financialData]);

    // Helper: Upload Multiple Files
    const uploadMultipleFiles = async (files, bucketName, folderName) => {
        const publicUrls = [];
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${folderName}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);
            
            publicUrls.push(data.publicUrl);
        }
        return publicUrls;
    };

    const handleDeleteCampaign = async (id) => {
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) alert(error.message);
        }
    };

    const handleAddCampaign = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let publicUrl = '';
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `campaigns/${fileName}`;
                await supabase.storage.from('campaign-images').upload(filePath, imageFile);
                const { data } = supabase.storage.from('campaign-images').getPublicUrl(filePath);
                publicUrl = data.publicUrl;
            }
            const { error } = await supabase.from('campaigns').insert([{
                name: newCampaign.name,
                targetgoal: parseInt(newCampaign.targetGoal),
                image: publicUrl,
                status: 'Active',
                slotsfilled: 0
            }]);
            if (error) throw error;
            setShowModal(false);
            setNewCampaign({ name: '', targetGoal: 0, status: 'Active' });
            setImageFile(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleAddVolunteer = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const imageUrls = await uploadMultipleFiles(volImageFiles, 'volunteer-images', 'volunteers');
            const { error } = await supabase.from('volunteer_events').insert([{
                ...newVolunteer,
                images: imageUrls
            }]);
            if (error) throw error;
            setShowVolModal(false);
            setNewVolunteer({ title: '', group_name: '', impact: '', date: '', description: '' });
            setVolImageFiles([]);
        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleAddLibraryItem = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const imageUrls = await uploadMultipleFiles(libImageFiles, 'library-images', 'library');
            const { error } = await supabase.from('library_items').insert([{
                ...newLibraryItem,
                images: imageUrls
            }]);
            if (error) throw error;
            setShowLibModal(false);
            setNewLibraryItem({ title: '', donor: '', category: '', date: '', description: '' });
            setLibImageFiles([]);
        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLibrary = async (id) => {
        if (window.confirm("Delete this library item?")) {
            const { error } = await supabase.from('library_items').delete().eq('id', id);
            if (error) alert(error.message);
        }
    };

    const updateFinancials = async (updates) => {
        setLocalFinancial(prev => ({ ...prev, ...updates }));
        await supabase.from('site_stats').update(updates).eq('id', 1);
    };

    const updateMembership = async (val) => {
        const newValue = val === '' ? 0 : parseInt(val);
        setLocalMembership(val);
        await supabase.from('site_stats').update({ membership_count: newValue }).eq('id', 1);
    };

    const handleDeleteVolunteer = async (id) => {
    if (!window.confirm("Delete this volunteer impact log?")) return;

    const { error } = await supabase
        .from('volunteer_events')   
        .delete()
        .eq('id', id);

    if (error) {
        alert(error.message);
        console.error(error);
    }
    };

    const renderView = () => {
        switch(currentView) {
            case 'campaigns':
                return (
                    <div className="view-container">
                        <button className="btn-add-main" onClick={() => setShowModal(true)}><Plus size={18} /> New Campaign</button>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead><tr><th>Image</th><th>Name</th><th>Participation</th><th>Action</th></tr></thead>
                                <tbody>
                                {campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td><img src={c.image} alt="" className="table-thumb" /></td>
                                        <td><strong>{c.name}</strong></td>
                                        <td>{c.slotsfilled} / {c.targetgoal}</td>
                                        <td><Trash2 size={18} className="pointer" color="#ef4444" onClick={() => handleDeleteCampaign(c.id)} /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'library':
                return (
                    <div className="view-container">
                        <div className="header-action-row">
                            <h2 className="section-title">Library Acquisitions</h2>
                            <button className="btn-manual" onClick={() => setShowLibModal(true)}>+ Add New Item</button>
                        </div>
                        <div className="table-wrapper transparent">
                            <table className="admin-table styled">
                                <thead><tr><th>Date</th><th>Title</th><th>Donor</th><th>Category</th><th>Action</th></tr></thead>
                                <tbody>
                                    {libraryItems.map((item) => (
                                        <tr key={item.id} className="teal-row">
                                            <td>{item.date}</td><td>{item.title}</td><td>{item.donor}</td><td>{item.category}</td>
                                            <td><Trash2 size={18} className="pointer" color="#ef4444" onClick={() => handleDeleteLibrary(item.id)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'volunteer':
                return (
                    <div className="view-container">
                        <div className="header-action-row">
                            <h2 className="section-title">Volunteer Impact Logs</h2>
                            <button className="btn-manual" onClick={() => setShowVolModal(true)}>+ Log New Impact</button>
                        </div>
                        <div className="table-wrapper transparent">
                            <table className="admin-table styled">
                                <thead><tr><th>Date</th><th>Group</th><th>Title</th><th>Action</th></tr></thead>
                                <tbody>
                                    {volunteerEvents.map((ev) => (
                                        <tr key={ev.id} className="teal-row">
                                            <td>{ev.date}</td><td>{ev.group_name}</td><td>{ev.title}</td>
                                            <td><Trash2 size={18} className="pointer" color="#ef4444" onClick={() => handleDeleteVolunteer(ev.id)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'financials':
                return (
                    <div className="view-container">
                        <div className="admin-grid-two">
                            <div className="admin-card-control">
                                <div className="card-badge finance">Finance</div>
                                <div className="input-group"><label>Goal (RM)</label><input type="number" value={localFinancial.target} onChange={(e) => updateFinancials({ financial_target: parseInt(e.target.value) })} /></div>
                                <div className="input-group"><label>Current (RM)</label><input type="number" value={localFinancial.current} onChange={(e) => updateFinancials({ financial_current: parseInt(e.target.value) })} /></div>
                            </div>
                            <div className="admin-card-control">
                                <div className="card-badge member">Membership</div>
                                <div className="input-group"><label>Current Active</label><input type="number" value={localMembership} onChange={(e) => updateMembership(e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">BWM ADMIN</div>
                <nav className="sidebar-nav">
                    <button onClick={() => setCurrentView('campaigns')} className={`nav-item ${currentView === 'campaigns' ? 'active' : ''}`}><ClipboardList size={18} /> Campaigns</button>
                    <button onClick={() => setCurrentView('library')} className={`nav-item ${currentView === 'library' ? 'active' : ''}`}><BookCheck size={18} /> Library</button>
                    <button onClick={() => setCurrentView('volunteer')} className={`nav-item ${currentView === 'volunteer' ? 'active' : ''}`}><Users size={18} /> Volunteers</button>
                    <button onClick={() => setCurrentView('financials')} className={`nav-item ${currentView === 'financials' ? 'active' : ''}`}><DollarSign size={18} /> Finance</button>
                </nav>
                <button onClick={onLogout} className="exit-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <LogOut size={18} /> Logout
                </button>
            </aside>
            <main className="admin-body">
                <header className="body-header"><h1>{currentView.toUpperCase()}</h1></header>
                {renderView()}
            </main>

            {/* Campaign Modal */}
            {showModal && (
                <div className="modal-bg">
                    <div className="modal-box">
                        <div className="modal-head"><h2>New Campaign</h2><X onClick={() => setShowModal(false)} className="pointer" /></div>
                        <form onSubmit={handleAddCampaign} className="modal-form">
                            <input placeholder="Name" required value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />
                            <input placeholder="Target Seats" type="number" required value={newCampaign.targetGoal} onChange={e => setNewCampaign({...newCampaign, targetGoal: e.target.value})} />
                            <div className="input-group">
                                <label className="upload-label">
                                    <Upload size={18} /> {imageFile ? imageFile.name : "Upload Images"}
                                    <input type="file" accept="image/*" required style={{ display: 'none' }} onChange={e => setImageFile(e.target.files[0])} />
                                </label>
                            </div>
                            <button type="submit" className="btn-add-main" disabled={uploading}>{uploading ? "Uploading..." : "Save Campaign"}</button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Volunteer Modal */}
            {showVolModal && (
                <div className="modal-bg">
                    <div className="modal-box">
                        <div className="modal-head"><h2>Log Volunteer Impact</h2><X onClick={() => setShowVolModal(false)} className="pointer" /></div>
                        <form onSubmit={handleAddVolunteer} className="modal-form">
                            <input placeholder="Title" required value={newVolunteer.title} onChange={e => setNewVolunteer({...newVolunteer, title: e.target.value})} />
                            <input placeholder="Group" required value={newVolunteer.group_name} onChange={e => setNewVolunteer({...newVolunteer, group_name: e.target.value})} />
                            <input placeholder="Impact" required value={newVolunteer.impact} onChange={e => setNewVolunteer({...newVolunteer, impact: e.target.value})} />
                            <input type="date" required value={newVolunteer.date} onChange={e => setNewVolunteer({...newVolunteer, date: e.target.value})} />
                            <textarea placeholder="Description" required value={newVolunteer.description} onChange={e => setNewVolunteer({...newVolunteer, description: e.target.value})} />
                            <div className="input-group">
                                <label className="upload-label">
                                    <ImageIcon size={18} /> {volImageFiles.length > 0 ? `${volImageFiles.length} selected` : "Upload Images"}
                                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => setVolImageFiles(Array.from(e.target.files))} />
                                </label>
                            </div>
                            <button type="submit" className="btn-add-main" disabled={uploading}>{uploading ? "Uploading..." : "Save Impact"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Library Modal */}
            {showLibModal && (
                <div className="modal-bg">
                    <div className="modal-box">
                        <div className="modal-head"><h2>Add Library Item</h2><X onClick={() => setShowLibModal(false)} className="pointer" /></div>
                        <form onSubmit={handleAddLibraryItem} className="modal-form">
                            <input placeholder="Title" required value={newLibraryItem.title} onChange={e => setNewLibraryItem({...newLibraryItem, title: e.target.value})} />
                            <input placeholder="Donor Name" required value={newLibraryItem.donor} onChange={e => setNewLibraryItem({...newLibraryItem, donor: e.target.value})} />
                            <input placeholder="Category" required value={newLibraryItem.category} onChange={e => setNewLibraryItem({...newLibraryItem, category: e.target.value})} />
                            <input type="date" required value={newLibraryItem.date} onChange={e => setNewLibraryItem({...newLibraryItem, date: e.target.value})} />
                            <textarea placeholder="Item Description" required value={newLibraryItem.description} onChange={e => setNewLibraryItem({...newLibraryItem, description: e.target.value})} />
                            <div className="input-group">
                                <label className="upload-label">
                                    <ImageIcon size={18} /> {libImageFiles.length > 0 ? `${libImageFiles.length} selected` : "Upload Images"}
                                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => setLibImageFiles(Array.from(e.target.files))} />
                                </label>
                            </div>
                            <button type="submit" className="btn-add-main" disabled={uploading}>{uploading ? "Uploading..." : "Save Item"}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;