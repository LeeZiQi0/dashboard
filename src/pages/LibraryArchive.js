import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import './Pages.css';

const LibraryArchive = ({ items }) => {
    const navigate = useNavigate();
    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/')}><ArrowLeft size={16} /> Back to Dashboard</button>
            <h1 className="archive-heading">Library Acquisitions Archive</h1>
            <div className="search-container">
                <Search size={18} className="search-icon"/><input type="text" placeholder="Search archive" className="search-input"/>
            </div>
            <table className="history-data-table">
                <thead>
                    <tr><th>Date</th><th>Title</th><th>Donor</th><th>Category</th><th>Action</th></tr>
                </thead>
                <tbody>
                {items.map((item) => (
                    <tr key={item.id}>
                        <td>{item.date}</td><td>{item.title}</td><td>{item.donor}</td><td>{item.category}</td>
                        <td><button className="btn-view-small" onClick={() => navigate(`/library-detail/${item.id}`)}>View Details</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default LibraryArchive;