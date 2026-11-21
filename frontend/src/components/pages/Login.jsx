import { useState } from 'react';
import { apiRequest } from '../common/api';

export default function Login({ onLoginSuccess }) {
    const [is_login, set_is_login] = useState(true);
    const [form_data, set_form_data] = useState({
        name: '',
        age: '',
        email: '',
        mobile: '',
        address: '',
        aadharCardNumber: '',
        password: '',
        role: 'voter'
    });
    const [error_msg, set_error_msg] = useState('');

    const handle_input_change = (e) => {
        set_form_data({ ...form_data, [e.target.name]: e.target.value });
    };

    const toggle_mode = () => {
        set_is_login(!is_login);
        set_error_msg('');

    }

    const [is_loading, set_is_loading] = useState(false);

    const handle_submit = async (e) => {
        e.preventDefault();
        set_error_msg('');
        set_is_loading(true);

        try {
            localStorage.removeItem('user_name');

            if (is_login) {
                const res = await apiRequest('/user/login', 'POST', {
                    aadharCardNumber: Number(form_data.aadharCardNumber),
                    password: form_data.password
                });
                localStorage.setItem('token', res.token);

                //name that come from the backend, just save here
                if (res.user && res.user.name) {
                    localStorage.setItem('user_name', res.user.name);
                } else if (res.name) {
                    localStorage.setItem('user_name', res.name);
                }

                alert('Login Successful!');
                onLoginSuccess();
            } else {
                const res = await apiRequest('/user/signup', 'POST', {
                    ...form_data,
                    age: Number(form_data.age),
                    aadharCardNumber: Number(form_data.aadharCardNumber)
                });
                localStorage.setItem('token', res.token);

                //save the name while signup for greeting
                if (res.response && res.response.name) {
                    localStorage.setItem('user_name', res.response.name);
                } else {
                    localStorage.setItem('user_name', form_data.name);
                }

                alert('Signup Successful!');
                onLoginSuccess();
            }
        } catch (error) {
            set_error_msg(error.message);
        } finally {
            set_is_loading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {is_login ? 'Login to Vote' : 'Register / Signup'}
                </h2>

                {error_msg && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error_msg}</div>}

                <form onSubmit={handle_submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {!is_login && (
                        <>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Full Name</label>
                                <input type="text" name="name" value={form_data.name} onChange={handle_input_change} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Age</label>
                                <input type="number" name="age" value={form_data.age} onChange={handle_input_change} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Email (Optional)</label>
                                <input type="email" name="email" value={form_data.email} onChange={handle_input_change} style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Mobile (Optional)</label>
                                <input type="text" name="mobile" value={form_data.mobile} onChange={handle_input_change} style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Address</label>
                                <input type="text" name="address" value={form_data.address} onChange={handle_input_change} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500' }}>Role</label>
                                <select name="role" value={form_data.role} onChange={handle_input_change} style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="voter">Voter</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Aadhar Card Number</label>
                        <input type="number" name="aadharCardNumber" value={form_data.aadharCardNumber} onChange={handle_input_change} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Password</label>
                        <input type="password" name="password" value={form_data.password} onChange={handle_input_change} required style={{ width: '100%', padding: '8px', marginTop: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: is_loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                        {is_loading && 'Processing... Please wait...'}
                        {!is_loading && is_login && 'Login'}
                        {!is_loading && !is_login && 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#2563eb', cursor: 'pointer' }} onClick={toggle_mode}>
                    {is_login ? "Don't have an account? Register" : 'Already have an account? Login'}
                </p>
            </div>
        </div>
    );
}