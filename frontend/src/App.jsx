// client/src/App.jsx
import { useState, useEffect } from 'react';
import Login from './components/pages/Login';
import VotingPage from './components/pages/VotingPage';
import AdminPage from './components/pages/AdminPage';
import { apiRequest } from './components/common/api';

export default function App() {
  const [is_authenticated, set_is_authenticated] = useState(!!localStorage.getItem('token'));
  const [current_page, set_current_page] = useState('voting'); // 'voting' ya 'admin'
  const [user_role, set_user_role] = useState('');
  const [loading, set_loading] = useState(true);

  // when app open, first of all check user role
  useEffect(() => {
    const fetch_user_profile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        set_loading(false);
        return;
      }
      try {
        const res = await apiRequest('/user/profile', 'GET', null, token);

        if (res && res.role) {
          set_user_role(res.role.toLowerCase());
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        set_is_authenticated(false);
      }
      set_loading(false);
    };

    if (is_authenticated) {
      fetch_user_profile();
    } else {
      set_loading(false);
    }
  }, [is_authenticated]);

  const handle_logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    set_user_role('');
    set_is_authenticated(false);
    set_current_page('voting');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (!is_authenticated) {
    return <Login onLoginSuccess={() => set_is_authenticated(true)} />;
  }

  return (
    <div>
      {/*Only show admin portal button when the role is admin*/}
      {user_role === 'admin' && (
        <div style={{ textAlign: 'right', padding: '10px 20px', backgroundColor: '#e5e7eb' }}>
          {current_page === 'voting' ? (
            <button onClick={() => set_current_page('admin')} style={{ padding: '6px 12px', backgroundColor: '#7e22ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Go to Admin Panel
            </button>
          ) : (
            <button onClick={() => set_current_page('voting')} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Go to Voting Dashboard
            </button>
          )}
        </div>
      )}

      {/* If user is admin and he if he is in admin page then AdminPage will show, otherwise show only voting page */}
      {current_page === 'admin' && user_role === 'admin' ? (
        <AdminPage onBackToVoting={() => set_current_page('voting')} />
      ) : (
        <VotingPage onLogout={handle_logout} />
      )}
    </div>
  );
}