import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const Login = () => {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginName, password: loginPassword }),
      });

      const result = await response.json();
      if (response.ok) {
        if (result.message === 'Email not verified') {
          const emailToken = localStorage.getItem('verificationToken');
          if (emailToken) {
            const verifyResponse = await fetch(`https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/auth/verifyEmail/${emailToken}`);
            const verifyResult = await verifyResponse.text();
            if (verifyResponse.ok) {
              setMessage('Email verified successfully. Please log in again.');
              localStorage.removeItem('verificationToken'); 
            } else {
              setMessage(`Verification failed: ${verifyResult}`);
            }
          } else {
            setMessage('Email not verified. Please check your inbox for the verification email.');
          }
        } else {
          localStorage.setItem('userId', result.userId);
          setMessage('Login successful');
          setTimeout(() => {
            navigate('/createParty');
          }, 3000); 
        }
      } else {
        if (result.message === 'Email not verified') {
          setMessage('Email not verified');
        } else {
          setMessage(`Error: ${result.message}`);
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.toString()}`);
    }
  };

  return (
    <div id="loginDiv">
      <h1 className="inner-heading">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          placeholder="Email"
          className="inputField"
          required
        />
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Password"
          className="inputField"
          required
        />
        <a href="/reset-password" id="resetPassword">Forgot Password?</a>
        <button type="submit" className="buttons">Submit</button>
      </form>
      <span id="loginResult" className="message">{message}</span>
      <div>
        <a href="/register" id="signupLink">Don't have an account? Register</a>
      </div>
    </div>
  );
};

export default Login;
