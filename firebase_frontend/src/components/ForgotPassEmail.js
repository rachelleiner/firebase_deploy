import React, { useState } from 'react';
import '../styles/ChangePassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  // Function to get user ID from email
  const getUserIdFromEmail = async (email) => {
    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/getUserIdByEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId);
      } else {
        setError(data.error || 'Failed to get user ID.');
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      setError('Failed to fetch user ID. Please try again later.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError('Please provide a valid email to retrieve your user ID.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be 8-32 characters long, contain at least one number, one special character, and one uppercase letter.');
      return;
    }

    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userId,
          currentPassword,
          newPassword,
          validatePassword: confirmNewPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setEmail('');
        setUserId('');
        setError('');
        navigate('/login');
      } else {
        setError(data.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('Failed to change password. Please try again later.');
    }
  };

  return (
    <div className="change-password-content">
      <form className="change-password-form" onSubmit={handleChangePassword}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value) {
              getUserIdFromEmail(e.target.value);
            } else {
              setUserId('');
            }
          }}
          required
        />
        <label htmlFor="currentPassword">Current Password</label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <label htmlFor="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          type="password"
          id="confirmNewPassword"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <input type="submit" value="Change Password" />
      </form>
    </div>
  );
};

export default ForgotPassword;
