require('dotenv').config();
const express=require('express');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const cors=require('cors')

// Initialize Express
const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

//firebase-part
//  Use service-account.json INSTEAD of .env for private keys
const serviceAccount = require('/Users/srinija/Desktop/all-in-one-platform/backend/service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// Google OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Secure Endpoint Example
app.post('/schedule', async (req, res) => {
  try {
    const { userToken, event } = req.body;
    const decoded = await admin.auth().verifyIdToken(userToken);
    
    // Use oauth2Client with user's tokens
    const tokens = await oauth2Client.getToken(decoded.oauthAccessToken);
    oauth2Client.setCredentials(tokens);
    
    // Schedule event
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: event
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(401).json({ error: "Auth/API failed", details: error.message });
  }
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});