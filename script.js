// C:\Users\ASUS\dream2build-backend\server.js

require('dotenv').config(); // ✅ Chargement des variables depuis le fichier .env

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Import the loadAllData function from your dataLoader.js file.
// This assumes dataLoader.js is directly inside your 'data' folder.
const { loadAllData } = require('./data/dataLoader');

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key'; // Use a strong, unique key in production!

app.use(bodyParser.json());
app.use(cors()); // Enables CORS for all origins - restrict in production for security!

// Define your static files directory (if you have one, e.g., for a frontend build)
// app.use(express.static(path.join(__dirname, 'public')));

// Define file paths for JSON data storage
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json'); // For support messages
const ROTATION_HISTORY_FILE = path.join(DATA_DIR, 'rotationHistory.json'); // For CEO rotation history
const ADMIN_ACTIVITY_FILE = path.join(DATA_DIR, 'adminActivity.json'); // For admin actions and general system history
const ROTATION_DATA_FILE = path.join(DATA_DIR, 'rotationData.json'); // For current rotation state
const PENDING_PAYMENTS_FILE = path.join(DATA_DIR, 'pendingPayments.json'); // For pending payments

// Helper function to read JSON files
async function readJsonFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return default value (e.g., empty array)
            return defaultValue;
        }
        // Re-throw other errors for proper handling
        throw error;
    }
}

// Helper function to write JSON files
async function writeJsonFile(filePath, data) {
    // Ensure the data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


// --- Middleware to verify JWT token (for protected routes) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            // Return 403 for invalid/expired tokens
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user payload (id, username, role) to request
        next();
    });
};

// --- Define your API routes here ---

// Basic status endpoint
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running smoothly!', status: 'ok' });
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber, referralCode } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields (username, password, first name, last name, phone number) are required for registration.' });
    }

    try {
        let users = await readJsonFile(USERS_FILE);

        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // In a real application, you MUST hash the password using bcrypt before storing!
        const newUser = {
            id: uuidv4(),
            username,
            password, // WARNING: Store hashed passwords in production!
            firstName,
            lastName,
            phoneNumber,
            referralCode: referralCode || null, // Allow optional referral code
            role: 'user',
            isPaid: false, // Default to unpaid
            isActive: true, // Default to active, but payment validation can change this
            invest: 0,
            gain: 0
        };
        users.push(newUser);
        await writeJsonFile(USERS_FILE, users);

        res.status(201).json({ message: 'User registered successfully!', user: { id: newUser.id, username: newUser.username, fullName: `${firstName} ${lastName}` } });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const users = await readJsonFile(USERS_FILE);
        const user = users.find(u => u.username === username && u.password === password); // WARNING: Compare hashed passwords in production!

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // JWT token expires in 7 days
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role || 'user' }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            message: 'Login successful!',
            token,
            role: user.role || 'user',
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            isPaid: user.isPaid,
            isActive: user.isActive,
            invest: user.invest || 0,
            gain: user.gain || 0,
            referralCode: user.referralCode
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// Submit Payment Info (User side)
app.post('/api/submit-payment', authenticateToken, async (req, res) => {
    const { email, method } = req.body;
    if (!email || !method) {
        return res.status(400).json({ message: 'Email and payment method are required.' });
    }

    try {
        let pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
        const newPayment = {
            id: uuidv4(),
            userId: req.user.id,
            userName: req.user.username, // User's username (email)
            email: email,
            method: method,
            amount: 25, // Hardcoded payment amount for initial setup
            status: 'Pending',
            timestamp: new Date().toISOString()
        };
        pendingPayments.push(newPayment);
        await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Payment Submitted',
            description: `User ${req.user.username} submitted payment via ${method}.`,
            details: { userId: req.user.id, email, method, amount: 25, status: 'Pending' }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'Payment information received. Awaiting validation by a team leader.' });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ message: 'Server error submitting payment.', error: error.message });
    }
});

// Contact Admin (User side) - Messages sent here appear on Leader/CEO dashboards
app.post('/api/contact-admin', async (req, res) => {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
        return res.status(400).json({ message: 'Email, subject, and message are required.' });
    }

    try {
        let messages = await readJsonFile(MESSAGES_FILE);
        const newMessage = {
            id: uuidv4(),
            email,
            subject,
            message,
            timestamp: new Date().toISOString(),
            read: false // New messages are unread by default
        };
        messages.push(newMessage);
        await writeJsonFile(MESSAGES_FILE, messages);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Support Message Received',
            description: `New support message from ${email} (Subject: ${subject}).`,
            details: { email, subject, message }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        console.log(`New message from ${email} - Subject: ${subject} - Message: ${message}`);
        res.json({ message: 'Your message has been sent to support.' });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ message: 'Server error sending contact message.', error: error.message });
    }
});

