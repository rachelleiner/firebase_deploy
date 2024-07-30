import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('verificationToken', result.emailToken);
        setMessage('Registration successful. Please verify your email.');
        setTimeout(() => {
          navigate('/wait');
        }, 3000); 
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.toString()}`);
    }
  };

  return (
    <div id="registerDiv">
      <h1 className="inner-heading">Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="inputField"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="inputField"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="inputField"
          required
        />
        <button type="submit" className="buttons">Submit</button>
      </form>
      <span id="registerResult" className="message">{message}</span>
      <div>
        <a href="/login" id="loginLink">Already have an account? Login</a>
      </div>
    </div>
  );
};

export default Register;
