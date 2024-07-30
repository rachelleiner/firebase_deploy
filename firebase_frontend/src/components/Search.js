import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchPage.css';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startPoll = async () => {
      try {
        const partyID = localStorage.getItem('partyID');
        if (!partyID) {
          throw new Error('Party ID not found in local storage');
        }

        console.log('Starting poll with partyID:', partyID);

        const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/poll/startPoll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ partyID, movieID: null }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to start poll response text:', errorText);
          throw new Error('Failed to start poll');
        }

        const result = await response.json();
        console.log('Poll started successfully:', result);
        localStorage.setItem('pollID', result.pollID);
        console.log('Poll ID saved in local storage:', result.pollID);
      } catch (error) {
        console.error('Error starting poll:', error);
      }
    };

    startPoll();
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm === '') {
        console.log('Search term is empty, not displaying results.');
        setAllMovies([]);
        setErrorMessage('');
        setSearchInitiated(false);
        return;
      }

      setSearchInitiated(true);
      setSearching(true);

      try {
        const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/searchMovie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search: searchTerm }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Search request failed response text:', errorText);
          throw new Error('Search request failed');
        }

        const data = await response.json();
        console.log('Search results:', data);

        const moviesWithTitles = data.map(title => ({ title }));

        setAllMovies(moviesWithTitles);
        setErrorMessage('');
      } catch (error) {
        console.error('Search error:', error);
        setErrorMessage('Search failed. Please try again later.');
        setAllMovies([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setErrorMessage('');
    setSearchInitiated(false);
  };

  const handleAddToPoll = async (movieTitle) => {
    console.log('Adding movie to poll:', movieTitle);
    const partyID = localStorage.getItem('partyID');
    const pollID = localStorage.getItem('pollID');
    console.log('Using partyID:', partyID);
    console.log('Using pollID:', pollID);

    try {
      const response = await fetch('https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/poll/addMovieToPoll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyID, pollID, movieTitle }), // Use proper identifiers for movieID
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add movie to poll response text:', errorText);
        throw new Error('Failed to add movie to poll');
      }

      const result = await response.json();
      console.log('Poll update result:', result);

      navigate('/vote', { state: { pollID: result.pollID, selectedMovies: [result.movieTitle] } });
    } catch (error) {
      console.error('Update poll error:', error);
    }
  };

  const filteredMovies = searchTerm
    ? allMovies.filter((movie) =>
        movie.title && movie.title.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    : [];

  console.log('Rendering search page with movies:', filteredMovies);

  return (
    <div className="search-page-container">
      <h1 className="search-header">Search Movies</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {searchInitiated && (
        <div className="movie-list">
          <h2>Search Results</h2>
          {filteredMovies.length === 0 && !searching ? (
            <div className="no-results">No movies available.</div>
          ) : (
            <div className="movie-grid">
              {filteredMovies.map((movie, index) => (
                <div key={index} className="movie-box">
                  <div className="movie-title">{movie.title}</div>
                  <button
                    className="add-button"
                    onClick={() => handleAddToPoll(movie.title)}
                  >
                    Add To Poll
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
