const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'tm';

// Create a MongoDB client instance
const client = new MongoClient(url);

let dbInstance;

async function connectToDatabase() {
  try {
    if (!dbInstance) {
      // Connect to MongoDB if not already connected
      await client.connect();
      console.log('MongoDB connected successfully');


      // Get reference to the database
      const db = client.db(dbName);

      // Initialize collections
      const registerCollection = db.collection('register');
      const eventCollection = db.collection('event');
      const notificationCollection = db.collection('notification');
      const addmembershipCollection = db.collection('membership');
      const eventreportCollection = db.collection('eventreport');
      const galleryCollection = db.collection('gallery');
      const videoCollection = db.collection('video');
      const memberaddnewCollection = db.collection('membernew');
      const feedbackCollection = db.collection('feedback');
      const articleCollection = db.collection('article');




      // Store database instance
      dbInstance = {
        register: registerCollection,
        event: eventCollection,
        notification: notificationCollection,
        membership: addmembershipCollection,
        eventreport: eventreportCollection,
        gallery: galleryCollection,
        video:videoCollection,
        feedback:feedbackCollection,
        article:articleCollection,
        membernew:memberaddnewCollection

      };
    }

    return dbInstance;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; 
  }
}

module.exports = {
  connectToDatabase
};


