// C:\Users\ASUS\dream2build-backend\server.js

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { MongoClient, ObjectId } = require('mongodb'); // Import MongoClient and ObjectId

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key'; // CHANGE THIS IN PRODUCTION!
const MONGO_URI = process.env.MONGO_URI; // Get MongoDB URI from environment variables

// MongoDB Client and Database references
let db;
let usersCollection;
let historyCollection;
let pendingPaymentsCollection;
let rotationDataCollection;
let messagesCollection; // For contact admin messages

app.use(bodyParser.json());
app.use(cors());

// --- MongoDB Connection ---
async function connectDB() {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not defined in environment variables. Cannot connect to MongoDB.');
        process.exit(1); // Exit if no MongoDB URI
    }
    try {
        const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB Atlas!');
        db = client.db(); // Get the database instance (database name is in the URI)

        // Assign collections
        usersCollection = db.collection('users');
        historyCollection = db.collection('history');
        pendingPaymentsCollection = db.collection('pendingPayments');
        rotationDataCollection = db.collection('rotationData');
        messagesCollection = db.collection('messages'); // New collection for contact messages

        // Ensure default rotation data exists if not present
        const existingRotation = await rotationDataCollection.findOne({});
        if (!existingRotation) {
            await rotationDataCollection.insertOne({
                _id: new ObjectId('60c72b2f9b1e8b0015f8e8e8'), // Fixed ID for single rotation document
                participants: [],
                currentDay: 0,
                currentRecipientIndex: -1,
                dailyInvestmentAmount: 10
            });
            console.log('Default rotation data initialized.');
        }

    } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error);
        process.exit(1); // Exit process if database connection fails
    }
}

// --- History Logging Function (now uses MongoDB) ---
async function logHistory(type, description, details = {}) {
    const newEntry = {
        _id: new ObjectId(), // MongoDB generates _id automatically
        timestamp: new Date().toISOString(),
        type,
        description,
        details
    };
    await historyCollection.insertOne(newEntry);
}


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// Middleware to authorize leader role
const authorizeLeader = (req, res, next) => {
    if (req.user && (req.user.role === 'leader' || req.user.role === 'ceo')) { // CEO can also access leader functions
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Leader privileges required.' });
    }
};

// Middleware to authorize CEO role
const authorizeCEO = (req, res, next) => {
    if (req.user && req.user.role === 'ceo') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. CEO privileges required.' });
    }
};

// --- API Routes ---

app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running smoothly!', status: 'ok' });
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber, referralCode } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
    }

    // IMPORTANT: In a real app, hash the password using bcrypt before saving!
    const newUser = {
        _id: new ObjectId(), // MongoDB generates _id
        username,
        password, // Store hashed password in production!
        firstName,
        lastName,
        phoneNumber,
        referralCode: referralCode || null,
        role: 'user',
        isPaid: false,
        isActive: true,
        invest: 0,
        gain: 0,
        createdAt: new Date().toISOString()
    };

    await usersCollection.insertOne(newUser);
    await logHistory('User Registration', `New user registered: ${username}`, { userId: newUser._id.toString(), username: newUser.username });

    res.status(201).json({ message: 'User registered successfully!', user: { id: newUser._id.toString(), username: newUser.username, fullName: `${firstName} ${lastName}` } });
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await usersCollection.findOne({ username, password }); // Password not hashed!

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user._id.toString(), username: user.username, role: user.role || 'user' }, SECRET_KEY, { expiresIn: '1h' });
    await logHistory('User Login', `User logged in: ${username}`, { userId: user._id.toString(), username: user.username, role: user.role });

    res.json({
        message: 'Login successful!',
        token,
        role: user.role || 'user',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        invest: user.invest,
        gain: user.gain,
        referralCode: user.referralCode,
        isPaid: user.isPaid, // ADDED: Send isPaid status
        isActive: user.isActive // ADDED: Send isActive status
    });
});

