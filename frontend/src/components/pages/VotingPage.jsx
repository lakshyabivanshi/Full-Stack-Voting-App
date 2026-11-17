// client/src/components/pages/VotingPage.jsx
import { useState, useEffect } from 'react';
import { apiRequest } from '../common/api';

export default function VotingPage({ onLogout }) {
    const [candidates, set_candidates] = useState([]);
    const [vote_counts, set_vote_counts] = useState([]);
    const [loading, set_loading] = useState(true);

    const fetch_voting_data = async () => {
        try {
            const candidates_res = await apiRequest('/candidate', 'GET');
            const counts_res = await apiRequest('/candidate/vote/count', 'GET');

            set_candidates(candidates_res);
            set_vote_counts(counts_res);
            set_loading(false);
        } catch (err) {
            console.error(err);
            set_loading(false);
        }
    };

    useEffect(() => {
        fetch_voting_data();
    }, []);

    const handle_vote = async (candidate_id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await apiRequest(`/candidate/vote/${candidate_id}`, 'POST', null, token);
            alert(res.message);
            fetch_voting_data();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading voting dashboard...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Online Voting Dashboard</h2>
                <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2563eb', marginBottom: '15px' }}>Candidates</h3>
                    {candidates.map((cand) => (
                        <div key={cand._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '10px' }}>
                            <div>
                                <p style={{ fontWeight: 'bold', margin: '0' }}>{cand.name}</p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Party: {cand.party}</p>
                            </div>
                            <button
                                onClick={() => handle_vote(cand._id)}
                                style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                                Vote
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#9333ea', marginBottom: '15px' }}>Live Vote Count</h3>
                    {vote_counts.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '500' }}>{item.party}</span>
                            <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                                {item.count} Votes
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}