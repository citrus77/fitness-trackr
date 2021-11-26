import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { useParams, useHistory } from 'react-router';
import { callApi } from '../util';

const LoginRegister = ({ fetchUserRoutines, setToken, setUserName, setUserId }) => {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ verPass, setVerPass ] = useState('');
    const [ error, setError] = useState('');
    const params = useParams();
    const history = useHistory();

    return <> 
        <div className='form-container'>
            <div className='login-header'>            
                {
                params.method === 'register' 
                    ? <h3 className='header'>Register a new account</h3> 
                    : <h3 className='header'>Login to your account</h3>
                }           
            </div>
            <form className='login-form' onSubmit={async (e) =>{
                e.preventDefault();
                try{ 
                    const response = await callApi ({
                        url: `/users/${params.method}`,
                        method: 'POST',
                        body: { username, password }                        
                    });
                    if (response.error) {
                        setError(response.error);
                    };
                    if (response.token) {
                        const { token } = response;
                        setToken(token);
                        localStorage.setItem('token', token);
                        const user = await callApi({ url: '/users/me', token})
                        if (user) {
                            setUserName(user.username);
                            localStorage.setItem('username', user.username);
                            setUserId(user.id)
                            localStorage.setItem('userId', user.id)
                            await fetchUserRoutines();
                            setUsername('');
                            setPassword('');
                            history.push('/user/routines');
                        }
                    }
                } catch(error) {
                    console.error(error);
                };                
            }}>
                <fieldset className='input-fieldset'>
                    <label>User name</label>
                    <input 
                        className='input-field' 
                        type='text'
                        name='Login Name'
                        placeholder='enter your user name' 
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </fieldset>

                <fieldset className='input-fieldset'>
                    <label>Password</label>
                    <input 
                        className='input-field' 
                        type='password' 
                        name='Password'
                        placeholder='password (min length 6 chars)' 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </fieldset>

                {
                params.method === 'register' 
                    ? <fieldset className='input-fieldset'>
                        <label>Verify Password</label>
                            <input 
                                className='input-field' 
                                type='password' 
                                name='Verify Password'
                                placeholder='re-enter your password' 
                                onChange={(e) => setVerPass(e.target.value)}
                            />
                    </fieldset>
                    : ''
                }
                
                {
                params.method === 'register' 
                    ? <button className='login-button' type="submit" disabled={!password || !username || password.length < 8 || password !== verPass }>
                        Register
                    </button> 
                    : <button className='login-button' type="submit" disabled={!password || !username || password.length < 8 }>
                        Login
                    </button>
                }
                { params.method === 'register' && password !== verPass && <span className='password-alert'>Passwords must match!</span> }

                { params.method === 'register' && password.length < 8 && <span className='password-alert'>Passwords must contain at least 8 characters!</span> }

                { error
                    ? <span>{error}</span>
                    : null
                }

                {
                params.method === 'register' 
                ? <>
                    <span>Already have an account yet? </span>
                    <Link to="/account/login" className='login-link'>
                        Click here to log in!
                    </Link>
                </> 
                : <>
                    <span>Already have an account yet? </span>
                    <Link to="/account/register" className='login-link'>
                        Click here to register!
                    </Link>
                </>
                }
            </form>            
    </div>
</>
};

export default LoginRegister;