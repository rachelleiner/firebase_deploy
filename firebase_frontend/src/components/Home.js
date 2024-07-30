import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';

const HomePage = ({ partyID }) => {
  const [error, setError] = useState(null);
  const [topVotedMovie, setTopVotedMovie] = useState(null);
  const [partyName, setPartyName] = useState('Party');

  useEffect(() => {
    const fetchTopVotedMovie = async () => {
      try {
        console.log(`Fetching top voted movie for partyID: ${partyID}`);
        const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/displayTopMovie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ partyID }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top voted movie');
        }

        const data = await response.json();
        console.log('Top voted movie fetched:', data);
        if (data.length > 0) {
          setTopVotedMovie(data[0]); 
        } else {
          setTopVotedMovie(null);
        }
      } catch (error) {
        console.error('Fetch top voted movie error:', error);
        setError('Failed to fetch top voted movie. Please try again later.');
      }
    };

    if (partyID) {
      fetchTopVotedMovie();
    } else {
      console.warn('partyID is missing');
    }
  }, [partyID]);

  useEffect(() => {
    console.log('Current top voted movie:', topVotedMovie);
    const storedPartyName = localStorage.getItem('partyName');
    if (storedPartyName) {
      setPartyName(storedPartyName);
    }
  }, [topVotedMovie]);

  return (
    <div className="home-page-container">
      <div className="large-project-header">Welcome to The Movie Social</div>
      <div className="content">
        <div className="group-members">
          <h2>Party Name</h2>
          <div className="movie-title">{partyName}</div>
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="group-picks">
          <h2>Party's Top Picks</h2>
          {topVotedMovie ? (
            <div className="movie-title">{topVotedMovie.title}</div>
          ) : (
            <div className="no-votes">No votes yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