// Leader Registration
app.post('/api/leader-register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required for leader registration.' });
    }

    try {
        let users = await readJsonFile(USERS_FILE);

        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: 'Leader with this email already exists.' });
        }

        // In a real application, you MUST hash the password using bcrypt before storing!
        const newLeader = {
            id: uuidv4(),
            username,
            password, // WARNING: Store hashed passwords in production!
            firstName,
            lastName,
            phoneNumber,
            role: 'leader', // Explicitly set role to 'leader'
            isPaid: true, // Leaders are generally considered paid/active by default
            isActive: true,
            invest: 0, // Leaders typically don't 'invest' in the same way as users
            gain: 0
        };

        users.push(newLeader);
        await writeJsonFile(USERS_FILE, users);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'New Leader Registered',
            description: `New leader registered: ${firstName} ${lastName} (${username}).`,
            details: { leaderId: newLeader.id, username }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.status(201).json({ message: 'Leader registered successfully!', leader: { id: newLeader.id, username: newLeader.username, fullName: `${firstName} ${lastName}` } });

    } catch (error) {
        console.error('Error during leader registration:', error);
        res.status(500).json({ message: 'Server error during leader registration.', error: error.message });
    }
});

// Leader Login
app.post('/api/leader-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required for leader login.' });
    }

    try {
        const users = await readJsonFile(USERS_FILE);
        const leader = users.find(u => u.username === username && u.password === password && u.role === 'leader');

        if (!leader) {
            return res.status(401).json({ message: 'Invalid credentials or not authorized as a leader.' });
        }

        // JWT token expires in 7 days
        const token = jwt.sign({ id: leader.id, username: leader.username, role: 'leader' }, SECRET_KEY, { expiresIn: '7d' });

        res.json({ message: 'Leader login successful!', token, role: 'leader', fullName: `${leader.firstName || ''} ${leader.lastName || ''}`.trim() || leader.username });

    } catch (error) {
        console.error('Error during leader login:', error);
        res.status(500).json({ message: 'Server error during leader login.', error: error.message });
    }
});

// CEO Login
app.post('/api/ceo-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required for CEO login.' });
    }

    // WARNING: For a real application, CEO credentials should be stored securely
    // in a database and compared using hashing (like bcrypt), not hardcoded.
    // Ensure CEO_EMAIL and CEO_PASSWORD are set in your .env file for testing.
    if (username === process.env.CEO_EMAIL && password === process.env.CEO_PASSWORD) {
        // JWT token expires in 7 days
        const token = jwt.sign({ id: 'ceo_id', username: username, role: 'ceo' }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ message: 'CEO login successful!', token, role: 'ceo', fullName: 'CEO Admin' });
    } else {
        res.status(401).json({ message: 'Invalid CEO credentials.' });
    }
});

// Add New Admin (FOR CEO ONLY)
app.post('/api/ceo/add-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only CEO can add new admins.' });
    }

    const { username, password, firstName, lastName, phoneNumber, role = 'leader' } = req.body; // Default new admin to 'leader' role
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields (username, password, first name, last name, phone number) are required for new admin.' });
    }

    try {
        let users = await readJsonFile(USERS_FILE);

        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }

        // In a real application, you MUST hash the password using bcrypt before storing!
        const newAdmin = {
            id: uuidv4(),
            username,
            password, // WARNING: Store hashed passwords in production!
            firstName,
            lastName,
            phoneNumber,
            role: role,
            isPaid: true, // Admins/Leaders are generally considered paid/active
            isActive: true
        };

        users.push(newAdmin);
        await writeJsonFile(USERS_FILE, users);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'New Admin Added',
            description: `CEO ${req.user.username} added new admin: ${firstName} ${lastName} (${username}).`,
            details: { adminId: newAdmin.id, username, role }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.status(201).json({ message: 'New admin added successfully!', admin: { id: newAdmin.id, username: newAdmin.username, fullName: `${firstName} ${lastName}` } });

    } catch (error) {
        console.error('Error adding new admin:', error);
        res.status(500).json({ message: 'Server error when adding new admin.', error: error.message });
    }
});

// Leader: Fetch Pending Payments
app.get('/api/leader/pending-payments', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied. Only leaders can view pending payments.' });
    }
    try {
        const pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
        res.json(pendingPayments.filter(p => p.status === 'Pending'));
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({ message: 'Server error fetching pending payments.', error: error.message });
    }
});

