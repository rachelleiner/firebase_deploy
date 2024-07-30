import React from 'react';
import Invite from '../components/Invite';
import '../styles/InvitePage.css';

const InvitePage = () => {
  return (
    <div className="invite-page">
      <div className="column">
        <Invite />
      </div>
    </div>
  );
};

export default InvitePage;
