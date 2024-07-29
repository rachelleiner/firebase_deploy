import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePartyPage.css';

const CreateParty = () => {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      console.log('User ID from localStorage:', storedUserId);
    } else {
      console.log('User ID not found in localStorage');
      setMessage('Please log in again.');
    }
  }, []);

  const handleCreateGroup = async (groupName) => {
    console.log('Creating group with name:', groupName);
    console.log('Using user ID:', userId);

    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/party/createWeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyName: groupName, userID: userId }),
        credentials: 'include', // Ensure cookies are included in the request
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response JSON:', result);

      if (response.ok) {
        console.log('Group created successfully');
        setMessage('Group created successfully!');
        localStorage.setItem('partyID', result.partyInviteCode);
      } else {
        console.error('Error message:', result.message);
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error during group creation:', error);
      setMessage(`Error: ${error.toString()}`);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted with group name:', groupName);
    handleCreateGroup(groupName);
  };

  return (
    <div id="createGroupDiv">
      <h1 className="inner-heading">Create a Party</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group Name"
          className="inputField"
          required
        />
        <button type="submit" className="buttons">Submit</button>
      </form>
      <span id="registerResult" className="message">{message}</span>
      <div>
        <a href="/join" id="joinLink">Have a code? Enter it!</a>
      </div>
    </div>
  );
};

export default CreateParty;
