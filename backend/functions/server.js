require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 5000;
const { ObjectId } = require('mongodb');

// MongoDB connection
const url = 'mongodb+srv://lyrenee02:tSGwv9viMBFajw3u@cluster.muwwbsd.mongodb.net/party-database?retryWrites=true&w=majority';
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();

mongoose.set('strictQuery', true);
mongoose.connect(url, {
    dbName: 'party-database',
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const User = require('./models/User');
const Party = require('./models/Party');
const Poll = require('./models/Poll');
const PartyGuest = require('./models/PartyMembers');
const Movie = require('./models/Movie');
const Invite = require('./models/Invite');

// Enabl CORS for all routes
app.use(cors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
}));

app.use(bodyParser.json());
app.use(express.json());

app.use(session({
    secret: 'e89d35b3747d1f046e14a882dfc781b936eb511a8ffbec71d777b4e6da365fa8',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: url,
        dbName: 'party-database',
        collectionName: 'sessions',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60,
        sameSite: 'Lax',
        secure: false,
    },
}));

const authRouter = require('./routes/auth');
const partyRouter = require('./routes/party');
const pollRouter = require('./routes/poll');

app.use('/api/auth', authRouter);
app.use('/api/party', partyRouter);
app.use('/api/poll', pollRouter);

app.set('port', (5000 || 5000));

app.get('/', (req, res) => {
    if (!req.session.views) {
        req.session.views = 0;
    }
    req.session.views++;
    res.send(`Number of views: ${req.session.views}`);
});

app.get('/api/check-session', (req, res) => {
    res.json(req.session);
});


app.post('/api/displayMovies', async (req, res) => {
  const { partyID } = req.body;

  try {
    // Fetch polls for the given partyID
    const polls = await Poll.find({ partyID });

    // Collect watched movie IDs from the polls
    const watchedMovies = polls.flatMap(poll =>
      poll.movies
        .filter(movie => movie.watchedStatus) // Only include watched movies
        .map(movie => movie.movieID)
    );

    // Collect movie IDs from the polls
    const movieIDs = polls.flatMap(poll =>
      poll.movies.map(movie => movie.movieID)
    );

    // Filter out watched movies
    const moviesNotWatched = movieIDs.filter(movieID => !watchedMovies.includes(movieID));

    // Fetch movies based on the collected IDs
    const movies = await Movie.find({ movieID: { $in: moviesNotWatched } }).sort({ votes: -1 }).exec();

    console.log(movies);

    res.status(200).json(movies);
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: e.toString() });
  }
});

// Display movies
app.post('/api/displayTopMovie', async (req, res) => {
    const { partyID } = req.body;
  
    try {
      // Fetch polls for the given partyID
      const polls = await Poll.find({ partyID });
  
      // Collect watched movie IDs from the polls
      const watchedMovies = polls.flatMap(poll =>
        poll.movies
          .filter(movie => movie.watchedStatus) // Only include watched movies
          .map(movie => movie.movieID)
      );
  
      // Collect movie IDs from the polls
      const movieIDs = polls.flatMap(poll =>
        poll.movies.map(movie => movie.movieID)
      );
  
      // Filter out watched movies
      const moviesNotWatched = movieIDs.filter(movieID => !watchedMovies.includes(movieID));
  
      // Fetch movies based on the collected IDs
      const movies = await Movie.find({ movieID: { $in: moviesNotWatched } }).sort({ votes: -1 }).exec();
  
      console.log(movies);
  
      res.status(200).json(movies);
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ error: e.toString() });
    }
  }); 