// Leader: Validate Payment
app.post('/api/leader/validate-payment', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied. Only leaders can validate payments.' });
    }
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    try {
        let pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
        const paymentIndex = pendingPayments.findIndex(p => p.id === paymentId && p.status === 'Pending');

        if (paymentIndex === -1) {
            return res.status(404).json({ message: 'Pending payment not found or already processed.' });
        }

        pendingPayments[paymentIndex].status = 'Validated';
        await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);

        // Update user's isPaid status and add to invest/gain
        let users = await readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === pendingPayments[paymentIndex].userId);

        if (userIndex !== -1) {
            users[userIndex].isPaid = true;
            users[userIndex].isActive = true; // Also activate user on payment validation
            users[userIndex].invest = (users[userIndex].invest || 0) + pendingPayments[paymentIndex].amount; // Add to invested amount
            await writeJsonFile(USERS_FILE, users);
        }

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Payment Validated',
            description: `Leader ${req.user.username} validated payment for ${pendingPayments[paymentIndex].userName}.`,
            details: { paymentId, userId: pendingPayments[paymentIndex].userId, amount: pendingPayments[paymentIndex].amount }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'Payment validated successfully!' });
    } catch (error) {
        console.error('Error validating payment:', error);
        res.status(500).json({ message: 'Server error validating payment.', error: error.message });
    }
});

// Leader: Reject Payment
app.post('/api/leader/reject-payment', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied. Only leaders can reject payments.' });
    }
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    try {
        let pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
        const paymentIndex = pendingPayments.findIndex(p => p.id === paymentId && p.status === 'Pending');

        if (paymentIndex === -1) {
            return res.status(404).json({ message: 'Pending payment not found or already processed.' });
        }

        pendingPayments[paymentIndex].status = 'Rejected';
        await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Payment Rejected',
            description: `Leader ${req.user.username} rejected payment for ${pendingPayments[paymentIndex].userName}.`,
            details: { paymentId, userId: pendingPayments[paymentIndex].userId }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'Payment rejected successfully!' });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: 'Server error rejecting payment.', error: error.message });
    }
});


// Leader: Fetch User Messages (Support Messages)
app.get('/api/leader/messages', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied. Only leaders can view messages.' });
    }
    try {
        const messages = await readJsonFile(MESSAGES_FILE);
        res.json(messages); // Return all messages for leaders to manage
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages.', error: error.message });
    }
});

// Leader: Mark Message as Read
app.put('/api/leader/messages/:id/read', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied. Only leaders can mark messages as read.' });
    }
    const messageId = req.params.id;

    try {
        let messages = await readJsonFile(MESSAGES_FILE);
        const messageIndex = messages.findIndex(m => m.id === messageId);

        if (messageIndex === -1) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        messages[messageIndex].read = true; // Mark as read
        await writeJsonFile(MESSAGES_FILE, messages);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Message Marked Read',
            description: `Leader ${req.user.username} marked message ${messageId} from ${messages[messageIndex].email} as read.`,
            details: { messageId, senderEmail: messages[messageIndex].email }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'Message marked as read successfully!' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ message: 'Server error marking message as read.', error: error.message });
    }
});

// Leader/CEO: Fetch All Users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can view users.' });
    }
    try {
        const users = await readJsonFile(USERS_FILE);
        // Exclude sensitive data like password before sending to frontend
        const safeUsers = users.map(({ password, ...rest }) => rest);
        res.json(safeUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
});

// Leader/CEO: Toggle User Status (Active/Inactive)
app.put('/api/admin/users/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can change user status.' });
    }
    const userId = req.params.id;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive (boolean) is required.' });
    }

    try {
        let users = await readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        users[userIndex].isActive = isActive;
        await writeJsonFile(USERS_FILE, users);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'User Status Update',
            description: `${req.user.role} ${req.user.username} changed status of ${users[userIndex].username} to ${isActive ? 'Active' : 'Inactive'}.`,
            details: { userId, isActive }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: `User status updated to ${isActive ? 'active' : 'inactive'}!` });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ message: 'Server error toggling user status.', error: error.message });
    }
});

