const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Secret key for JWT
const JWT_SECRET = 'your_secret_key'; // Replace with a secure key

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (CSS, JS, Images)
app.use(express.static('public'));

// Sample data storage (replace with a database in production)
const dataFilePath = path.join(__dirname, 'services.json');

// Utility function to read data from the file
const readData = () => {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (err) {
        console.error('Error reading data file:', err);
        return [];
    }
};

// Utility function to write data to the file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing data file:', err);
    }
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken; // Get token from cookies
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user; // Attach user info to request
        next();
    });
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Replace with proper user validation logic
    if (username === 'admin' && password === 'password') {
        const user = { id: 1, username: 'admin' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); // Generate JWT

        res.cookie('authToken', token, { httpOnly: true, secure: false }); // Set cookie
        return res.status(200).json({ message: 'Login successful', token });
    }

    res.status(401).json({ message: 'Invalid username or password' });
});

// Logout Route
app.post('/api/logout', (req, res) => {
    res.clearCookie('authToken'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
});

//API endpoint to save the service (Protected)
app.post('/api/hotel/save', authenticateToken, (req, res) => {
    const { service, status, userId } = req.body;

    // Validate request data
    if (!service || !status || !userId) {
        return res.status(400).json({ message: 'All fields (service, status, userId) are required!' });
    }

    // Read existing data
    const existingData = readData();

    // Add new entry
    const newEntry = { service, status, userId, timestamp: new Date().toISOString() };
    existingData.push(newEntry);

    // Write data back to the file
    writeData(existingData);

    // Send a response
    res.status(200).json({ message: 'Service saved successfully!', data: newEntry });
});
// Protected Route Example for /dashboard
app.get('/', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'HotelData.HTML'));
});
// app.get('/', authenticateToken, (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'Chefmenuveg.HTML'));
// });
app.get('/', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'Chefmenunonveg.HTML'));
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Chef Data','chefdetails.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Chef Data','login.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Chef Data','Chefmenuveg.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Chef Data','Chefmenunonveg.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Chef Data','HotelData.html'));
});
//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