// Display watched movies
app.post('/api/displayWatchedMovies', async (req, res) => {
  const { partyID } = req.body;
  try {
    const polls = await Poll.find({ partyID });
    const watchedMovies = polls.flatMap((poll) =>
      poll.movies.filter(movie => movie.watchedStatus).map(movie => movie.movieID)
    );

    const movies = await Movie.find({ movieID: { $in: watchedMovies } });
    console.log('movies',)
    res.status(200).json(movies);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.get('/getPartyMembers', async (req, res) => {
    const userID = req.session.userId;
    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const partyMember = await PartyGuest.findOne({ userID }).populate('partyID');
        if (!partyMember) {
            return res.status(404).json({ message: 'Party not found' });
        }
        const members = await PartyGuest.find({ partyID: partyMember.partyID._id }).populate('userID', 'username email');
        const currentUser = await User.findById(userID).select('username email');
        res.status(200).json({ members, currentUser });
    } catch (error) {
        console.error('Error fetching party members:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Search movies
app.post('/api/searchMovie', async (req, res) => {
    const { search } = req.body;
    try {
      const movies = await Movie.find({ title: new RegExp(search, 'i') });
      res.status(200).json(movies.map((movie) => movie.title));
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  });
  

app.post('/api/userAccount', async (req, res) => {
    const { userID } = req.body;
    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/api/changePassword', async (req, res) => {
    const { userID, newPassword, validatePassword } = req.body;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/;

    if (newPassword !== validatePassword) {
        return res.status(400).json({ error: 'Passwords must match' });
    }
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: 'Weak password' });
    }

    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isSamePassword = bcrypt.compareSync(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'Password matches current password' });
        }
        user.password = bcrypt.hashSync(newPassword, 8);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/api/sendResetPassEmail', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "themoviesocial@gmail.com",
                pass: "mjzd lbgy tttl ynuc",
            },
        });
        const passToken = jwt.sign({ data: 'Pass Token' }, 'PassTokenKey', { expiresIn: '24h' });
        await transporter.sendMail({
            from: '"largeproject " <themoviesocial@gmail.com>',
            to: email,
            subject: 'Password Reset Request',
            text: `Hi! There, You can reset your password 
                   by clicking the link below:
                   https://us-central1-themoviesocialweb.cloudfunctions.net/app/api/resetPassword/${passToken}/${email}
                   Thanks`,
        });
        res.status(200).json({ message: 'email sent' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.get('/api/resetPassword/:passToken/:email', async (req, res) => {
  const { passToken, email } = req.params;
  try {
      jwt.verify(passToken, 'PassTokenKey', function (err, decoded) {
          if (err) {
              return res.status(401).send(`
                  <html>
                      <body>
                          <h2>Reset password failed</h2>
                          <p>The link you clicked is invalid or has expired. </p>
                          <p><a href="/login">Go to Login Page</a></p>
                      </body>
                  </html>
              `);
          }

          const redirectUrl = `ttps://us-central1-themoviesocialweb.cloudfunctions.net/app/resetPassword/${passToken}?email=${encodeURIComponent(email)}`;
          res.redirect(redirectUrl);
      });
  } catch (e) {
      console.error('Error during reset password:', e);
      res.status(500).send(`
          <html>
              <body>
                  <h2>Internal Server Error</h2>
                  <p>There was a problem processing your password reset. Please try again later.</p>
              </body>
          </html>
      `);
  }
});

app.post('/api/resetPassword', (req, res) => {
  const { email, newPassword, token } = req.body;

  // Validate email format (simplified)
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !newPassword || !token) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  // Validate token
  if (resetTokens[email] !== token) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // In a real application, update the password in your database
  console.log(`Password for ${email} updated to ${newPassword}`);

  // Remove token after use
  delete resetTokens[email];

  res.status(200).json({ message: 'Password reset successfully' });
});


app.post('/api/resetPass', async (req, res) => {
    const { email, newPassword, validatePassword } = req.body;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/;

    if (newPassword !== validatePassword) {
        return res.status(400).json({ error: 'Passwords must match' });
    }
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: 'Weak password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isSamePassword = bcrypt.compareSync(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'Password matches current password' });
        }
        user.password = bcrypt.hashSync(newPassword, 8);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});


app.post('/api/invite', async (req, res) => {
    const { senderId, receiverId } = req.body;
  
    try {
      // Find the existing party for the sender
      const existingParty = await Party.findOne({ hostID: senderId });
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
  
      // Check if the party exists
      if (!existingParty) {
        return res.status(404).json({ 
          error: 'Party not found', 
          senderId: senderId 
        });
      }
  
      const partyId = existingParty._id;
  
      if (!partyId) {
        return res.status(404).json({ error: 'Party ID not found' });
      }
  
      // Find the user by email
      const invitedUser = await User.findOne({ email: receiverId });
  
      // Check if the user exists
      if (!invitedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const invitedId = invitedUser._id;
  
      if (!invitedId) {
        return res.status(404).json({ error: 'User Id not found' });
      }
  
      console.log('Party ID:', partyId);
      console.log('Sender ID:', senderObjectId);
      console.log('Receiver ID:', invitedId);
  
      // Create a new invitation
      const invitation = new Invite({ partyId, senderObjectId, invitedId });
      await invitation.save();
  
      res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
      console.error('Error in /api/invite:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  app.post('/api/invitations', async (req, res) => {
    const { userId } = req.body;
  
    console.log("userid", userId);
  
    try {
      const invitations = await Invite.find({ invitedId: userId, status: 'pending' }).populate('partyId senderObjectId');
      console.log("invitations found:", invitations);
      res.status(200).json(invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/invitations/respond', async (req, res) => {
    const { invitationId, status } = req.body;
    const db = client.db('party-database');
  
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
  
    try {
      const invitation = await Invite.findById(invitationId);
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }
  
      invitation.status = status;
      await invitation.save();
  
      if (status === 'accepted') {
        const newMember = {
          userID: invitation.invitedId,
          partyID: invitation.partyId,
        };
  
        const insertResult = await db
          .collection('PartyMembers')
          .insertOne(newMember);
        console.log('Insert result:', insertResult);
      }
  
      res.status(200).json({ message: `Invitation ${status}` });
    } catch (error) {
      console.error('Error handling invitation:', error); // Log the error
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/getParties', async (req, res) => {
    const { userId } = req.body;
    const db = client.db('party-database');

    try {
        const userObjectId = new ObjectId(userId);
        console.log("User ID:", userObjectId);

        // Find all parties where the user is a member
        const memberParties = await db.collection('PartyMembers').find({ userID: userObjectId }).toArray();
        console.log("Member Parties:", memberParties);

        if (memberParties.length === 0) {
            console.log('No parties found for user:', userObjectId);
            return res.status(400).json({ message: 'No parties found' });
        }

        // Extract party IDs
        const partyIds = memberParties.map(member => member.partyID.toString());
        console.log("Party IDs:", partyIds);

        // Convert party IDs to ObjectId and find matching parties
        const parties = await db.collection('party').find({ _id: { $in: partyIds.map(id => new ObjectId(id)) } }).toArray();
        console.log("Parties:", parties);

        res.status(200).json(parties);

    } catch (error) {
        console.error('Error fetching parties:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  if (process.env.NODE_ENV === 'development') {
    res.status(500).send(`Error: ${err.message}`);
  } else {
    res.status(500).send('Something broke!');
  }
});

module.exports = app;