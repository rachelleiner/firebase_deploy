import React, { useState, useEffect } from 'react';

const ReceivedInvites = () => {
  const [invitations, setInvitations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage after login

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(responseText || 'Failed to fetch invitations');
        }

        const data = JSON.parse(responseText);
        setInvitations(data.invitations || []);
      } catch (error) {
        setErrorMessage('Failed to fetch invitations. Please try again later.');
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();
  }, [userId]);

  const handleRespond = async (invitationId, status) => {
    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId, status }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || 'Failed to respond to invitation');
      }

      setInvitations(invitations.filter(invite => invite._id !== invitationId));
    } catch (error) {
      setErrorMessage('Failed to respond to invitation. Please try again later.');
      console.error('Error responding to invitation:', error);
    }
  };

  return (
    <div className="invite-page-container">
      <h1 className="invite-header">Received Invites</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="invitations-list">
        {invitations.length > 0 ? (
          invitations.map((invite, index) => (
            <div key={index} className="invite-box">
              <div className="invite-details">
                <p><strong>From:</strong> {invite.senderName}</p>
                <p><strong>Group Name:</strong> {invite.groupName}</p>
                <p><strong>Status:</strong> {invite.status}</p>
              </div>
              <div className="invite-actions">
                {invite.status === 'pending' && (
                  <>
                    <button className="accept-button" onClick={() => handleRespond(invite._id, 'accepted')}>Accept</button>
                    <button className="decline-button" onClick={() => handleRespond(invite._id, 'declined')}>Decline</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No invitations found.</p>
        )}
      </div>
    </div>
  );
};

export default ReceivedInvites;