// Leader/CEO: Toggle User Payment Status
app.put('/api/admin/users/:id/payment-status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can change user payment status.' });
    }
    const userId = req.params.id;
    const { isPaid } = req.body;
    if (typeof isPaid !== 'boolean') {
        return res.status(400).json({ message: 'isPaid (boolean) is required.' });
    }

    try {
        let users = await readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        users[userIndex].isPaid = isPaid;
        await writeJsonFile(USERS_FILE, users);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'User Payment Status Update',
            description: `${req.user.role} ${req.user.username} changed payment status of ${users[userIndex].username} to ${isPaid ? 'Paid' : 'Unpaid'}.`,
            details: { userId, isPaid }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: `User payment status updated to ${isPaid ? 'paid' : 'unpaid'}!` });
    } catch (error) {
        console.error('Error toggling user payment status:', error);
        res.status(500).json({ message: 'Server error toggling user payment status.', error: error.message });
    }
});

// Leader/CEO: Delete User
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can delete users.' });
    }
    const userId = req.params.id;

    try {
        let users = await readJsonFile(USERS_FILE);
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);

        if (users.length === initialLength) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await writeJsonFile(USERS_FILE, users);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'User Deleted',
            description: `${req.user.role} ${req.user.username} deleted user with ID ${userId}.`,
            details: { userId }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
});

// Leader: Get Rotation Data
app.get('/api/rotation/data', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can view rotation data.' });
    }
    try {
        // Provide default structure if file doesn't exist
        const rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [], currentDay: 0, currentRecipientIndex: -1, dailyInvestmentAmount: 10 });
        res.json(rotationData);
    } catch (error) {
        console.error('Error fetching rotation data:', error);
        res.status(500).json({ message: 'Server error fetching rotation data.', error: error.message });
    }
});

// Leader: Save Rotation Settings
app.put('/api/rotation/settings', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can update rotation settings.' });
    }
    const { dailyInvestmentAmount } = req.body;
    if (typeof dailyInvestmentAmount !== 'number' || dailyInvestmentAmount <= 0) {
        return res.status(400).json({ message: 'Daily investment amount must be a positive number.' });
    }

    try {
        let rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [], currentDay: 0, currentRecipientIndex: -1, dailyInvestmentAmount: 10 });
        rotationData.dailyInvestmentAmount = dailyInvestmentAmount;
        await writeJsonFile(ROTATION_DATA_FILE, rotationData);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Rotation Settings Update',
            description: `${req.user.role} ${req.user.username} updated daily investment to $${dailyInvestmentAmount}.`,
            details: { dailyInvestmentAmount }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: 'Rotation settings updated successfully!' });
    } catch (error) {
        console.error('Error saving rotation settings:', error);
        res.status(500).json({ message: 'Server error saving rotation settings.', error: error.message });
    }
});

// Leader: Add Participant to Rotation
app.post('/api/rotation/participants', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can add rotation participants.' });
    }
    const { userId, username, fullName } = req.body;
    if (!userId || !username || !fullName) {
        return res.status(400).json({ message: 'User ID, username, and full name are required to add a participant.' });
    }

    try {
        let rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [], currentDay: 0, currentRecipientIndex: -1, dailyInvestmentAmount: 10 });

        if (rotationData.participants.some(p => p.id === userId)) {
            return res.status(409).json({ message: 'Participant is already in the rotation.' });
        }

        const newParticipant = { id: userId, username, fullName };
        rotationData.participants.push(newParticipant);
        await writeJsonFile(ROTATION_DATA_FILE, rotationData);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Participant Added to Rotation',
            description: `${req.user.role} ${req.user.username} added ${fullName} to rotation.`,
            details: { userId, fullName }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: `${fullName} added to rotation!` });
    } catch (error) {
        console.error('Error adding participant to rotation:', error);
        res.status(500).json({ message: 'Server error adding participant to rotation.', error: error.message });
    }
});