// Submit Payment Info
app.post('/api/submit-payment', authenticateToken, async (req, res) => {
    const { email, method } = req.body;
    if (!email || !method) {
        return res.status(400).json({ message: 'Email and payment method are required.' });
    }

    // Check if a pending payment already exists for this user
    const existingPendingPayment = await pendingPaymentsCollection.findOne({ userId: req.user.id, status: 'Pending' });
    if (existingPendingPayment) {
        return res.status(409).json({ message: 'You already have a pending payment. Please wait for validation.' });
    }

    const newPayment = {
        _id: new ObjectId(),
        userId: new ObjectId(req.user.id), // Store as ObjectId
        userName: req.user.username,
        email: email,
        method: method,
        amount: 25, // Assuming a fixed amount for now
        status: 'Pending',
        timestamp: new Date().toISOString()
    };
    await pendingPaymentsCollection.insertOne(newPayment);
    await logHistory('Payment Submission', `User submitted payment intent: ${email} via ${method}`, { userId: req.user.id, paymentId: newPayment._id.toString(), method: method });

    res.json({ message: 'Payment information received. Awaiting validation by a team leader.' });
});

// Contact Admin
app.post('/api/contact-admin', async (req, res) => {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
        return res.status(400).json({ message: 'Email, subject, and message are required.' });
    }
    const newMessage = {
        _id: new ObjectId(),
        email,
        subject,
        message,
        read: false,
        timestamp: new Date().toISOString()
    };
    await messagesCollection.insertOne(newMessage);
    await logHistory('Contact Admin', `New message from ${email}`, { subject: subject, messageId: newMessage._id.toString() });
    res.json({ message: 'Your message has been sent to support.' });
});

// Leader Login
app.post('/api/leader-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required for leader login.' });
    }

    const leader = await usersCollection.findOne({ username, password, role: 'leader' });

    if (!leader) {
        return res.status(401).json({ message: 'Invalid credentials or not authorized as a leader.' });
    }

    const token = jwt.sign({ id: leader._id.toString(), username: leader.username, role: 'leader' }, SECRET_KEY, { expiresIn: '1h' });
    await logHistory('Leader Login', `Leader logged in: ${username}`, { leaderId: leader._id.toString(), username: leader.username });

    res.json({ message: 'Leader login successful!', token, role: 'leader', fullName: `${leader.firstName || ''} ${leader.lastName || ''}`.trim() || leader.username });
});

// Leader Registration (for self-registration)
app.post('/api/leader-register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required for leader registration.' });
    }

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered as a user or leader.' });
    }

    const newLeader = {
        _id: new ObjectId(),
        username,
        password, // Store hashed password in production!
        firstName,
        lastName,
        phoneNumber,
        role: 'leader',
        isPaid: true, // Leaders are typically considered paid/active
        isActive: true,
        invest: 0,
        gain: 0,
        createdAt: new Date().toISOString()
    };

    await usersCollection.insertOne(newLeader);
    await logHistory('Leader Registration', `New leader registered: ${username}`, { leaderId: newLeader._id.toString(), username: newLeader.username });

    res.status(201).json({ message: 'Leader registered successfully! You can now log in.' });
});


// CEO Login
app.post('/api/ceo-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required for CEO login.' });
    }

    if (username === process.env.CEO_EMAIL && password === process.env.CEO_PASSWORD) {
        const token = jwt.sign({ id: 'ceo_id', username: username, role: 'ceo' }, SECRET_KEY, { expiresIn: '1h' });
        await logHistory('CEO Login', `CEO logged in: ${username}`, { username: username });
        res.json({ message: 'CEO login successful!', token, role: 'ceo', fullName: 'CEO Admin' });
    } else {
        res.status(401).json({ message: 'Invalid CEO credentials.' });
    }
});

