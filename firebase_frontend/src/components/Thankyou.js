import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThankYouPage.css';

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/vote');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="thank-you-page-container">
      <h1 className="thank-you-header">Thank You for Voting!</h1>
      <p>Your vote has been recorded. Redirecting to the vote page...</p>
    </div>
  );
};

export default ThankYou;
