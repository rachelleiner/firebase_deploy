import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InvitePage.css';

const Invite = () => {
  const [activeTab, setActiveTab] = useState('sendInvites');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [message, setMessage] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');
  const navigate = useNavigate();

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
        fetchInvitations(); 
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.toString()}`);
    }
  };

  const fetchInvitations = async () => {
    try {
      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        setFetchMessage('User ID not found. Please log in.');
        return;
      }

      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      if (response.ok) {
        setInvitations(result);
      } else {
        setFetchMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setFetchMessage(`Error: ${error.toString()}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'sentInvitations') {
      fetchInvitations();
    }
  }, [activeTab]);

  return (
    <div className="invite-page">
      <div className="tabs">
        <button className={`tab ${activeTab === 'sendInvites' ? 'active' : ''}`} onClick={() => setActiveTab('sendInvites')}>
          Send Invites
        </button>
        <button className={`tab ${activeTab === 'sentInvitations' ? 'active' : ''}`} onClick={() => setActiveTab('sentInvitations')}>
          Sent Invitations
        </button>
      </div>
      {activeTab === 'sendInvites' && (
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
          <div className="navigation-links">
            <a href="/home" className="nav-link">Return Home</a>
            <a href="/createParty" className="nav-link">Create a Party</a>
          </div>
        </div>
      )}
      {activeTab === 'sentInvitations' && (
        <div className="tab-content">
          <h1 className="inner-heading">Sent Invitations</h1>
          {fetchMessage && <span className="message">{fetchMessage}</span>}
          <ul>
            {invitations.map((invitation) => (
              <li key={invitation._id}>
                {invitation.receiverId ? invitation.receiverId.email : 'Unknown Email'} - {invitation.status}
              </li>
            ))}
          </ul>
          <div className="navigation-links">
            <a href="/home" className="nav-link">Return Home</a>
            <a href="/createParty" className="nav-link">Create a Party</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