// Add New Admin (CEO Only)
app.post('/api/ceo/add-admin', authenticateToken, authorizeCEO, async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber, role = 'leader' } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required to add a new admin.' });
    }

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ message: 'Admin with this email already exists.' });
    }

    const newAdmin = {
        _id: new ObjectId(),
        username,
        password, // Store hashed password in production!
        firstName,
        lastName,
        phoneNumber,
        role: role,
        isPaid: true,
        isActive: true,
        invest: 0,
        gain: 0,
        createdAt: new Date().toISOString()
    };

    await usersCollection.insertOne(newAdmin);
    await logHistory('Admin Added', `New admin (${role}) added by CEO: ${username}`, { adminId: newAdmin._id.toString(), username: newAdmin.username, addedBy: req.user.username });

    res.status(201).json({ message: 'New admin added successfully!', admin: { id: newAdmin._id.toString(), username: newAdmin.username, fullName: `${firstName} ${lastName}` } });
});

// Get All Users (Admin/Leader Access)
app.get('/api/admin/users', authenticateToken, authorizeLeader, async (req, res) => {
    const users = await usersCollection.find({}).project({ password: 0 }).toArray(); // Exclude password
    res.json(users.map(user => ({ ...user, id: user._id.toString() }))); // Convert _id to id for frontend
});

// Toggle User Status (Admin/Leader Access)
app.put('/api/admin/users/:userId/status', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean.' });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isActive: isActive } }
    );

    if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'User status not changed.' });
    }

    await logHistory('User Status Update', `User ${user.username} status changed from ${user.isActive} to ${isActive}`, { userId, changedBy: req.user.username });

    res.json({ message: `User status updated to ${isActive ? 'active' : 'inactive'}.` });
});

// Toggle User Payment Status (Admin/Leader Access)
app.put('/api/admin/users/:userId/payment-status', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;
    const { isPaid } = req.body;

    if (typeof isPaid !== 'boolean') {
        return res.status(400).json({ message: 'isPaid must be a boolean.' });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isPaid: isPaid } }
    );

    if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'User payment status not changed.' });
    }

    await logHistory('User Payment Status Update', `User ${user.username} payment status changed from ${user.isPaid ? 'Paid' : 'Unpaid'} to ${isPaid ? 'Paid' : 'Unpaid'}`, { userId, changedBy: req.user.username });

    res.json({ message: `User payment status updated to ${isPaid ? 'paid' : 'unpaid'}.` });
});

// Delete User (Admin/Leader Access)
app.delete('/api/admin/users/:userId', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;

    const userToDelete = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!userToDelete) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found or could not be deleted.' });
    }

    await logHistory('User Deletion', `User deleted: ${userToDelete.username}`, { userId, deletedBy: req.user.username });

    res.json({ message: 'User deleted successfully.' });
});

// Get Pending Payments (Leader Access)
app.get('/api/leader/pending-payments', authenticateToken, authorizeLeader, async (req, res) => {
    const pendingPayments = await pendingPaymentsCollection.find({ status: 'Pending' }).toArray();
    res.json(pendingPayments.map(p => ({ ...p, id: p._id.toString(), userId: p.userId.toString() }))); // Convert _id to id
});

// Validate Payment (Leader Access)
app.post('/api/leader/validate-payment', authenticateToken, authorizeLeader, async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    const payment = await pendingPaymentsCollection.findOne({ _id: new ObjectId(paymentId), status: 'Pending' });
    if (!payment) {
        return res.status(404).json({ message: 'Pending payment not found or already processed.' });
    }

    // Update payment status
    await pendingPaymentsCollection.updateOne(
        { _id: new ObjectId(paymentId) },
        { $set: { status: 'Validated', validatedBy: req.user.username, validationTimestamp: new Date().toISOString() } }
    );

    // Update user's isPaid status
    const userUpdateResult = await usersCollection.updateOne(
        { _id: new ObjectId(payment.userId) },
        { $set: { isPaid: true } }
    );

    if (userUpdateResult.modifiedCount === 0) {
        console.warn(`User ${payment.userId} not found for payment ${payment._id.toString()} during validation.`);
        await logHistory('User Payment Validated (User Not Found)', `Payment for ${payment.userName} (${payment.amount}$) validated by ${req.user.username}, but user not found.`, { userId: payment.userId.toString(), paymentId: payment._id.toString() });
    } else {
        await logHistory('User Payment Validated', `Payment for ${payment.userName} (${payment.amount}$) validated by ${req.user.username}`, { userId: payment.userId.toString(), paymentId: payment._id.toString() });
    }

    res.json({ message: 'Payment validated successfully!' });
});

