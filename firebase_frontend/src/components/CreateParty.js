import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePartyPage.css';

const CreateParty = () => {
  const [partyName, setPartyName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreateParty = async (event) => {
    event.preventDefault();

    try {
      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        setMessage('User ID not found. Please log in.');
        return;
      }

      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/party/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyName, userId }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        const result = JSON.parse(responseText);
        setMessage('Party created successfully!');
        localStorage.setItem('partyID', result.party._id); 
        localStorage.setItem('pollID', result.poll._id); 
        localStorage.setItem('partyName', partyName); 
        setTimeout(() => {
          navigate('/invitesent');
        }, 3000); 
      } else {
        const errorResult = JSON.parse(responseText);
        setMessage('Error:', errorResult.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error:', error.toString());
    }
  };

  return (
    <div className="createParty-container">
      <div id="createGroupDiv">
        <h1 className="createParty-inner-heading">Create a Party</h1>
        <form onSubmit={handleCreateParty}>
          <input
            type="text"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="Group Name"
            className="createParty-inputField"
            required
          />
          <button type="submit" className="createParty-buttons">Create</button>
        </form>
        <span className="createParty-message">{message}</span>
        <div>
          <a href="/invite" className="createParty-joinLink">Invites</a>
        </div>
      </div>
    </div>
  );
};

export default CreateParty;