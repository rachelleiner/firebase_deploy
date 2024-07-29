const mongoose = require('mongoose');

// Define the StoredMovies schema
const storedMoviesSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  partyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  votes: { type: Number, default: 0 },
  watchedStatus: { type: Boolean, default: false },
});

// Create the StoredMovies model
const StoredMovies = mongoose.model('StoredMovies', storedMoviesSchema);

module.exports = StoredMovies;