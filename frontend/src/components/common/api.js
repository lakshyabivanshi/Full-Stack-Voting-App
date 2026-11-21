const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiRequest = async (endpoint, method = 'GET', data = null, token = null)=>{
    const headers = {
        'Content-Type': 'application/json',
    };

    if(token){
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = {
        method,
        headers,
    };
    if(data){
        config.body = JSON.stringify(data);
    }
    try{
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const result = await response.json();

        if(!response.ok){
            throw new Error(result.error || result.message || 'Something wents wrong!');
        }
        return result;
    }catch (err){
        throw err;
    }
};