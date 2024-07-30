import React, { useState, useEffect } from 'react';
import '../styles/InvitePage.css';

const Invite = () => {
  const [activeTab, setActiveTab] = useState('invites');
  const [invitations, setInvitations] = useState([]);
  const [parties, setParties] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');

  useEffect(() => {
    console.log('Component mounted');
    console.log(`Initial activeTab: ${activeTab}`);

    if (activeTab === 'invites') {
      fetchInvitations();
    } else if (activeTab === 'parties') {
      fetchParties();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    console.log('Fetching invitations');
    try {
      const userId = localStorage.getItem('userId');
      console.log(`userId from localStorage: ${userId}`);

      if (!userId) {
        console.log('No userId found in localStorage');
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

      console.log('Invitations response:', response);

      if (response.ok) {
        const result = await response.json();
        console.log('Invitations result:', result);
        setInvitations(result);
        if (result.length === 0) {
          setFetchMessage('No invitations found.');
        } else {
          setFetchMessage('');
        }
      } else {
        const errorResult = await response.json();
        console.log('Error result:', errorResult);
        setFetchMessage(errorResult.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setFetchMessage(`Error: ${error.toString()}`);
    }
  };

  const fetchParties = async () => {
    console.log('Fetching parties');
    try {
      const userId = localStorage.getItem('userId');
      console.log(`userId from localStorage: ${userId}`);

      if (!userId) {
        console.log('No userId found in localStorage');
        setFetchMessage('User ID not found. Please log in.');
        return;
      }

      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/getParties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      console.log('Parties response:', response);

      if (response.ok) {
        const result = await response.json();
        console.log('Parties result:', result);
        setParties(result);
        if (result.length === 0) {
          setFetchMessage('No parties found.');
        } else {
          setFetchMessage('');
        }
      } else {
        const errorResult = await response.json();
        console.log('Error result:', errorResult);
        setFetchMessage(errorResult.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
      setFetchMessage(`Error: ${error.toString()}`);
    }
  };

  const handleRespond = async (invitationId, status) => {
    console.log(`Responding to invitation ${invitationId} with status ${status}`);
    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId, status }),
      });

      console.log('Respond response:', response);

      if (response.ok) {
        const result = await response.json();
        console.log('Respond result:', result);
        setInvitations(invitations.filter(invite => invite._id !== invitationId));
      } else {
        const errorResult = await response.json();
        console.log('Error result:', errorResult);
        setFetchMessage(errorResult.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      setFetchMessage(`Error: ${error.toString()}`);
    }
  };

  const handleTabChange = (tab) => {
    console.log(`Changing tab to: ${tab}`);
    setActiveTab(tab);
  };

  return (
    <div className="invite-page-container">
      <h1 className="invite-header">Invitations and Parties</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'invites' ? 'active' : ''}`} onClick={() => handleTabChange('invites')}>
          Invites
        </button>
        <button className={`tab ${activeTab === 'parties' ? 'active' : ''}`} onClick={() => handleTabChange('parties')}>
          Parties
        </button>
      </div>
      {activeTab === 'invites' && (
        <div className="tab-content">
          {fetchMessage && <span className="message">{fetchMessage}</span>}
          <div className="invitations-list">
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <div key={invitation._id} className="invite-box">
                  <div className="invite-details">
                    <p><strong>From:</strong> {invitation.senderId ? invitation.senderId.email : 'Unknown Email'}</p>
                    <p><strong>Status:</strong> {invitation.status}</p>
                  </div>
                  {invitation.status === 'pending' && (
                    <div className="invite-actions">
                      <button className="accept-button" onClick={() => handleRespond(invitation._id, 'accepted')}>Accept</button>
                      <button className="decline-button" onClick={() => handleRespond(invitation._id, 'declined')}>Decline</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              !fetchMessage && <p>No invitations found.</p>
            )}
          </div>
          <div className="navigation-links">
            <a href="/createParty" className="nav-link">Create a Party</a>
          </div>
        </div>
      )}
      {activeTab === 'parties' && (
        <div className="tab-content">
          {fetchMessage && <span className="message">{fetchMessage}</span>}
          <div className="parties-list">
            {parties.length > 0 ? (
              parties.map((party) => (
                <div key={party._id} className="party-box">
                  {party.name ? party.name : 'Unknown Party Name'}
                </div>
              ))
            ) : (
              !fetchMessage && <p>No parties found.</p>
            )}
          </div>
          <div className="navigation-links">
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
