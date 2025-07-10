const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const fs = require('fs').promises; // Node.js file system promises API
const path = require('path'); // For resolving file paths

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key'; // Replace with a strong, random secret key in production!

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins (for development)

// --- File Paths for Persistent Storage ---
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const ROTATION_SETTINGS_FILE = path.join(DATA_DIR, 'rotationSettings.json');
const ROTATION_PARTICIPANTS_FILE = path.join(DATA_DIR, 'rotationParticipants.json');
const ROTATION_HISTORY_FILE = path.join(DATA_DIR, 'rotationHistory.json');
const ADMIN_HISTORY_FILE = path.join(DATA_DIR, 'adminHistory.json');
const REFERRAL_CODES_FILE = path.join(DATA_DIR, 'referralCodes.json');

// --- In-memory Data Storage (will be loaded from/saved to files) ---
let users = [];
let messages = [];
let rotationSettings = {
    currentDay: 0,
    invest: 10, // Default individual investment
    lastPaidMemberIndex: -1 // Index of the last member who received payment
};
let rotationParticipants = []; // Users who are active in the rotation
let rotationHistory = []; // History of rotation payouts
let adminHistory = []; // History of admin actions
let referralCodes = []; // Store generated referral codes

// --- Helper Functions for File Operations ---
async function ensureDataDirectory() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Data directory '${DATA_DIR}' ensured.`);
    } catch (error) {
        console.error(`Error ensuring data directory '${DATA_DIR}':`, error);
    }
}

async function readJsonFile(filePath, defaultValue) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // File not found
            console.warn(`File not found: ${filePath}. Initializing with default value.`);
            return defaultValue;
        }
        console.error(`Error reading file ${filePath}:`, error);
        return defaultValue;
    }
}

async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
    }
}

// --- Load Data on Server Start-up ---
async function loadAllData() {
    await ensureDataDirectory();
    users = await readJsonFile(USERS_FILE, []);
    messages = await readJsonFile(MESSAGES_FILE, []);
    rotationSettings = await readJsonFile(ROTATION_SETTINGS_FILE, { currentDay: 0, invest: 10, lastPaidMemberIndex: -1 });
    rotationParticipants = await readJsonFile(ROTATION_PARTICIPANTS_FILE, []);
    rotationHistory = await readJsonFile(ROTATION_HISTORY_FILE, []);
    adminHistory = await readJsonFile(ADMIN_HISTORY_FILE, []);
    referralCodes = await readJsonFile(REFERRAL_CODES_FILE, []);
    console.log('All data loaded from files.');
    // Ensure admin user exists for initial access
    ensureInitialAdmin();
}

// --- Ensure Initial Admin User ---
function ensureInitialAdmin() {
    const adminEmail = 'admin@dream2build.com';
    const adminPassword = 'adminpassword'; // In a real app, hash this!
    if (!users.find(user => user.email === adminEmail && user.role === 'ceo')) {
        const newAdmin = {
            id: uuidv4(),
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            phoneNumber: '+1234567890',
            email: adminEmail,
            password: adminPassword, // Plain text for demo, HASH IN PRODUCTION!
            role: 'ceo', // 'ceo' or 'leader'
            adminLevel: 'superAdmin', // 'superAdmin' for CEO, 'teamLeader' for leader
            isPaid: true, // Admins are considered paid
            status: 'active', // 'active' or 'inactive'
            referralCode: null,
            referredBy: null,
            invest: 0, // Admins don't participate in rotation as users
            gain: 0,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        users.push(newAdmin);
        writeJsonFile(USERS_FILE, users);
        console.log('Initial CEO admin user created.');
        addAdminHistory('System', 'Initial CEO Admin Created', { email: adminEmail });
    }
}

// --- Admin History Logging ---
async function addAdminHistory(actor, type, details) {
    adminHistory.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        actor: actor, // e.g., "System", "Admin User ID/Email"
        type: type, // e.g., "User Status Change", "Payment Validation", "Rotation Event"
        description: `${actor} performed: ${type}`,
        details: details
    });
    await writeJsonFile(ADMIN_HISTORY_FILE, adminHistory);
}


// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // Attach user payload to request
        next();
    });
};

// --- Authorization Middleware ---
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions.' });
        }
        next();
    };
};

// --- API Endpoints ---

// User Signup
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, phoneNumber, email, password, referralCode } = req.body;

    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (users.some(user => user.email === email)) {
        return res.status(409).json({ message: 'Email already registered.' });
    }

    let referredBy = null;
    if (referralCode) {
        const existingReferral = referralCodes.find(code => code.code === referralCode && code.isActive);
        if (existingReferral) {
            referredBy = existingReferral.generatedBy; // Store the ID of the user who generated the code
            // Optionally, deactivate referral code after use or limit uses
            // existingReferral.isActive = false;
            // await writeJsonFile(REFERRAL_CODES_FILE, referralCodes);
        } else {
            return res.status(400).json({ message: 'Invalid or inactive referral code.' });
        }
    }

    const newUser = {
        id: uuidv4(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber,
        email,
        password, // In a real app, HASH this password!
        role: 'user', // Default role
        isPaid: false, // User is unpaid by default
        status: 'pending', // 'pending', 'active', 'inactive'
        referralCode: null, // User referral code generated later
        referredBy: referredBy,
        invest: 0, // Initial investment amount
        gain: 0, // Initial gain amount
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    console.log(`New user signed up: ${newUser.email}`);
    addAdminHistory('System', 'New User Signup', { email: newUser.email, role: newUser.role });
    res.status(201).json({ message: 'User registered successfully. Pending payment.' });
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password); // In production, compare hashed passwords

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update last login timestamp
    user.lastLogin = new Date().toISOString();
    await writeJsonFile(USERS_FILE, users);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, adminLevel: user.adminLevel }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

    console.log(`User logged in: ${user.email}, Role: ${user.role}`);
    addAdminHistory(user.email, 'User Login', { email: user.email, role: user.role });

    res.json({
        message: 'Login successful!',
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            adminLevel: user.adminLevel || null,
            paid: user.isPaid,
            status: user.status,
            invest: user.invest,
            gain: user.gain,
            referralCode: user.referralCode
        }
    });
});

// Token Verification Endpoint (for frontend to check session persistence)
app.post('/api/auth/verify-token', authenticateToken, (req, res) => {
    // If we reach here, the token is valid, and req.user contains the decoded payload
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
        message: 'Token is valid.',
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            adminLevel: user.adminLevel || null,
            paid: user.isPaid,
            status: user.status,
            invest: user.invest,
            gain: user.gain,
            referralCode: user.referralCode
        }
    });
});


// --- Payment Endpoints (Leader/Admin controlled) ---

// Submit Payment Info (by User)
app.post('/api/payments/submit', authenticateToken, authorizeRole(['user']), async (req, res) => {
    const { email, method } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isPaid) {
        return res.status(400).json({ message: 'User has already paid.' });
    }

    messages.push({
        id: uuidv4(),
        fromEmail: email,
        subject: 'Payment Submission',
        message: `User ${user.fullName} (${email}) submitted payment via ${method}. Awaiting validation.`,
        timestamp: new Date().toISOString(),
        type: 'payment_submission',
        status: 'unread'
    });
    await writeJsonFile(MESSAGES_FILE, messages);
    addAdminHistory(user.email, 'Payment Submitted', { email: user.email, method });
    res.status(200).json({ message: `Payment method '${method}' submitted for validation.` });
});

// Get Pending Payments (for Leader)
app.get('/api/payments/pending', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    const pendingPaymentUsers = users.filter(user => !user.isPaid && user.status === 'pending');
    const simplifiedPendingPayments = pendingPaymentUsers.map(user => ({
        userName: user.fullName,
        userEmail: user.email,
        method: 'Cash', // Assuming cash for pending, as other methods would be auto-validated
        timestamp: user.createdAt // Use signup time as submission time for cash
    }));
    res.json(simplifiedPendingPayments);
});

// Validate Payment (by Leader)
app.put('/api/payments/validate/:email', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { email } = req.params;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isPaid && user.status === 'active') {
        return res.status(400).json({ message: 'User is already paid and active.' });
    }

    user.isPaid = true;
    user.status = 'active'; // Activate user upon payment validation
    await writeJsonFile(USERS_FILE, users);
    addAdminHistory(req.user.email, 'Payment Validated', { email: user.email, validatedBy: req.user.email });
    res.status(200).json({ message: `Payment for ${email} validated. User activated.` });
});

// Reject Payment (by Leader)
app.put('/api/payments/reject/:email', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { email } = req.params;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isPaid) {
        return res.status(400).json({ message: 'Cannot reject payment for an already paid user.' });
    }

    user.status = 'inactive'; // Mark user as inactive if payment rejected
    await writeJsonFile(USERS_FILE, users);
    addAdminHistory(req.user.email, 'Payment Rejected', { email: user.email, rejectedBy: req.user.email });
    res.status(200).json({ message: `Payment for ${email} rejected. User marked inactive.` });
});


// --- User Message Endpoints (Admin controlled) ---

// Send Message (from User to Admin)
app.post('/api/messages/send', async (req, res) => {
    const { fromEmail, subject, message } = req.body;
    if (!fromEmail || !subject || !message) {
        return res.status(400).json({ message: 'All message fields are required.' });
    }

    messages.push({
        id: uuidv4(),
        fromEmail,
        subject,
        message,
        timestamp: new Date().toISOString(),
        status: 'unread' // New messages are unread by default
    });
    await writeJsonFile(MESSAGES_FILE, messages);
    addAdminHistory(fromEmail, 'Message Sent to Admin', { subject, fromEmail });
    res.status(201).json({ message: 'Message sent successfully.' });
});

// Get All Messages (for Admin)
app.get('/api/messages', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    res.json(messages);
});

// Mark Message as Read (by Admin)
app.put('/api/messages/:id/read', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { id } = req.params;
    const message = messages.find(msg => msg.id === id);

    if (!message) {
        return res.status(404).json({ message: 'Message not found.' });
    }
    message.status = 'read';
    await writeJsonFile(MESSAGES_FILE, messages);
    addAdminHistory(req.user.email, 'Message Marked Read', { messageId: id, from: message.fromEmail });
    res.status(200).json({ message: 'Message marked as read.' });
});

// Delete Message (by Admin)
app.delete('/api/messages/:id', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { id } = req.params;
    const initialLength = messages.length;
    messages = messages.filter(msg => msg.id !== id);

    if (messages.length === initialLength) {
        return res.status(404).json({ message: 'Message not found.' });
    }
    await writeJsonFile(MESSAGES_FILE, messages);
    addAdminHistory(req.user.email, 'Message Deleted', { messageId: id });
    res.status(200).json({ message: 'Message deleted successfully.' });
});


// --- Rotation Management Endpoints (Leader/Admin controlled) ---

// Get Rotation Settings
app.get('/api/rotation/settings', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    res.json(rotationSettings);
});

// Update Rotation Settings
app.put('/api/rotation/settings', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { invest } = req.body;
    if (typeof invest !== 'number' || invest < 0) {
        return res.status(400).json({ message: 'Investment amount must be a non-negative number.' });
    }
    rotationSettings.invest = invest;
    await writeJsonFile(ROTATION_SETTINGS_FILE, rotationSettings);
    addAdminHistory(req.user.email, 'Rotation Settings Updated', { newInvestment: invest });
    res.status(200).json({ message: 'Rotation settings updated successfully.' });
});

// Get Paid & Active Users Not Yet in Rotation
app.get('/api/users/paid-not-in-rotation', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    const paidActiveUsers = users.filter(user =>
        user.role === 'user' &&
        user.isPaid &&
        user.status === 'active' &&
        !rotationParticipants.some(p => p.id === user.id)
    );
    res.json(paidActiveUsers.map(u => ({ id: u.id, fullName: u.fullName, email: u.email })));
});


// Add Participant to Rotation
app.post('/api/rotation/add-participant', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { email } = req.body;
    const userToAdd = users.find(u => u.email === email && u.role === 'user' && u.isPaid && u.status === 'active');

    if (!userToAdd) {
        return res.status(404).json({ message: 'User not found or not eligible for rotation (must be paid and active).' });
    }
    if (rotationParticipants.some(p => p.id === userToAdd.id)) {
        return res.status(409).json({ message: 'User is already in the rotation.' });
    }

    rotationParticipants.push({ id: userToAdd.id, email: userToAdd.email, fullName: userToAdd.fullName });
    await writeJsonFile(ROTATION_PARTICIPANTS_FILE, rotationParticipants);
    addAdminHistory(req.user.email, 'Participant Added to Rotation', { email: userToAdd.email });
    res.status(200).json({ message: `${userToAdd.fullName} added to rotation.` });
});

// Get Current Rotation Participants
app.get('/api/rotation/participants', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    res.json(rotationParticipants);
});

// Move to Next Participant in Rotation (Perform Payout)
app.post('/api/rotation/next', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    if (rotationParticipants.length === 0) {
        return res.status(400).json({ message: 'No participants in rotation. Add members first.' });
    }

    const nextIndex = (rotationSettings.lastPaidMemberIndex + 1) % rotationParticipants.length;
    const currentRecipientInfo = rotationParticipants[nextIndex];
    const currentRecipientUser = users.find(u => u.id === currentRecipientInfo.id);

    if (!currentRecipientUser) {
        // This should ideally not happen if data is consistent, but good to check
        return res.status(500).json({ message: 'Current recipient user data not found. Data inconsistency.' });
    }

    const totalPool = rotationParticipants.length * rotationSettings.invest;
    const winnerGain = totalPool; // Simple model: winner gets the entire pool

    // Update recipient's gain and investment
    currentRecipientUser.gain += winnerGain;
    currentRecipientUser.invest += rotationSettings.invest; // Increment their investment for the current cycle

    // Update rotation settings
    rotationSettings.currentDay += 1;
    rotationSettings.lastPaidMemberIndex = nextIndex;

    // Log to rotation history
    rotationHistory.push({
        id: uuidv4(),
        day: rotationSettings.currentDay,
        recipientId: currentRecipientUser.id,
        recipientName: currentRecipientUser.fullName,
        recipientEmail: currentRecipientUser.email,
        invest: rotationSettings.invest,
        totalPool: totalPool,
        gain: winnerGain,
        timestamp: new Date().toISOString()
    });

    // Save all affected data
    await writeJsonFile(USERS_FILE, users); // Update user's invest/gain
    await writeJsonFile(ROTATION_SETTINGS_FILE, rotationSettings);
    await writeJsonFile(ROTATION_HISTORY_FILE, rotationHistory);
    addAdminHistory(req.user.email, 'Rotation Advanced', {
        day: rotationSettings.currentDay,
        recipient: currentRecipientUser.email,
        gain: winnerGain
    });

    res.status(200).json({
        message: `Rotation advanced to ${currentRecipientUser.fullName}. They gained $${winnerGain.toFixed(2)}.`,
        currentRecipient: {
            id: currentRecipientUser.id,
            fullName: currentRecipientUser.fullName,
            email: currentRecipientUser.email
        },
        winnerGain: winnerGain
    });
});

// Get Rotation History (for CEO)
app.get('/api/rotation/history', authenticateToken, authorizeRole(['ceo']), (req, res) => {
    res.json(rotationHistory);
});


// --- Admin User Management Endpoints (Leader/CEO controlled) ---

// Get All Users (for Admin)
app.get('/api/admin/users', authenticateToken, authorizeRole(['leader', 'ceo']), (req, res) => {
    // Return a simplified list of users for admin view
    const adminViewUsers = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        adminLevel: user.adminLevel || null,
        isPaid: user.isPaid,
        status: user.status
    }));
    res.json(adminViewUsers);
});

// Update User Status (Activate/Deactivate)
app.put('/api/admin/user/:id/status', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'inactive'

    const userToUpdate = users.find(u => u.id === id);

    if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (!['active', 'inactive', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Prevent a leader from deactivating a superAdmin (CEO)
    if (userToUpdate.adminLevel === 'superAdmin' && req.user.adminLevel !== 'superAdmin') {
        return res.status(403).json({ message: 'Access denied: Cannot change status of a Super Admin.' });
    }
    // Prevent user from deactivating themselves
    if (userToUpdate.id === req.user.id) {
        return res.status(403).json({ message: 'Access denied: Cannot change your own status.' });
    }

    userToUpdate.status = status;
    await writeJsonFile(USERS_FILE, users);
    addAdminHistory(req.user.email, 'User Status Update', { userId: id, newStatus: status });
    res.status(200).json({ message: `User ${userToUpdate.fullName} status updated to ${status}.` });
});

// Add New Admin (CEO Only)
app.post('/api/admin/add-admin', authenticateToken, authorizeRole(['ceo']), async (req, res) => {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'All fields are required for new admin.' });
    }
    if (users.some(user => user.email === email)) {
        return res.status(409).json({ message: 'Email already registered as a user or admin.' });
    }

    const newAdmin = {
        id: uuidv4(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber,
        email,
        password, // HASH THIS IN PRODUCTION!
        role: 'leader', // New admins added by CEO are 'leader' by default
        adminLevel: 'teamLeader',
        isPaid: true, // Admins are considered paid
        status: 'active',
        referralCode: null,
        referredBy: null,
        invest: 0,
        gain: 0,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    users.push(newAdmin);
    await writeJsonFile(USERS_FILE, users);
    addAdminHistory(req.user.email, 'New Admin Added', { email: newAdmin.email, role: newAdmin.role });
    res.status(201).json({ message: 'New Team Leader admin added successfully.' });
});

// Generate Referral Code (Admin/Leader)
app.post('/api/admin/referral-code/generate', authenticateToken, authorizeRole(['leader', 'ceo']), async (req, res) => {
    const newCode = uuidv4().substring(0, 8).toUpperCase(); // Generate a short, unique code
    referralCodes.push({
        id: uuidv4(),
        code: newCode,
        generatedBy: req.user.id, // ID of the admin/leader who generated it
        isActive: true,
        createdAt: new Date().toISOString()
    });
    await writeJsonFile(REFERRAL_CODES_FILE, referralCodes);
    addAdminHistory(req.user.email, 'Referral Code Generated', { code: newCode, generatedFor: req.user.email });
    res.status(201).json({ message: 'Referral code generated.', referralCode: newCode });
});

// Get Admin History (CEO Only)
app.get('/api/admin/history', authenticateToken, authorizeRole(['ceo']), (req, res) => {
    res.json(adminHistory);
});


// Start the server
loadAllData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Backend ready. Ensure your frontend is pointing to this address.');
    });
}).catch(err => {
    console.error('Failed to load initial data or start server:', err);
    process.exit(1); // Exit if data loading fails
});
