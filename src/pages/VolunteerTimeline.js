import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import './Pages.css';

const VolunteerTimeline = ({ events }) => {
    const navigate = useNavigate();
    return (
        <div className="page-wrapper-cream">
            <button className="btn-back-pill" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="archive-heading">Volunteer Impact Timeline</h1>
            <div className="search-container">
                <Search size={18} className="search-icon"/>
                <input type="text" placeholder="Search" className="search-input"/>
            </div>
            <table className="history-data-table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Group</th>
                    <th>Impact Summary</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event) => (
                    <tr key={event.id}>
                        <td>{event.date}</td>
                        <td>{event.title}</td>
                        {/* Updated from 'group' to 'group_name' */}
                        <td>{event.group_name}</td>
                        <td>{event.impact}</td>
                        <td>
                            <button className="btn-view-small" onClick={() => navigate(`/volunteer-detail/${event.id}`)}>
                                View Details
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VolunteerTimeline;