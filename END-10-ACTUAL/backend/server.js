const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const PORT = 5000;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Enable CORS for all requests (you can limit this by specifying origin)


const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:5500', // Add more origins as needed
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin); // Allow the origin
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the origin
        }
    }, // Your Next.js domain
    methods: ['GET', 'POST'],        // Specify allowed HTTP methods
    credentials: true                // Allow cookies if needed
  }));
 // Parse incoming JSON payloads

// Route to handle incoming POST requests
let userData;
app.post('/api/signin', (req, res) => {
  const data =  req.body;

  console.log('Received user sign-in data:', data.auth);
  userData = data
  // You can handle the data here, such as storing it in a database, etc.
  res.json({ message: 'User data received successfully', });
});

console.log(userData, "userdata")

app.get('/api/users', (req, res) => {
    // Respond with the stored user data
    res.json({ users: userData });
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});