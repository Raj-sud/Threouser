const express = require('express'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const app = express(); 
app.use(bodyParser.json()); 
mongoose.connect('mongodb://localhost/threouser', { useNewUrlParser: true, useUnifiedTopology: true }); 
const userSchema = new mongoose.Schema({ 
    username: String, 
    password: String, 
    role: String // 'chef' or 'user'
     }); 
     const User = mongoose.model('User', userSchema); 
     app.post('/register', async (req, res) => { 
        const { username, password, role } = req.body; 
        const hashedPassword = await bcrypt.hash(password, 10); 
     const user = new User({ username, password: hashedPassword, role }); 
     await user.save(); 
     res.status(201).send('User registered'); 
     }); 
     
     app.post('/login', async (req, res) => { 
        const { username, password } = req.body; 
        const user = await User.findOne({ username }); 
        if (!user) { 
            return res.status(400).send('User not found');
         }
         const isPasswordValid = await bcrypt.compare(password, user.password); 
         if (!isPasswordValid) { 
            return res.status(400).send('Invalid password'); 
        } const token = jwt.sign({ userId: user._id, role: user.role }, 'secret_key'); 
        res.send({ token }); }); 
        app.get('/chef', authenticateToken, (req, res) => { 
            if (req.user.role !== 'chef') { 
                return res.status(403).send('Access denied'); 
            } 
            res.send('Welcome Chef'); 
        }); 
        app.get('/user', authenticateToken, (req, res) => {
             if (req.user.role !== 'user') { 
                return res.status(403).send('Access denied'); 
            } 
            res.send('Welcome User'); }); 
        function authenticateToken(req, res, next) { 
            const token = req.header('Authorization').replace('Bearer ', ''); 
            if (!token) { 
                return 
                res.status(401).send('Access denied'); 
            } 
        try { 
            const verified = jwt.verify(token, 'secret_key'); 
            req.user = verified; 
            next(); 
        } catch (err) { 
            res.status(400).send('Invalid token'); 
        } 
    } 
        app.listen(3000, () => { 
            console.log('Server is running on port 3000'); 

        });