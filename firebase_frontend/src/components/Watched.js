import React, { useState, useEffect } from 'react';
import '../styles/WatchedPage.css';

const WatchedPage = () => {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('Component mounted, fetching watched movies...');
    handleFetchWatchedMovies();
  }, []);

  const handleFetchWatchedMovies = async () => {
    setMessage('');
    const partyID = localStorage.getItem('partyID');

    if (!partyID) {
      setMessage('No party ID found. Please join a party first.');
      console.log('Error: Missing partyID');
      return;
    }

    try {
      console.log('Sending request to fetch watched movies with partyID:', partyID);
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/displayWatchedMovies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyID }),
      });

      console.log('Received response:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Response JSON:', data);

        const watchedMovies = data.map((movie) => movie.title);
        console.log('Watched Movies:', watchedMovies);

        setWatchedMovies(watchedMovies);
        console.log('Watched movies set to state:', watchedMovies);
      } else {
        const result = await response.json();
        setMessage(`Error: ${result.error}`);
        console.log('Error in response:', result.error);
      }
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      setMessage(`Error: ${error.toString()}`);
    }
  };

  return (
    <div className="watched-page-container">
      <h1 className="watched-header">Watched Movies</h1>
      <div className="watched-bar"></div>
      {message && <div className="error-message">{message}</div>}
      <div className="movie-list">
        <div className="movie-grid">
          {watchedMovies.length === 0 ? (
            <div className="no-results">No watched movies available.</div>
          ) : (
            watchedMovies.map((movie, index) => (
              <div key={index} className="movie-box">
                <div className="movie-title">{movie}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchedPage;
