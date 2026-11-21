import { useState, useEffect } from 'react';
import { apiRequest } from '../common/api';

export default function AdminPage({ onBackToVoting }) {
    const [candidates, set_candidates] = useState([]);
    const [name, set_name] = useState('');
    const [party, set_party] = useState('');
    const [age, set_age] = useState('');

    // Loading all the cendidate's list here
    const fetch_candidates = async () => {
        try {
            const res = await apiRequest('/candidate', 'GET');
            set_candidates(res);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetch_candidates();
    }, []);

    // function for adding new candidate
    const handle_add_candidate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await apiRequest('/candidate', 'POST', { name, party, age: Number(age) }, token);
            alert('Candidate added successfully!');
            set_name('');
            set_party('');
            set_age('');
            fetch_candidates();
        } catch (err) {
            alert(err.message);
        }
    };

    // function for candidate removal (Admin Remove Access)
    const handle_remove_candidate = async (candidate_id) => {
        if (!window.confirm('Are you sure you want to remove this candidate?')) return;

        const token = localStorage.getItem('token');
        try {
            await apiRequest(`/candidate/${candidate_id}`, 'DELETE', null, token);
            alert('Candidate removed successfully!');
            fetch_candidates(); 
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '16px' }}>
            {/* Header section */}
            <div style={{ 
                maxWidth: '800px', 
                margin: '0 auto 24px auto', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px',
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'white', 
                padding: '15px 20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
            }}>
                <h2 style={{ margin: '0', color: '#7e22ce', fontSize: '20px' }}>Admin Panel</h2>
                <button 
                    onClick={onBackToVoting} 
                    style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Back to Voting Dashboard
                </button>
            </div>
            <div style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
            }}>
                {/*Candidate form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#1f2937' }}>Add New Candidate</h3>
                    <form onSubmit={handle_add_candidate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Candidate Name</label>
                            <input type="text" value={name} onChange={(e) => set_name(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Party</label>
                            <input type="text" value={party} onChange={(e) => set_party(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Age</label>
                            <input type="number" value={age} onChange={(e) => set_age(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                            Add Candidate
                        </button>
                    </form>
                </div>

                {/*Manage candidates list with remove option */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#1f2937' }}>Manage Candidates</h3>
                    {candidates.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No candidates found.</p>
                    ) : (
                        candidates.map((cand) => (
                            <div key={cand._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{cand.name}</p>
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Party: {cand.party}</p>
                                </div>
                                {/*remove button */}
                                <button
                                    onClick={() => handle_remove_candidate(cand._id)}
                                    style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>
                                    Remove Candidate
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}