const express = require('express');
const app = express();
const cors = require('cors');
const { connectToDatabase } = require('./data');
const bodyParser = require('body-parser');
const path = require('path');
const { ObjectId } = require('mongodb');

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const multer = require('multer');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure admin user middleware
async function ensureAdminUser() {
  try {
    const { register } = await connectToDatabase();
    const adminUser = await register.findOne({ role: 'admin' });

    if (!adminUser) {
      const defaultAdmin = {
        name: 'admin',
        email: 'admin@gmail.com',
        password: 'admin',
        role: 'admin'
      };
      await register.insertOne(defaultAdmin);
      console.log('Default admin user added.');
    }
  } catch (error) {
    console.error('Error while ensuring admin user:', error);
  }
}

// Middleware to ensure admin user exists before processing requests
app.use(async (req, res, next) => {
  await ensureAdminUser();
  next();
});

// CORS headers
app.use((req, res, next) => {
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Adjust URL according to your frontend app
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { register } = await connectToDatabase();
    const existingUser = await register.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already registered' });
    }

    // Add role field with default value 'user' to the request body
    const newUser = { ...req.body, role: 'user' };

    // Insert the new user
    const insertedUser = await register.insertOne(newUser);
    console.log('Registered Successfully');

    // Respond with the newly created user
    res.status(201).json({ message: 'Regist  ration successful', user: insertedUser });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // resolves to 'src/uploads'
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


app.post('/eventadd', upload.single('pic'), async (req, res) => {
  console.log("in try");
  try {
    console.log("innnn try");
    const { event }  = await connectToDatabase(); // Assuming connectToDatabase() returns the database connection
  // Assuming 'events' is the collection name

    const existingEvent = await event.findOne({ ename: req.body.ename });
    
    console.log(existingEvent);
    if (existingEvent) {
      return res.status(400).json({ error: 'Event is already registered' });
    } else {
      const image = req.file.filename; // Get the filename of the uploaded image

      // Add the image filename to the request body
      const eventDetails = { ...req.body, image: image };

      // Insert the new event with image filename
      const insertedEvent = await event.insertOne(eventDetails);
      console.log(insertedEvent)
      console.log('Event Registration Successful');

      // Respond with the newly created event
      res.status(201).json({ message: 'Event Registration successful', event: insertedEvent });
    }
  } catch (error) {
    console.error('Error during event registration:', error);
    res.status(500).json({ error: 'An error occurred during event registration' });
  }
});




app.post('/membership_add', async (req, res) => {
  try {
    const { membership } = await connectToDatabase();
    const existingUser = await membership.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already registered' });
    }

    // Add role field with default value 'user' to the request body
    const newUser = { ...req.body, role: 'user',status :"" };

    // Insert the new user
    const insertedUser = await membership.insertOne(newUser);
    console.log('Registered Successfully');

    // Respond with the newly created user
    res.status(201).json({ message: 'Regist  ration successful', user: insertedUser });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});



app.post('/uploadGallery', upload.array('images', 5), async (req, res) => {
  try {
    const { gallery } = await connectToDatabase();
    const existingUser = await gallery.findOne({ email: req.body.email });
    const { programName, date } = req.body;
    const images = req.files.map(file => file.filename); // Get filenames of uploaded images

    // Save program name, date, and image filenames to database or perform any other necessary actions
    console.log('Program Name:', programName);
    console.log('Date:', date);
    console.log('Images:', images);

    // Insert the new user
    const newUser = {
      programName,
      date,
      images,
      // Add any other fields you need to insert
    };
    const insertedUser = await gallery.insertOne(newUser);
    res.status(201).json({ message: 'Registration successful', user: insertedUser });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files in the 'uploads' directory
app.use('/uploads', express.static('uploads'));



app.get('/getGalleryImages', async (req, res) => {
  try {
    const { gallery } = await connectToDatabase(); // Connect to your database
    const allImages = await gallery.find({}, { projection: { _id: 0, images: 1 } }).toArray(); // Fetch only images field

    if (allImages.length > 0) {
      const imagesArray = allImages.map(item => item.images).flat(); // Flatten the array of arrays to a single array
      res.status(200).json({ images: imagesArray }); // Send the array of image filenames
    } else {
      res.status(404).json({ message: 'No images found', images: [] });
    }
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files in the 'uploads' directory
app.use('/uploads', express.static('uploads'));




app.post('/uploadvideo', upload.single('media'), async (req, res) => {
  try {
    const { video } = await connectToDatabase();
    const videoFile = req.file.filename; 
    const videoDetails = { ...req.body, videoFile: videoFile };

    // Save program name, date, and video filenames to database or perform any other necessary actions


    // Insert the new video gallery entry
    const insertedGallery = await video.insertOne(videoDetails);
    console.log('Video Upload Successful');
    res.status(201).json({ message: 'Video gallery added successfully', gallery: insertedGallery });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files in the 'videos' directory
app.use('/videos', express.static('videos'));

// Your other middleware and routes...




// Endpoint to fetch video URLs
// app.get('/getVideo', async (req, res) => {
//   try {
//     const { video } = await connectToDatabase(); // Connect to your database
//     const allVideos = await video.find({}, { projection: { _id: 0, url: 1 } }).toArray(); // Fetch only URLs field

//     if (allVideos.length > 0) {
//       const videoUrls = allVideos.map(item => item.url);
//       res.status(200).json({ urls: videoUrls });
//     } else {
//       res.status(404).json({ message: 'No videos found', urls: [] });
//     }
//   } catch (error) {
//     console.error('Error fetching video URLs:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Serve static files in the 'videos' directory
app.use('/videos', express.static('videos'));

// Your other middleware and routes...
// Endpoint to fetch video URLs
app.get('/getVideo', async (req, res) => {
  try {
    const { video } = await connectToDatabase(); // Connect to your database
    const allVideos = await video.find({}, { projection: { _id: 0, videoFile: 1 } }).toArray(); // Fetch only video filenames

    if (allVideos.length > 0) {
      const videoUrls = allVideos.map(item => item.videoFile);
      res.status(200).json({ urls: videoUrls });
    } else {
      res.status(404).json({ message: 'No videos found', urls: [] });
    }
  } catch (error) {
    console.error('Error fetching video URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});








// app.get('/view_membership', async (req, res) => {
//   try {
//     const { membership } = await connectToDatabase();
//     const userData = await membership.find().toArray();
//     if (userData.length > 0) {
//       res.status(200).json(userData); // Send user data array directly
//     } else {
//       res.status(404).json({ message: 'No data found', data: [] });
//     }
//   } catch (error) {
//     console.error('Error during data fetching:', error);
//     res.status(500).json({ error: 'An error occurred during data fetching' });
//   }
// });

app.get('/view_membership', async (req, res) => {
  try {
    const { membernew } = await connectToDatabase();
    const userData = await membernew.find().toArray();
    if (userData.length > 0) {
      res.status(200).json(userData); // Send user data array directly
    } else {
      res.status(404).json({ message: 'No data found', data: [] });
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    res.status(500).json({ error: 'An error occurred during data fetching' });
  }
});


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anittamjoseph24@gmail.com',
    pass: 'huxxkxwfrzsvtygf'
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    // Send mail with defined transport object
    await transporter.sendMail({
      from: 'anittamjoseph24@gmail.com',
      to,
      subject,
      text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Throw the error to handle it in the route handler
  }
};


app.put('/memberview_appr/:_id', async (req, res) => {
  try {
    const { membernew } = await connectToDatabase();
    const { _id } = req.params;
    const { status } = req.body;

    // Input validation
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }
    const u_e= await membernew.findOne({_id:  new ObjectId(_id)})
    // Update the membership registration in the database with the new status
    const updatedMembership = await membernew.updateOne(
      { _id:  new ObjectId(_id) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status } } // Set status based on request body
    );
    console.log(u_e._id)
    console.log(u_e.status)
    console.log(u_e.email)
    if (u_e.modifiedCount === 0) {
      return res.status(404).json({ error: 'Membership registration not found' });
    }
    await sendEmail(u_e.email, `Membership ${status === 'approved' ? 'Approved' : 'Rejected'}`, `Your membership registration has been ${status === 'approved' ? 'approved' : 'rejected'}.`);
    // Respond with the updated membership registration
    res.status(200).json({ message: 'Membership registration updated successfully', membernew: updatedMembership });
  } catch (error) {
    console.error('Error updating membership registration:', error);
    res.status(500).json({ error: 'An error occurred during membership registration update' });
  }
});




app.put('/memberview_reject/:_id', async (req, res) => {
  try {
    const { membernew } = await connectToDatabase();
    const { _id } = req.params;
    const { status } = req.body;

    // Input validation
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }
    const u_e= await membernew.findOne({_id:  new ObjectId(_id)})
    // Update the membership registration in the database with the new status
    const updatedMembership = await membernew.updateOne(
      { _id:  new ObjectId(_id) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status } } // Set status based on request body
    );
    console.log(u_e._id)
    console.log(u_e.status)
    console.log(u_e.email)
    if (updatedMembership.modifiedCount === 0) {
      return res.status(404).json({ error: 'Membership registration not found' });
    }
    console.log(u_e.email)
    await sendEmail(u_e.email, `Membership ${status === 'approved' ? 'Approved' : 'Rejected'}`, `Your membership registration has been ${status === 'approved' ? 'approved' : 'rejected'}.`);
    // Respond with the updated membership registration
    console.log("2222")
    res.status(200).json({ message: 'Membership registration updated successfully', membernew: updatedMembership });
  } catch (error) {
    console.error('Error updating membership registration:', error);
    res.status(500).json({ error: 'An error occurred during membership registration update' });
  }
});





// app.put('/eventreg_appr/:_id', async (req, res) => {
//   try {
//     const { event } = await connectToDatabase();
//     const { _id } = req.params;
//     const { status } = req.body;

//     // Input validation
//     if (!status || (status !== 'approved' && status !== 'rejected')) {
//       return res.status(400).json({ error: 'Invalid status provided' });
//     }

//     // Update the membership registration in the database with the new status
//     const updatedMembership = await event.updateOne(
//       { _id:  new ObjectId(_id) }, // Ensure ObjectId is instantiated with 'new'
//       { $set: { status } } // Set status based on request body
//     );
//  console.log(updatedMembership)
//     if (updatedMembership.modifiedCount === 0) {
//       return res.status(404).json({ error: 'Membership registration not found' });
//     }

//     // Respond with the updated membership registration
//     res.status(200).json({ message: 'Membership registration updated successfully', event: updatedMembership });
//   } catch (error) {
//     console.error('Error updating membership registration:', error);
//     res.status(500).json({ error: 'An error occurred during membership registration update' });
//   }
// });

app.put('/eventreg_appr/:_id', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const { _id } = req.params;
    const { status } = req.body;

    // Input validation
    if (!status || status !== 'register') { // Adjust the condition for approval
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    // Update the membership registration in the database with the new status
    const updatedMembership = await event.updateOne(
      { _id: new ObjectId(_id) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status } } // Set status based on request body
    );

    if (updatedMembership.modifiedCount === 0) {
      return res.status(404).json({ error: 'Membership registration not found' });
    }

    // Respond with the updated membership registration
    res.status(200).json({ message: 'Membership registration updated successfully', event: updatedMembership });
  } catch (error) {
    console.error('Error updating membership registration:', error);
    res.status(500).json({ error: 'An error occurred during membership registration update' });
  }
});


app.put('/registerevent/:_id', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const { _id } = req.params;
    const { status } = req.body;

    // Input validation
    if (!status || (status !== 'regisered' && status !== 'rejected')) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    // Update the membership registration in the database with the new status
    const updatedRegister = await event.updateOne(
      { _id:  new ObjectId(_id) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status } } // Set status based on request body
    );

    if (updatedRegister.modifiedCount === 0) {
      return res.status(404).json({ error: 'event registration not found' });
    }

    // Respond with the updated membership registration
    res.status(200).json({ message: 'event registration  successfully', membernew: updatedRegister });
  } catch (error) {
    console.error('Error updating event registration:', error);
    res.status(500).json({ error: 'An error occurred during registration update' });
  }
});





app.post('/addnotif', async (req, res) => {
  try {
    const { notification } = await connectToDatabase();
    const existingNotification = await notification.findOne({ title: req.body.title });
    if (existingNotification) {
      return res.status(400).json({ error: 'Notification is already registered' });
    }

    // Add the current date and time to the request body
    const currentDate = new Date();
    const newNotification = {
      ...req.body,
      role: 'admin',
      receivedDate: currentDate // Add received date and time
    };

    // Insert the new notification into the database
    const insertedNotification = await notification.insertOne(newNotification);
    console.log('Notification Registration Successful:', insertedNotification);

    // Respond with the newly created notification
    res.status(201).json({ message: 'Notification registration successful', notification: insertedNotification });
  } catch (error) {
    console.error('Error during notification registration:', error);
    res.status(500).json({ error: 'An error occurred during notification registration' });
  }
});




app.post('/add_event_report', async (req, res) => {
  try {
    const { eventreport } = await connectToDatabase();
    
    // Check if an event report with the same title already exists
    const existingEventReport = await eventreport.findOne({ eventTitle: req.body.eventTitle });
    if (existingEventReport) {
      return res.status(400).json({ error: 'Event report already exists' });
    }

    // Add the current date and time to the request body
    const currentDate = new Date();
    const newEventReport = {
      ...req.body,
      receivedDate: currentDate // Add received date and time
    };

    // Insert the new event report into the database
    const insertedEventReport = await eventreport.insertOne(newEventReport);
    console.log('Event report shared successfully:', insertedEventReport);

    // Respond with the newly created event report
    res.status(201).json({ message: 'Event report shared successfully', eventreport: insertedEventReport });
  } catch (error) {
    console.error('Error during event report submission:', error);
    res.status(500).json({ error: 'An error occurred during event report submission' });
  }
});


app.get('/view_report', async (req, res) => {
  try {
    const { eventreport } = await connectToDatabase();
    const userData = await eventreport.find().toArray();
    if (userData.length > 0) {
      res.status(200).json(userData); // Send user data array directly
    } else {
      res.status(404).json({ message: 'No data found', data: [] });
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    res.status(500).json({ error: 'An error occurred during data fetching' });
  }
});



// Login route
app.post('/login', async (req, res) => {
  try {
    const { register } = await connectToDatabase();
    const { email, password } = req.body;
    const user = await register.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    if (user) {
      console.log('Admin logged in');
      res.json({ message: 'Admin login successful', isAdmin: user.role, user , name:user.name ,email:email});
    } else {
      res.json({ message: 'User login successful', user });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});




app.get('/view_reg', async (req, res) => {
  try {
    const { register } = await connectToDatabase();
    const userData = await register.find().toArray();
    if (userData.length > 0) {
      res.status(200).json(userData); // Send user data array directly
    } else {
      res.status(404).json({ message: 'No data found', data: [] });
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    res.status(500).json({ error: 'An error occurred during data fetching' });
  }
});


// Assuming you have a MongoDB database connection function named 'connectToDatabase'


app.get('/notifications', async (req, res) => {
  try {
    const { notification } = await connectToDatabase();
    const notificationData = await notification.find().toArray();
    
    // Add current date and time to each notification object
    const notificationsWithDate = notificationData.map((notif) => ({
      title: notif.title,
      description: notif.description,
      date: new Date().toISOString() // Use current date and time
    }));

    if (notificationsWithDate.length > 0) {
      res.status(200).json(notificationsWithDate); // Send notification data array with date
    } else {
      res.status(404).json({ message: 'No notifications found', data: [] });
    }
  } catch (error) {
    console.error('Error during notification fetching:', error);
    res.status(500).json({ error: 'An error occurred during notification fetching' });
  }
});


// app.get('/view_userevent', async (req, res) => {
//   try {
//     const { event } = await connectToDatabase();
//     const userData = await event.find().toArray();
//     if (userData.length > 0) {
//       res.status(200).json(userData); // Send user data array directly
//     } else {
//       res.status(404).json({ message: 'No data found', data: [] });
//     }
//   } catch (error) {
//     console.error('Error during data fetching:', error);
//     res.status(500).json({ error: 'An error occurred during data fetching' });
//   }
// });

const checkMembershipStatus = async (req, res, next) => {
  try {
    const { membernew } = await connectToDatabase();
    const email = req.query.email; // Retrieve email from query parameters
    const user = await membernew.findOne({ email });
     console.log(user,"jjj")
    if (!user || user.status !== 'approved') {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }

    // If user has approved membership, continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error checking membership status:', error);
    res.status(500).json({ error: 'An error occurred while checking membership status' });
  }
};

// Endpoint to check membership status
app.get('/check_membership_status', checkMembershipStatus, (req, res) => {
  // Assuming the middleware sets a flag indicating membership status in res.locals or req.user
  res.status(201).json({ isApproved: true }); // Adjust the response based on your actual logic
});

// Apply the checkMembershipStatus middleware to the event route
app.get('/view_userevent', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const userData = await event.find().toArray();
    if (userData.length > 0) {
      res.status(200).json(userData); // Send event data array directly
    } else {
      res.status(404).json({ message: 'No data found', data: [] });
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    res.status(500).json({ error: 'An error occurred during data fetching' });
  }
});




app.get('/view_userevent_reg_rep', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const userData = await event.find().toArray();
    if (userData.length > 0) {
      res.status(200).json(userData); // Send user data array directly
    } else {
      res.status(404).json({ message: 'No data found', data: [] });
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    res.status(500).json({ error: 'An error occurred during data fetching' });
  }
});

// Sample events data
const events = [
  { id: 1, ename: 'Event 1', edate: '2024-04-15', speaker: 'Speaker 1', subject: 'Subject 1' },
  { id: 2, ename: 'Event 2', edate: '2024-04-16', speaker: 'Speaker 2', subject: 'Subject 2' },
  { id: 3, ename: 'Event 3', edate: '2024-04-17', speaker: 'Speaker 3', subject: 'Subject 3' }
];

// Middleware for handling cross-origin requests
app.use(cors());

// Search endpoint
app.get('/search', (req, res) => {
  const term = req.query.term.toLowerCase();
  const searchResults = events.filter(event => {
    return event.ename.toLowerCase().includes(term) || event.edate.includes(term);
  });
  res.json(searchResults);
});



app.put('/approve_event/:eventId', async (req, res) => {
  try {
    const { booking } = await connectToDatabase();
    const { eventId } = req.params;

    // Update the event in the database with the new status (assuming 'approved')
    const updatedEvent = await booking.updateOne(
      { _id: new ObjectId(eventId) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status: 'approved' } }
    );

    if (updatedEvent.modifiedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Event approved successfully' });
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ error: 'An error occurred during event approval' });
  }
});

app.put('/reject_event/:eventId', async (req, res) => {
  try {
    const { booking } = await connectToDatabase();
    const { eventId } = req.params;

    // Update the event in the database with the new status (assuming 'rejected')
    const updatedEvent = await booking.updateOne(
      { _id: new ObjectId(eventId) }, // Ensure ObjectId is instantiated with 'new'
      { $set: { status: 'rejected' } }
    );

    if (updatedEvent.modifiedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Event rejected successfully' });
  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({ error: 'An error occurred during event rejection' });
  }
});


app.get('/view_userevent/:id', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const { id } = req.params;
    const events = await event.findOne({ _id: new ObjectId(id) });
    if (!events) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(events);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});
// Update event data









app.put('/update_event/:id', async (req, res) => {
  try {
    console.log("hai")
    const { event } = await connectToDatabase();
    console.log("hai")
     // Get the database connection
    const { id } = req.params;console.log("hai")
    const { _id, ...updatedFields } = req.body; // Exclude _id field from updatedFields
    console.log("ai")
    await event.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields }
    );
    console.log("hai")
    res.status(200).send('Event data updated successfully');
  } catch (error) {
    console.error('Error updating event data:', error);
    res.status(500).json({ error: 'Failed to update event data' });
  }
});


app.delete('/delete_event/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  // Logic to delete the event from your database
  // Respond with a success message or error message accordingly
  res.send(`Event with ID ${eventId} deleted successfully`);
});


app.get('/feedbackview', async (req, res) => {
  try {
    const { feedback } = await connectToDatabase(); // Assuming connectToDatabase() returns an object with a feedbackform collection
    const feedbackData = await feedback.find().toArray(); // Corrected spelling of 'feedbackform'
    if (feedbackData.length > 0) {
      res.status(200).json({ message: 'Data retrieved successfully', data: feedbackData });
    } else {
      res.status(404).json({ message: 'No feedback data found', data: [] });
    }
  } catch (error) {
    console.error('Error during feedback data fetching:', error);
    res.status(500).json({ error: 'An error occurred during feedback data fetching' });
  }
});



app.post('/membership_addnew', async (req, res) => {
  try {
    const { membernew } = await connectToDatabase();
    const existingUser = await membernew.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already registered' });
    }


    // Add role field with default value 'user' to the request body
    const newUser = { ...req.body, role: 'user',status :"" };

    // Insert the new user
    const insertedUser = await membernew.insertOne(newUser);
    console.log('Registered Successfully');

    // Respond with the newly created user
    res.status(201).json({ message: 'Regist  ration successful', user: insertedUser });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});



app.post('/feedbackform', async (req, res) => {
  try {
    // Assuming connectToDatabase() returns the database connection
    const { feedback } = await connectToDatabase(); 
    // Assuming 'feedback' is the collection name
    const existingFeedback = await feedback.findOne({ name: req.body.name });
    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback from this user already exists' });
    } else {
      // Assuming 'feedback' is the collection name
      const insertedFeedback = await feedback.insertOne(req.body);
      console.log('Feedback submitted:', insertedFeedback);
      res.status(201).json({ message: 'Feedback submitted successfully', feedback: insertedFeedback });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'An error occurred while submitting feedback' });
  }
});




// Function to connect to the MongoDB database


// Route handler for adding an article


// Multer upload configuration






















app.post('/addarticle', upload.single('pdfFile'), async (req, res) => {
  try {
    console.log("fff")
    const { article } = await connectToDatabase(); // Assuming 'articleCollection' is the collection name
console.log("rrr")
    // Ensure that the request body is properly parsed
    if (!req.body || !req.file) {
      return res.status(400).json({ error: 'Invalid request. Please provide all required fields.' });
    }

    // Check if an article with the same name already exists
    const existingArticle = await article.findOne({ name: req.body.name });
    console.log(existingArticle)
    if (existingArticle) {
      return res.status(400).json({ error: 'An article with this name already exists' });
    }

    // Extract article details from request body
    const { name, age, profession, email, phone } = req.body;
    console.log(name,age,profession,email,phone)
    const pdfPath = req.file.path;

    // Insert the new article into the database
    const insertedArticle = await article.insertOne({ name, age, profession, email, phone, pdfPath });
    console.log('Article submitted:');

    // Respond with success message
    res.status(201).json({ message: 'Article submitted successfully',  });
  } catch (error) {
    console.error('Error submitting article:', error);
    res.status(500).json({ error: 'Failed to submit article. Please try again later.' });
  }
});




























app.post('/addarticle', upload.single('pdfFile'), async (req, res) => {
  try {
    console.log("fff")
    const { article } = await connectToDatabase(); // Assuming 'articleCollection' is the collection name
    console.log("rrr")
    // Ensure that the request body is properly parsed
    if (!req.body || !req.file) {
      return res.status(400).json({ error: 'Invalid request. Please provide all required fields.' });
    }

    // Check if an article with the same name already exists
    const existingArticle = await article.findOne({ name: req.body.name });
    console.log(existingArticle)
    if (existingArticle) {
      return res.status(400).json({ error: 'An article with this name already exists' });
    }

    // Extract article details from request body
    const { name, age, profession, email, phone } = req.body;
    console.log(name, age, profession, email, phone);

    // Extract filename from the file path
    const pdfName = path.basename(req.file.path);
    console.log(pdf)
    // Insert the new article into the database
    const insertedArticle = await article.insertOne({ name, age, profession, email, phone, pdfName });
    console.log('Article submitted:');

    // Respond with success message
    res.status(201).json({ message: 'Article submitted successfully',  });
  } catch (error) {
    console.error('Error submitting article:', error);
    res.status(500).json({ error: 'Failed to submit article. Please try again later.' });
  }
});





// app.get('/articles', async (req, res) => {
//   try {
//     // Connect to MongoDB
//     const { MongoClient } = require('mongodb');

//     const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();
//     const db = client.db(article);
    
//     // Get articles collection
//     const collection = db.collection(articleCollection);
    
//     // Fetch all articles
//     const articles = await collection.find().toArray();

//     // Close connection
//     await client.close();

//     // Send articles as response
//     res.json(articles);
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Failed to fetch articles' });
//   }
// });


app.get('/viewarticle', async (req, res) => {
  try {
    const { article } = await connectToDatabase();
    const brochureData = await article.find().toArray();
    if (brochureData.length > 0) {
      res.status(200).json(brochureData); // Send brochure data array directly
    } else {
      res.status(404).json({ message: 'No article found', data: [] });
    }
  } catch (error) {
    console.error('Error during article data fetching:', error);
    res.status(500).json({ error: 'An error occurred during article data fetching' });
  }
});


app.get('/searchevent', async (req, res) => {
  try {
    const { event } = req.params;
    // Assume events are stored in a MongoDB database
    const events = await event.find({
      edate: {
        $gte: new Date(`2024-${month}-01`),
        $lt: new Date(`2024-${parseInt(month) + 1}-01`)
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Assuming you have a route like this in your backend
app.post('/user_eventreg/:id', async (req, res) => {
  try {
    const { event } = await connectToDatabase();
    const { id } = req.params;

    // Check if the event exists
    const existingEvent = await event.findOne({ _id: new ObjectId(id) });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let updatedCount = 1;

    // Check if the count field exists in the event document
    if (existingEvent.registeredMembersCount !== undefined) {
      // If the count field exists, increment it by 1
      updatedCount = existingEvent.registeredMembersCount + 1;
    }

    // Update the count of registered members in the event document
    await event.updateOne(
      { _id: new ObjectId(id) },
      { $set: { registeredMembersCount: updatedCount } }
    );

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
