import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router';

const {REACT_APP_API_URL} = process.env;

const Login = ({ setLoggedIn, setToken }) => {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${REACT_APP_API_URL}/users/login`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username, password}),
            })
            const data = await response.json();
            const { token, user } = data;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('username', user.username);
                setToken(token);
                setLoggedIn(true);
                setUsername('');
                setPassword('');
                history.push('/');
                return;
            };
        } catch (error) {
            console.error(error);
        };
    };

    return <>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className='login-form'>
            <input type='text' placeholder='enter username' onChange={(e) => setUsername(e.target.value)} value={username} />
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} value={password}></input>
            <button type="submit" disabled={password < 8}>Login</button>
        </form>
        <span>Don't have an account? Click <Link to='/account/register'>here</Link> to register!</span>
    </>
};

export default Login;