// Leader: Advance Rotation to Next Participant
app.post('/api/rotation/next', authenticateToken, async (req, res) => {
    if (req.user.role !== 'leader' && req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only leaders and CEO can advance rotation.' });
    }

    try {
        let rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [], currentDay: 0, currentRecipientIndex: -1, dailyInvestmentAmount: 10 });
        let users = await readJsonFile(USERS_FILE);
        let rotationHistory = await readJsonFile(ROTATION_HISTORY_FILE);

        if (rotationData.participants.length === 0) {
            return res.status(400).json({ message: 'No participants in rotation to advance.' });
        }

        rotationData.currentDay++;
        rotationData.currentRecipientIndex = (rotationData.currentRecipientIndex + 1) % rotationData.participants.length;
        const currentRecipient = rotationData.participants[rotationData.currentRecipientIndex];

        const totalPool = rotationData.participants.length * rotationData.dailyInvestmentAmount;
        const recipientGain = totalPool; // Recipient gets the whole pool

        // Update recipient's gain
        const recipientUserIndex = users.findIndex(u => u.id === currentRecipient.id);
        if (recipientUserIndex !== -1) {
            users[recipientUserIndex].gain = (users[recipientUserIndex].gain || 0) + recipientGain;
            await writeJsonFile(USERS_FILE, users);
        }

        // Add to rotation history
        rotationHistory.push({
            id: uuidv4(),
            day: rotationData.currentDay,
            recipient: currentRecipient.fullName || currentRecipient.username,
            invest: rotationData.dailyInvestmentAmount,
            totalPool: totalPool,
            gain: recipientGain,
            timestamp: new Date().toISOString()
        });
        await writeJsonFile(ROTATION_HISTORY_FILE, rotationHistory);
        await writeJsonFile(ROTATION_DATA_FILE, rotationData);

        // Log this action for general history (visible to CEO)
        let generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        generalHistory.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'Rotation Advanced',
            description: `${req.user.role} ${req.user.username} advanced rotation. Day ${rotationData.currentDay}, ${currentRecipient.fullName} received $${recipientGain.toFixed(2)}.`,
            details: { day: rotationData.currentDay, recipientId: currentRecipient.id, gain: recipientGain }
        });
        await writeJsonFile(ADMIN_ACTIVITY_FILE, generalHistory);

        res.json({ message: `Day ${rotationData.currentDay}: ${currentRecipient.fullName || currentRecipient.username} receives $${recipientGain.toFixed(2)}!`, rotationData });
    } catch (error) {
        console.error('Error advancing rotation:', error);
        res.status(500).json({ message: 'Server error advancing rotation.', error: error.message });
    }
});


// CEO: Fetch Rotation History
app.get('/api/ceo/rotation-history', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only CEO can view rotation history.' });
    }
    try {
        const history = await readJsonFile(ROTATION_HISTORY_FILE);
        res.json(history);
    } catch (error) {
        console.error('Error fetching CEO rotation history:', error);
        res.status(500).json({ message: 'Server error fetching CEO rotation history.', error: error.message });
    }
});

// CEO: Fetch Admin Activity History (Excludes support messages, focuses on admin actions)
app.get('/api/ceo/admin-history', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only CEO can view admin activity history.' });
    }
    try {
        const history = await readJsonFile(ADMIN_ACTIVITY_FILE);
        // Filter out support messages to keep this focused on admin-initiated actions
        res.json(history.filter(entry => entry.type !== 'Support Message Received'));
    } catch (error) {
        console.error('Error fetching admin history:', error);
        res.status(500).json({ message: 'Server error fetching admin history.', error: error.message });
    }
});

// CEO: Fetch General System History (Includes support messages and all admin activities)
app.get('/api/ceo/general-history', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ceo') {
        return res.status(403).json({ message: 'Access denied. Only CEO can view general system history.' });
    }
    try {
        const generalHistory = await readJsonFile(ADMIN_ACTIVITY_FILE);
        const messages = await readJsonFile(MESSAGES_FILE);

        // Combine admin activities and support messages into a single history feed
        const combinedHistory = [
            ...generalHistory,
            ...messages.map(msg => ({
                id: msg.id,
                timestamp: msg.timestamp,
                type: 'Support Message',
                description: `Message from ${msg.email}: ${msg.subject}`,
                details: { message: msg.message, read: msg.read } // Include full message for CEO
            }))
        ];

        // Sort by timestamp descending (most recent first)
        combinedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(combinedHistory);
    } catch (error) {
        console.error('Error fetching general history:', error);
        res.status(500).json({ message: 'Server error fetching general history.', error: error.message });
    }
});


// --- END OF YOUR API ROUTES ---


// --- START OF ERROR HANDLING MIDDLEWARE ---

// 404 Not Found Handler: This middleware will catch any requests that don't match existing routes.
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint Not Found',
        path: req.originalUrl,
        method: req.method
    });
});

// General Error Handler: This catches any errors thrown by your routes or other middleware.
// It should be the last middleware in your chain.
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.statusCode || 500).json({
        message: err.message || 'An unexpected error occurred',
        // Only provide stack trace in development environment for security
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// --- END OF ERROR HANDLING MIDDLEWARE ---


// Start the server only after initial data is loaded
loadAllData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Backend ready. Ensure your frontend is pointing to this address.');
    });
}).catch(err => {
    console.error('Failed to load initial data or start server:', err);
    process.exit(1); // Exit the process if critical initial data loading fails
});
