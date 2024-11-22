const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
// const foodMenuRoutes = require("./routes/foodMenuRoutes");
// const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));  
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname)))


// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("Connected to MongoDB"))
// .catch((error) => console.error("MongoDB connection error:", error));

// Use the routes
// app.use("/food/menu", foodMenuRoutes);
// app.use("/api/auth",authRoutes);

mongoose.connect('mongodb://localhost:27017/loginApp', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','Welcome1.HTML'));
  });

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, firstName, lastName });

    try {
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});

// Login Endpoint (set JWT token in cookie)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    // Set the token in a secure, HttpOnly cookie
    res.cookie('auth_token', token, {
        httpOnly: true,  // Ensures the cookie can't be accessed via JavaScript
        secure: process.env.NODE_ENV === 'production',  // Set to true in production (requires HTTPS)
        maxAge: 60 * 60 * 1000  // 1 hour expiry
    });

    // Respond to the client
    res.send({ message: 'Logged in successfully' });
});

// Middleware to Authenticate Token from Cookies
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token; // Get the token from the cookies

    // Debug: Log the token and cookies to check if it's being sent correctly
    console.log("Token from cookies:", token);
    console.log("Cookies:", req.cookies);

    if (!token) {
        return res.status(401).send('Access denied: No token provided');
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;  // Attach the user to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.log("JWT Verification failed:", error);
        res.status(400).send('Invalid token');
    }
};

// Protected Route Example for /dashboard
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'chefdetails.html'));
});

// Serve the HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Welcome1.HTML'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chef Data', 'registration.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