// Reject Payment (Leader Access)
app.post('/api/leader/reject-payment', authenticateToken, authorizeLeader, async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    const payment = await pendingPaymentsCollection.findOne({ _id: new ObjectId(paymentId), status: 'Pending' });
    if (!payment) {
        return res.status(404).json({ message: 'Pending payment not found or already processed.' });
    }

    await pendingPaymentsCollection.updateOne(
        { _id: new ObjectId(paymentId) },
        { $set: { status: 'Rejected', rejectedBy: req.user.username, rejectionTimestamp: new Date().toISOString() } }
    );

    await logHistory('User Payment Rejected', `Payment for ${payment.userName} (${payment.amount}$) rejected by ${req.user.username}`, { userId: payment.userId.toString(), paymentId: payment._id.toString() });

    res.json({ message: 'Payment rejected successfully.' });
});

// Rotation Management (Leader/CEO Access)
const ROTATION_DOC_ID = new ObjectId('60c72b2f9b1e8b0015f8e8e8'); // Fixed ID for the single rotation document

app.get('/api/rotation/data', authenticateToken, authorizeLeader, async (req, res) => {
    const rotationData = await rotationDataCollection.findOne({ _id: ROTATION_DOC_ID });
    if (!rotationData) {
        return res.status(404).json({ message: 'Rotation data not found.' });
    }
    // Ensure participants array is always present
    rotationData.participants = rotationData.participants || [];
    res.json({ ...rotationData, _id: rotationData._id.toString() });
});

app.put('/api/rotation/settings', authenticateToken, authorizeLeader, async (req, res) => {
    const { dailyInvestmentAmount } = req.body;
    if (isNaN(dailyInvestmentAmount) || dailyInvestmentAmount <= 0) {
        return res.status(400).json({ message: 'Daily investment must be a positive number.' });
    }

    const result = await rotationDataCollection.updateOne(
        { _id: ROTATION_DOC_ID },
        { $set: { dailyInvestmentAmount: dailyInvestmentAmount } }
    );

    if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'Rotation settings not changed or document not found.' });
    }

    await logHistory('Rotation Settings Update', `Daily investment updated to ${dailyInvestmentAmount}$ by ${req.user.username}`, { updatedBy: req.user.username, amount: dailyInvestmentAmount });

    res.json({ message: 'Rotation settings updated successfully!' });
});

app.post('/api/rotation/participants', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId, username, fullName } = req.body;
    if (!userId || !username || !fullName) {
        return res.status(400).json({ message: 'Participant details are required.' });
    }

    const rotationData = await rotationDataCollection.findOne({ _id: ROTATION_DOC_ID });
    if (!rotationData) {
        return res.status(404).json({ message: 'Rotation data document not found.' });
    }

    if (rotationData.participants && rotationData.participants.some(p => p.id === userId)) {
        return res.status(409).json({ message: 'Participant already in rotation.' });
    }

    const newParticipant = { id: userId, username, fullName }; // Store userId as string for now
    await rotationDataCollection.updateOne(
        { _id: ROTATION_DOC_ID },
        { $push: { participants: newParticipant } }
    );

    await logHistory('Rotation Participant Added', `Participant ${fullName} added to rotation by ${req.user.username}`, { userId, addedBy: req.user.username });

    res.status(201).json({ message: 'Participant added to rotation successfully!' });
});

