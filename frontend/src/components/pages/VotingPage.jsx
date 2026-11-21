import { useState, useEffect } from 'react';
import { apiRequest } from '../common/api';

export default function VotingPage({ onLogout }) {
    const [candidates, set_candidates] = useState([]);
    const [vote_counts, set_vote_counts] = useState([]);
    const [loading, set_loading] = useState(true);
    const [user_name, set_user_name] = useState('');

    const load_user_name = async () => {
        const stored_name = localStorage.getItem('user_name');
        if (stored_name) {
            set_user_name(stored_name);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            const profile_res = await apiRequest('/user/profile', 'GET', null, token);
            if (profile_res && profile_res.name) {
                set_user_name(profile_res.name);
                localStorage.setItem('user_name', profile_res.name);
            }
        } catch (err) {
            console.error(err);
        }
    };

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
        load_user_name();
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

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading voting dashboard...</div>;
    }

    let greeting_name = 'Voter';
    if (user_name) {
        greeting_name = user_name;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '16px' }}>
            {/* Header Section with Greeting user and logout button */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto 24px auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                background: 'white',
                padding: '16px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1f2937' }}>
                        Hello, {greeting_name} 👋
                    </h2>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                        Welcome to the Online Voting Dashboard
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '8px 14px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        flexShrink: 0
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Voting sections */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Live vote count section */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#9333ea', marginTop: '0', marginBottom: '15px' }}>Live Vote Count</h3>
                    {vote_counts.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
                            <span style={{ fontWeight: '500' }}>{item.party}</span>
                            <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
                                {item.count} Votes
                            </span>
                        </div>
                    ))}
                </div>

                {/* Candidates card */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2563eb', marginTop: '0', marginBottom: '15px' }}>Candidates</h3>
                    {candidates.map((cand) => (
                        <div key={cand._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
                            <div>
                                <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{cand.name}</p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Party: {cand.party}</p>
                            </div>
                            <button
                                onClick={() => handle_vote(cand._id)}
                                style={{ padding: '8px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
                            >
                                Vote
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}