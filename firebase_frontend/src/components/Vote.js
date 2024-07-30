import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VotePage.css';

const Vote = () => {
  const navigate = useNavigate();
  const storedPollID = localStorage.getItem('pollID');
  const userId = localStorage.getItem('userId');
  const storedPartyID = localStorage.getItem('partyID');
  const [movies, setMovies] = useState([]);
  const [pollID] = useState(storedPollID);
  const [userID] = useState(userId);
  const [partyID] = useState(storedPartyID);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('User ID:', userID);
    console.log('Poll ID:', pollID);
    console.log('Party ID:', partyID);

    const fetchPollData = async () => {
      if (!pollID || !userID || !partyID) {
        setErrorMessage('Poll ID, User ID, or Party ID not found. Please start a poll first.');
        console.log('Poll ID, User ID, or Party ID not found in local storage');
        return;
      }

      try {
        console.log(`Fetching vote page for pollID: ${pollID}`);
        const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/poll/votePage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pollID, userID, partyID }),
        });

        const responseText = await response.text();
        console.log('Fetch poll data response text:', responseText);

        if (!response.ok) {
          console.error('Fetch poll data error:', responseText);
          throw new Error(responseText || 'Failed to fetch poll data');
        }

        const data = JSON.parse(responseText);
        console.log('Fetched poll data:', data);
        setMovies(data.movies);
      } catch (error) {
        console.error('Error fetching poll data:', error);
        setErrorMessage('Failed to fetch poll data. Please try again later.');
      }
    };

    fetchPollData();
  }, [pollID, userID, partyID]);

  const handleUpvote = async (movieName) => {
    try {
      console.log(`Upvote button clicked for movieName: ${movieName}`);
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/poll/upvoteMovie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieTitle: movieName, partyID }),
      });

      const resultText = await response.text();
      console.log('Upvote response text:', resultText);

      if (!response.ok) {
        const result = JSON.parse(resultText);
        console.error('Upvote response error:', result);
        throw new Error(result.error || 'Failed to upvote movie');
      }

      const data = JSON.parse(resultText);
      console.log(`Votes for movie ${movieName}: ${data.votes}`);
      setMovies(movies.map((movie) =>
        movie.movieName === movieName ? { ...movie, votes: data.votes } : movie
      ));
      console.log('Movies state after upvote:', movies);
      navigate('/thankyou', { state: { movies: [...movies], pollID } });
    } catch (error) {
      console.error('Error upvoting movie:', error);
      setErrorMessage('Failed to upvote movie. Please try again later.');
    }
  };

  const handleWatch = async (movieName) => {
    try {
      console.log(`Watch button clicked for movieName: ${movieName}`);
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/poll/markWatched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyID, movieTitle: movieName }),
      });

      const resultText = await response.text();
      console.log('Watch response text:', resultText);

      if (!response.ok) {
        const result = JSON.parse(resultText);
        console.error('Watch response error:', result);
        throw new Error(result.error || 'Failed to mark movie as watched');
      }

      const data = JSON.parse(resultText);
      console.log(`Movie ${movieName} marked as watched successfully`);

      setMovies(movies.map((movie) =>
        movie.movieName === movieName ? { ...movie, watchedStatus: true } : movie
      ));
      console.log('Movies state after marking as watched:', movies);
    } catch (error) {
      console.error('Error marking movie as watched:', error);
      setErrorMessage('Failed to mark movie as watched. Please try again later.');
    }
  };

  return (
    <div className="vote-page-container">
      <h1 className="vote-header">Vote for Movies</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="movies-list">
        <div className="movie-grid">
          {movies.map((movie, index) => (
            movie && movie.movieName && (
              <div key={movie._id || index} className="movie-box">
                <div className="movie-title">{movie.movieName}</div>
                <div className="movie-votes">Votes: {movie.votes}</div>
                <div className="movie-status">{movie.watchedStatus ? 'Watched' : 'Not Watched'}</div>
                <button className="vote-button" onClick={() => handleUpvote(movie.movieName)}>+</button>
                <button className="watch-button" onClick={() => handleWatch(movie.movieName)}>Watch</button>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vote;