app.post('/api/rotation/next', authenticateToken, authorizeLeader, async (req, res) => {
    let rotationData = await rotationDataCollection.findOne({ _id: ROTATION_DOC_ID });

    if (!rotationData || !rotationData.participants || rotationData.participants.length === 0) {
        return res.status(400).json({ message: 'No participants in rotation to advance.' });
    }

    rotationData.currentDay = (rotationData.currentDay || 0) + 1;
    rotationData.currentRecipientIndex = (rotationData.currentRecipientIndex + 1) % rotationData.participants.length;
    const currentRecipient = rotationData.participants[rotationData.currentRecipientIndex];

    const totalPool = rotationData.participants.length * (rotationData.dailyInvestmentAmount || 10);
    const recipientGain = totalPool; // For simplicity, recipient gets the whole pool

    // Update recipient's gain in users collection
    const userUpdateResult = await usersCollection.updateOne(
        { _id: new ObjectId(currentRecipient.id) },
        { $inc: { gain: recipientGain } } // Increment gain
    );

    if (userUpdateResult.modifiedCount === 0) {
        console.warn(`Recipient user ${currentRecipient.id} not found in users collection during gain distribution.`);
    }

    // Update rotation data in database
    await rotationDataCollection.updateOne(
        { _id: ROTATION_DOC_ID },
        { $set: {
            currentDay: rotationData.currentDay,
            currentRecipientIndex: rotationData.currentRecipientIndex
        }}
    );

    await logHistory('Rotation Advance', `Day ${rotationData.currentDay}: ${currentRecipient.fullName || currentRecipient.username} received ${recipientGain}$`, {
        day: rotationData.currentDay,
        recipientId: currentRecipient.id,
        recipientName: currentRecipient.fullName || currentRecipient.username,
        gain: recipientGain,
        advancedBy: req.user.username
    });

    res.json({
        message: `Rotation advanced. Day ${rotationData.currentDay}: ${currentRecipient.fullName || currentRecipient.username} receives $${recipientGain.toFixed(2)}!`,
        rotationData: rotationData
    });
});


// Get User Messages (Leader Access)
app.get('/api/leader/messages', authenticateToken, authorizeLeader, async (req, res) => {
    const messages = await messagesCollection.find({}).toArray();
    res.json(messages.map(msg => ({ ...msg, id: msg._id.toString() })));
});

// Mark Message as Read (Leader Access)
app.put('/api/leader/messages/:messageId/read', authenticateToken, authorizeLeader, async (req, res) => {
    const { messageId } = req.params;
    const result = await messagesCollection.updateOne(
        { _id: new ObjectId(messageId) },
        { $set: { read: true } }
    );
    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Message not found or already marked as read.' });
    }
    await logHistory('Message Read', `Message ${messageId} marked as read by ${req.user.username}`, { messageId, markedBy: req.user.username });
    res.json({ message: 'Message marked as read.' });
});


// CEO Specific History Endpoints
app.get('/api/ceo/rotation-history', authenticateToken, authorizeCEO, async (req, res) => {
    const rotationHistory = await historyCollection.find({ type: 'Rotation Advance' }).sort({ timestamp: -1 }).limit(25).toArray();
    res.json(rotationHistory.map(entry => ({ ...entry, id: entry._id.toString() })));
});

app.get('/api/ceo/admin-history', authenticateToken, authorizeCEO, async (req, res) => {
    const adminActions = await historyCollection.find({
        type: {
            $in: [
                'User Status Update',
                'User Payment Status Update',
                'User Deletion',
                'Admin Added',
                'Rotation Settings Update',
                'Rotation Participant Added',
                'User Payment Validated',
                'User Payment Rejected',
                'Message Read' // Include message read actions
            ]
        }
    }).sort({ timestamp: -1 }).toArray();
    res.json(adminActions.map(entry => ({ ...entry, id: entry._id.toString() })));
});

// NEW: General History Endpoint for CEO
app.get('/api/ceo/general-history', authenticateToken, authorizeCEO, async (req, res) => {
    const history = await historyCollection.find({}).sort({ timestamp: -1 }).toArray(); // Get all history, sorted by latest
    res.json(history.map(entry => ({ ...entry, id: entry._id.toString() }))); // Return all history for the CEO
});


// --- Error Handling Middleware ---

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint Not Found',
        path: req.originalUrl,
        method: req.method
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// Connect to DB and then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Backend ready. Ensure your frontend is pointing to this address.');
    });
}).catch(err => {
    console.error('Failed to connect to database or start server:', err);
    process.exit(1);
});
