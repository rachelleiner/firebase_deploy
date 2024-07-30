import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/InvitePage.css';

const InviteSent = () => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [message, setMessage] = useState('');
  const [invitedEmails, setInvitedEmails] = useState([]);

  const handleInvite = async (event) => {
    event.preventDefault();

    try {
      const senderId = localStorage.getItem('userId');

      if (!senderId) {
        setMessage('User ID not found. Please log in.');
        return;
      }

      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderId, receiverId: receiverEmail }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Invitation sent successfully!');
        setInvitedEmails([...invitedEmails, receiverEmail]);
        setReceiverEmail('');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.toString()}`);
    }
  };

  return (
    <div className="invite-page">
      <div className="tab-content">
        <h1 className="inner-heading">Invite to Party</h1>
        <form onSubmit={handleInvite}>
          <input
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="inputField"
            required
          />
          <button type="submit" className="buttons">Send Invite</button>
        </form>
        <span className="message">{message}</span>
        <div className="invited-list">
          <h2 className="inner-heading">Invited Emails</h2>
          {invitedEmails.length > 0 ? (
            <ul>
              {invitedEmails.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          ) : (
            <p>No invitations sent yet.</p>
          )}
        </div>
        <div className="navigation-links">
          <Link to="/home" className="nav-link">Return Home</Link>
        </div>
      </div>
    </div>
  );
};

export default InviteSent;
