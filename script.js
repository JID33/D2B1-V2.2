console.log("Script loaded successfully!"); // Added for debugging

// Function to display temporary messages (replaces alerts)
function displayTempMessage(message, isSuccess = true) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        background-color: ${isSuccess ? '#d4edda' : '#f8d7da'};
        color: ${isSuccess ? '#155724' : '#721c24'};
        border: 1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.style.opacity = '1';
    }, 10); // Small delay to allow transition

    setTimeout(() => {
        msgDiv.style.opacity = '0';
        msgDiv.addEventListener('transitionend', () => msgDiv.remove());
    }, 3000); // Message disappears after 3 seconds
}


// --- Configuration for your Backend API ---
// IMPORTANT: Replace this with your actual backend server's URL when deployed!
const API_BASE_URL = 'https://dream2build-api.onrender.com/api'; // <--- UPDATED TO RENDER URL

// --- Helper Functions to Toggle Panels ---
function hideAllPanels() {
    console.log('FUNC: hideAllPanels called. Hiding all panels...');
    document.getElementById('signUpPanel').classList.add('hidden');
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('verificationMessagePanel').classList.add('hidden');
    document.getElementById('paymentPanel').classList.add('hidden');
    document.getElementById('mainPlatformPanel').classList.add('hidden');
    document.getElementById('leaderRegisterPanel').classList.add('hidden'); // Add Admin panel
    document.getElementById('leaderLoginPanel').classList.add('hidden');
    document.getElementById('ceoLoginPanel').classList.add('hidden');
    document.getElementById('leaderPanel').classList.add('hidden');
    document.getElementById('ceoPanel').classList.add('hidden');
    document.getElementById('contactAdminPanel').classList.add('hidden');
    console.log('FUNC: hideAllPanels completed. All panels hidden.');
}

function showSignUp() {
    console.log('FUNC: showSignUp called. Attempting to show Sign Up panel...');
    hideAllPanels();
    document.getElementById('signUpPanel').classList.remove('hidden');
    console.log('FUNC: showSignUp completed. Sign Up panel should be visible.');
}

function showLogin() {
    console.log('FUNC: showLogin called. Attempting to show Login panel...');
    hideAllPanels();
    const loginPanel = document.getElementById('loginPanel');
    if (loginPanel) {
        loginPanel.classList.remove('hidden');
        console.log('FUNC: showLogin completed. Login panel should be visible.');
    } else {
        console.error('ERROR: loginPanel element not found!');
    }
}

function showVerificationMessage(email) {
    console.log('FUNC: showVerificationMessage called for email:', email);
    hideAllPanels();
    document.getElementById('verificationMessagePanel').classList.remove('hidden');
    document.getElementById('verificationEmailDisplay').textContent = email;
    console.log('FUNC: showVerificationMessage completed. Verification panel should be visible.');
}

// New functions to show only one admin/leader panel at a time
function showLeaderLoginOnly() {
    console.log('FUNC: showLeaderLoginOnly called. Attempting to show Leader Login panel only...');
    hideAllPanels();
    document.getElementById('leaderLoginPanel').classList.remove('hidden');
    console.log('FUNC: showLeaderLoginOnly completed. Leader Login panel should be visible.');
}

function showLeaderRegisterOnly() {
    console.log('FUNC: showLeaderRegisterOnly called. Attempting to show Leader Register panel only...');
    hideAllPanels();
    document.getElementById('leaderRegisterPanel').classList.remove('hidden');
    console.log('FUNC: showLeaderRegisterOnly completed. Leader Register panel should be visible.');
}

function showAdminLoginRegister() {
    console.log('FUNC: showAdminLoginRegister called. Showing Leader Login by default.');
    showLeaderLoginOnly(); // Default to showing leader login
}

function showCEOLogin() {
    console.log('FUNC: showCEOLogin called. Attempting to show CEO Login panel only...');
    hideAllPanels();
    document.getElementById('ceoLoginPanel').classList.remove('hidden');
    console.log('FUNC: showCEOLogin completed. CEO Login panel should be visible.');
}

function showContactAdmin() {
    console.log('FUNC: showContactAdmin called. Attempting to show Contact Admin panel only...');
    hideAllPanels();
    document.getElementById('contactAdminPanel').classList.remove('hidden');
    console.log('FUNC: showContactAdmin completed. Contact Admin panel should be visible.');
}

// Function to get current user/admin token (simulated for frontend)
// In a real app, this would get token from cookie or sessionStorage
let currentAuthToken = localStorage.getItem('authToken');
let currentUserData = JSON.parse(localStorage.getItem('currentUserData') || '{}'); // Stores role, name, email etc.

function saveAuthData(token, userData) {
    console.log('FUNC: saveAuthData called. Saving token and user data to localStorage.');
    currentAuthToken = token;
    currentUserData = userData;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUserData', JSON.stringify(userData));
}

function clearAuthData() {
    console.log('FUNC: clearAuthData called. Clearing token and user data from localStorage.');
    currentAuthToken = null;
    currentUserData = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserData');
}

// --- Panel Show Functions (Adjusted for Backend Data) ---
async function showPaymentPanel(userEmail) {
    console.log('FUNC: showPaymentPanel called for email:', userEmail);
    hideAllPanels();
    document.getElementById('paymentPanel').classList.remove('hidden');
    document.getElementById('paymentPanel').dataset.currentUserEmail = userEmail;

    try {
        document.getElementById('paymentUserName').textContent = currentUserData.fullName || currentUserData.email;
        console.log('Payment panel should be visible. Displaying user:', currentUserData.fullName || currentUserData.email);
    } catch (error) {
        console.error('ERROR: Error fetching user data for payment panel:', error);
        document.getElementById('paymentUserName').textContent = 'User';
    }
}

async function showMainPlatform(userName, userInvest, userGain, userReferralCode) {
    console.log('FUNC: showMainPlatform called for user:', userName);
    hideAllPanels();
    document.getElementById('mainPlatformPanel').classList.remove('hidden');
    document.getElementById('loggedInUserName').textContent = userName;

    const adminAreaNote = document.getElementById('adminAreaNote');
    const participantFinancials = document.getElementById('participantFinancials');

    // Only show financial details for regular users
    if (currentUserData.role === 'user') {
        adminAreaNote.textContent = ''; // Clear any previous text
        participantFinancials.classList.remove('hidden'); // Ensure it's visible for users
        document.getElementById('participantInvest').textContent = userInvest !== undefined ? userInvest.toFixed(2) : '0.00';
        document.getElementById('participantGain').textContent = userGain !== undefined ? userGain.toFixed(2) : '0.00';
        document.getElementById('participantReferralCode').textContent = userReferralCode || 'N/A';
    } else if (currentUserData.role === 'leader') {
        adminAreaNote.textContent = 'You have Team Leader access. Check the "Team Leader Dashboard" section.';
        participantFinancials.classList.add('hidden'); // Hide for leaders
    } else if (currentUserData.role === 'ceo') {
        adminAreaNote.textContent = 'You have CEO access. Check the "CEO Dashboard" section.';
        participantFinancials.classList.add('hidden'); // Hide for CEO
    } else {
        adminAreaNote.textContent = 'Your role is not specified.';
        participantFinancials.classList.add('hidden'); // Hide for unknown roles
    }
    console.log('FUNC: showMainPlatform completed. Main platform should be visible.');
}

// --- Authentication and API Call Functions ---

// Handle Sign Up Form Submission
document.getElementById('signUpForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Sign Up form submitted.');

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const email = document.getElementById('email').value; // This will be 'username' for backend
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode').value;
    const signUpMsg = document.getElementById('signUpMsg');

    signUpMsg.classList.add('hidden'); // Hide previous messages

    if (password !== confirmPassword) {
        signUpMsg.textContent = 'Passwords do not match!';
        signUpMsg.classList.remove('hidden');
        signUpMsg.classList.remove('success-msg');
        signUpMsg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Backend expects 'username' and 'password'
                username: email, // Mapping email input to backend's 'username'
                password: password,
                firstName,
                lastName,
                phoneNumber,
                referralCode
            })
        });

        const data = await response.json();
        signUpMsg.textContent = data.message;
        signUpMsg.classList.remove('hidden');

        if (response.ok) {
            signUpMsg.classList.remove('error-msg');
            signUpMsg.classList.add('success-msg');
            displayTempMessage('Registration successful! Please log in.', true);
            // Simulate verification and show login panel
            setTimeout(() => showVerificationMessage(email), 1000);
        } else {
            signUpMsg.classList.remove('success-msg');
            signUpMsg.classList.add('error-msg');
            displayTempMessage(`Registration failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        signUpMsg.textContent = 'Network error. Please try again.';
        signUpMsg.classList.remove('hidden');
        signUpMsg.classList.remove('success-msg');
        signUpMsg.classList.add('error-msg');
        displayTempMessage('Network error during sign up.', false);
    }
});

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Login form submitted.');

    const email = document.getElementById('loginEmail').value; // This will be 'username' for backend
    const password = document.getElementById('loginPassword').value;
    const loginMsg = document.getElementById('loginMsg');

    loginMsg.classList.add('hidden'); // Hide previous messages

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Backend expects 'username' and 'password'
                username: email, // Mapping loginEmail input to backend's 'username'
                password: password
            })
        });

        const data = await response.json();
        loginMsg.textContent = data.message;
        loginMsg.classList.remove('hidden');

        if (response.ok) {
            loginMsg.classList.remove('error-msg');
            loginMsg.classList.add('success-msg');
            displayTempMessage('Login successful!', true);

            // Save authentication token and user data
            saveAuthData(data.token, { email: email, role: data.role || 'user', fullName: data.fullName || email }); // Assuming backend returns role and full name

            // Simulate payment status check (in real app, this would be from backend)
            const isPaid = false; // Simulate user is not paid yet
            if (!isPaid) {
                showPaymentPanel(email);
            } else {
                // If paid, show main platform directly
                showMainPlatform(data.fullName || email, data.invest, data.gain, data.referralCode);
            }

        } else {
            loginMsg.classList.remove('success-msg');
            loginMsg.classList.add('error-msg');
            displayTempMessage(`Login failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error during login:', error);
        loginMsg.textContent = 'Network error. Please try again.';
        loginMsg.classList.remove('hidden');
        loginMsg.classList.remove('success-msg');
        loginMsg.classList.add('error-msg');
        displayTempMessage('Network error during login.', false);
    }
});

// --- Other Form Submission Handlers (Add your backend calls here) ---

// Handle Payment Form Submission
document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Payment form submitted.');

    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUserEmail = document.getElementById('paymentPanel').dataset.currentUserEmail;
    const paymentMsg = document.getElementById('paymentMsg');

    paymentMsg.classList.add('hidden');

    // In a real app, you'd send payment details to your backend
    try {
        const response = await fetch(`${API_BASE_URL}/submit-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}` // Send token for authentication
            },
            body: JSON.stringify({
                email: currentUserEmail,
                method: paymentMethod,
                // Include other payment details if applicable (e.g., card info)
            })
        });

        const data = await response.json();
        paymentMsg.textContent = data.message;
        paymentMsg.classList.remove('hidden');

        if (response.ok) {
            paymentMsg.classList.remove('error-msg');
            paymentMsg.classList.add('success-msg');
            displayTempMessage('Payment info submitted! Awaiting validation.', true);
            // Simulate payment validation and show main platform after a delay
            setTimeout(() => {
                // In a real app, backend would update user status to 'paid'
                currentUserData.isPaid = true; // Update local state
                saveAuthData(currentAuthToken, currentUserData); // Save updated user data
                showMainPlatform(currentUserData.fullName || currentUserData.email, 0, 0, currentUserData.referralCode); // Show main platform
            }, 2000); // Simulate payment processing time
        } else {
            paymentMsg.classList.remove('success-msg');
            paymentMsg.classList.add('error-msg');
            displayTempMessage(`Payment submission failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error submitting payment:', error);
        paymentMsg.textContent = 'Network error. Please try again.';
        paymentMsg.classList.remove('hidden');
        paymentMsg.classList.remove('success-msg');
        paymentMsg.classList.add('error-msg');
        displayTempMessage('Network error during payment submission.', false);
    }
});


// Handle Contact Admin Form Submission
document.getElementById('contactAdminForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Contact Admin form submitted.');

    const contactEmail = document.getElementById('contactEmail').value;
    const contactSubject = document.getElementById('contactSubject').value;
    const contactMessage = document.getElementById('contactMessage').value;
    const contactAdminMsg = document.getElementById('contactAdminMsg');

    contactAdminMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/contact-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: contactEmail,
                subject: contactSubject,
                message: contactMessage
            })
        });

        const data = await response.json();
        contactAdminMsg.textContent = data.message;
        contactAdminMsg.classList.remove('hidden');

        if (response.ok) {
            contactAdminMsg.classList.remove('error-msg');
            contactAdminMsg.classList.add('success-msg');
            displayTempMessage('Message sent successfully!', true);
            document.getElementById('contactAdminForm').reset(); // Clear form
        } else {
            contactAdminMsg.classList.remove('success-msg');
            contactAdminMsg.classList.add('error-msg');
            displayTempMessage(`Failed to send message: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error sending contact message:', error);
        contactAdminMsg.textContent = 'Network error. Please try again.';
        contactAdminMsg.classList.remove('hidden');
        contactAdminMsg.classList.remove('success-msg');
        contactAdminMsg.classList.add('error-msg');
        displayTempMessage('Network error sending message.', false);
    }
});


// Handle Leader Login Form Submission
document.getElementById('leaderLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Leader Login form submitted.');

    const email = document.getElementById('loginLeaderEmail').value;
    const password = document.getElementById('loginLeaderPass').value;
    const leaderLoginMsg = document.getElementById('leaderLoginMsg');

    leaderLoginMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/leader-login`, { // Assuming you'll add this endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();
        leaderLoginMsg.textContent = data.message;
        leaderLoginMsg.classList.remove('hidden');

        if (response.ok) {
            leaderLoginMsg.classList.remove('error-msg');
            leaderLoginMsg.classList.add('success-msg');
            displayTempMessage('Leader login successful!', true);
            saveAuthData(data.token, { email: email, role: 'leader', fullName: data.fullName || email });
            showLeaderDashboard(data.fullName || email); // Function to show leader dashboard
        } else {
            leaderLoginMsg.classList.remove('success-msg');
            leaderLoginMsg.classList.add('error-msg');
            displayTempMessage(`Leader login failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error during leader login:', error);
        leaderLoginMsg.textContent = 'Network error. Please try again.';
        leaderLoginMsg.classList.remove('hidden');
        leaderLoginMsg.classList.remove('success-msg');
        leaderLoginMsg.classList.add('error-msg');
        displayTempMessage('Network error during leader login.', false);
    }
});

// Handle CEO Login Form Submission
document.getElementById('ceoLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('CEO Login form submitted.');

    const email = document.getElementById('ceoLoginEmail').value;
    const password = document.getElementById('ceoLoginPassword').value;
    const ceoLoginMsg = document.getElementById('ceoLoginMsg');

    ceoLoginMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/ceo-login`, { // Assuming you'll add this endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();
        ceoLoginMsg.textContent = data.message;
        ceoLoginMsg.classList.remove('hidden');

        if (response.ok) {
            ceoLoginMsg.classList.remove('error-msg');
            ceoLoginMsg.classList.add('success-msg');
            displayTempMessage('CEO login successful!', true);
            saveAuthData(data.token, { email: email, role: 'ceo', fullName: data.fullName || email });
            showCEODashboard(); // Function to show CEO dashboard
        } else {
            ceoLoginMsg.classList.remove('success-msg');
            ceoLoginMsg.classList.add('error-msg');
            displayTempMessage(`CEO login failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error during CEO login:', error);
        ceoLoginMsg.textContent = 'Network error. Please try again.';
        ceoLoginMsg.classList.remove('hidden');
        ceoLoginMsg.classList.remove('success-msg');
        ceoLoginMsg.classList.add('error-msg');
        displayTempMessage('Network error during CEO login.', false);
    }
});


// --- Logout Functions ---
function logoutUser() {
    console.log('FUNC: logoutUser called. Logging out user.');
    clearAuthData();
    displayTempMessage('Logged out successfully!', true);
    showLogin(); // Go back to login page
}

function logoutLeader() {
    console.log('FUNC: logoutLeader called. Logging out leader.');
    clearAuthData();
    displayTempMessage('Leader logged out successfully!', true);
    showLogin(); // Go back to login page
}

function logoutCEO() {
    console.log('FUNC: logoutCEO called. Logging out CEO.');
    clearAuthData();
    displayTempMessage('CEO logged out successfully!', true);
    showLogin(); // Go back to login page
}

// --- Dummy Functions for Dashboard Features (You'll implement these with backend calls) ---
function showPaymentInstructions(method) {
    console.log('FUNC: showPaymentInstructions called for method:', method);
    const instructionsDiv = document.getElementById('paymentInstructions');
    const allInfos = instructionsDiv.querySelectorAll('div');
    allInfos.forEach(div => div.classList.add('hidden')); // Hide all instructions

    if (method) {
        document.getElementById(`${method}Info`).classList.remove('hidden');
        instructionsDiv.style.display = 'block'; // Show the overall instructions div
    } else {
        instructionsDiv.style.display = 'none'; // Hide if no method selected
    }
}

function showLeaderDashboard(leaderName) {
    console.log('FUNC: showLeaderDashboard called for leader:', leaderName);
    hideAllPanels();
    document.getElementById('leaderPanel').classList.remove('hidden');
    document.getElementById('leaderNameDisplay').textContent = leaderName;
    // In a real app, fetch pending payments, user messages, rotation data etc.
    fetchPendingPayments();
    fetchUserMessages();
    fetchRotationData();
    fetchAllUsersForAdmin();
    // No need to call generateReferralCode here unless you want it to auto-generate on load
}

function showCEODashboard() {
    console.log('FUNC: showCEODashboard called.');
    hideAllPanels();
    document.getElementById('ceoPanel').classList.remove('hidden');
    // In a real app, fetch CEO-specific data like rotation history, system activity
    fetchCEORotationHistory();
    fetchAdminHistory();
    fetchGeneralHistory(); // Fetch general history for CEO
}

// Dummy fetch functions for leader/CEO dashboards
async function fetchPendingPayments() {
    console.log('Fetching pending payments (simulated)...');
    const list = document.getElementById('pendingPaymentsList');
    list.innerHTML = '';
    document.getElementById('noPendingPayments').classList.remove('hidden'); // Assume no data initially

    try {
        const response = await fetch(`${API_BASE_URL}/leader/pending-payments`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const payments = await response.json();

        if (response.ok && payments.length > 0) {
            document.getElementById('noPendingPayments').classList.add('hidden');
            payments.forEach(p => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${p.userName} - $${p.amount.toFixed(2)} (${p.method}) - Status: <span class="status-unpaid">${p.status}</span></span>
                    <button onclick="validatePayment('${p.id}')">Validate</button>
                    <button style="background-color: #dc3545;" onclick="rejectPayment('${p.id}')">Reject</button>
                `;
                list.appendChild(li);
            });
        } else {
            document.getElementById('noPendingPayments').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        document.getElementById('noPendingPayments').textContent = 'Error loading payments.';
        document.getElementById('noPendingPayments').classList.remove('hidden');
    }
}

async function validatePayment(paymentId) {
    console.log(`Validating payment ${paymentId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/leader/validate-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ paymentId })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchPendingPayments(); // Refresh list
            fetchAllUsersForAdmin(); // Refresh user list as status might change
            fetchGeneralHistory(); // Refresh general history
        } else {
            displayTempMessage(`Validation failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error validating payment:', error);
        displayTempMessage('Network error during payment validation.', false);
    }
}

async function rejectPayment(paymentId) {
    console.log(`Rejecting payment ${paymentId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/leader/reject-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ paymentId })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchPendingPayments(); // Refresh list
            fetchGeneralHistory(); // Refresh general history
        } else {
            displayTempMessage(`Rejection failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error rejecting payment:', error);
        displayTempMessage('Network error during payment rejection.', false);
    }
}


async function fetchUserMessages() {
    console.log('Fetching user messages (simulated)...');
    const list = document.getElementById('userMessagesList');
    list.innerHTML = '';
    document.getElementById('noUserMessages').classList.remove('hidden');

    // In a real app, make an API call to /api/leader/messages
    // const response = await fetch(`${API_BASE_URL}/leader/messages`, { headers: { 'Authorization': `Bearer ${currentAuthToken}` } });
    // const messages = await response.json();
    const messages = [
        // { id: 'm1', sender: 'user@example.com', subject: 'Payment Issue', message: 'My payment is stuck.', read: false },
        // { id: 'm2', sender: 'another@example.com', subject: 'Question', message: 'How does rotation work?', read: true }
    ]; // Simulated data

    if (messages.length > 0) {
        document.getElementById('noUserMessages').classList.add('hidden');
        messages.forEach(msg => {
            const li = document.createElement('li');
            li.classList.add(msg.read ? 'read' : 'unread');
            li.innerHTML = `
                <strong>From: ${msg.sender}</strong><br>
                Subject: ${msg.subject}<br>
                Message: ${msg.message}
                ${!msg.read ? `<button onclick="markMessageRead('${msg.id}')">Mark as Read</button>` : ''}
            `;
            list.appendChild(li);
        });
    }
}

async function markMessageRead(messageId) {
    console.log(`Marking message ${messageId} as read (simulated)...`);
    displayTempMessage(`Message ${messageId} marked as read! (Simulated)`, true);
    // In a real app, send API call to /api/leader/messages/${messageId}/read
    fetchUserMessages(); // Refresh list
}

// Dummy data for rotation (will be replaced by backend data)
let rotationParticipants = []; // Stores user IDs or objects
let currentRotationDay = 0;
let currentRecipientIndex = -1;
let dailyInvestmentAmount = 10; // Default

async function fetchRotationData() {
    console.log('Fetching rotation data (simulated)...');
    // In a real app, fetch from backend: /api/rotation/settings, /api/rotation/participants
    // For now, use dummy data or load from localStorage if available
    const storedRotation = JSON.parse(localStorage.getItem('rotationData') || '{}');
    rotationParticipants = storedRotation.participants || [];
    currentRotationDay = storedRotation.currentDay || 0;
    currentRecipientIndex = storedRotation.currentRecipientIndex !== undefined ? storedRotation.currentRecipientIndex : -1;
    dailyInvestmentAmount = storedRotation.dailyInvestmentAmount || 10;

    document.getElementById('currentRotationDay').textContent = currentRotationDay;
    document.getElementById('dailyInvest').value = dailyInvestmentAmount;
    updateRotationParticipantsList();
    updateCurrentRecipientDisplay();

    // Populate available members for rotation (simulated: all active/paid users)
    const select = document.getElementById('availableMembersSelect');
    select.innerHTML = '<option value="">-- Select Paid & Active Member --</option>';
    // In real app: fetch active and paid users from backend
    // const usersResponse = await fetch(`${API_BASE_URL}/admin/users?status=active&paid=true`);
    // const activePaidUsers = await usersResponse.json();
    const activePaidUsers = [
        // { id: 'u1', username: 'user1@example.com', fullName: 'User One', isPaid: true, isActive: true },
        // { id: 'u2', username: 'user2@example.com', fullName: 'User Two', isPaid: true, isActive: true },
    ]; // Simulated users

    activePaidUsers.forEach(user => {
        if (!rotationParticipants.some(p => p.id === user.id)) { // Don't add if already in rotation
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.fullName || user.username;
            select.appendChild(option);
        }
    });
}

function updateRotationParticipantsList() {
    const list = document.getElementById('rotationParticipantsList');
    list.innerHTML = '';
    if (rotationParticipants.length === 0) {
        document.getElementById('noActiveParticipants').classList.remove('hidden');
    } else {
        document.getElementById('noActiveParticipants').classList.add('hidden');
        rotationParticipants.forEach((p, index) => {
            const li = document.createElement('li');
            li.textContent = p.fullName || p.username;
            if (index === currentRecipientIndex) {
                li.classList.add('current-recipient');
            }
            list.appendChild(li);
        });
    }
}

function updateCurrentRecipientDisplay() {
    const display = document.getElementById('currentRecipientDisplay');
    if (rotationParticipants.length > 0 && currentRecipientIndex !== -1) {
        const recipient = rotationParticipants[currentRecipientIndex];
        display.textContent = recipient.fullName || recipient.username;
    } else {
        display.textContent = 'N/A';
    }
}

function saveRotationSettings() {
    dailyInvestmentAmount = parseFloat(document.getElementById('dailyInvest').value);
    if (isNaN(dailyInvestmentAmount) || dailyInvestmentAmount <= 0) {
        displayTempMessage('Investment must be a positive number.', false);
        return;
    }
    localStorage.setItem('rotationData', JSON.stringify({
        participants: rotationParticipants,
        currentDay: currentRotationDay,
        currentRecipientIndex: currentRecipientIndex,
        dailyInvestmentAmount: dailyInvestmentAmount
    }));
    displayTempMessage('Rotation settings updated!', true);
    // In a real app, send to backend: /api/rotation/settings (PUT)
}

function addParticipantToRotation() {
    const select = document.getElementById('availableMembersSelect');
    const selectedUserId = select.value;
    const selectedUserName = select.options[select.selectedIndex].textContent;
    const addParticipantMsg = document.getElementById('addParticipantMsg');
    addParticipantMsg.classList.add('hidden');

    if (!selectedUserId) {
        addParticipantMsg.textContent = 'Please select a member to add.';
        addParticipantMsg.classList.remove('hidden');
        addParticipantMsg.classList.add('error-msg');
        return;
    }

    const newParticipant = { id: selectedUserId, username: selectedUserName, fullName: selectedUserName }; // Simplified
    if (!rotationParticipants.some(p => p.id === newParticipant.id)) {
        rotationParticipants.push(newParticipant);
        localStorage.setItem('rotationData', JSON.stringify({
            participants: rotationParticipants,
            currentDay: currentRotationDay,
            currentRecipientIndex: currentRecipientIndex,
            dailyInvestmentAmount: dailyInvestmentAmount
        }));
        updateRotationParticipantsList();
        displayTempMessage(`${selectedUserName} added to rotation!`, true);
        addParticipantMsg.classList.remove('error-msg');
        addParticipantMsg.classList.add('success-msg');
        addParticipantMsg.textContent = `${selectedUserName} added to rotation!`;
        select.value = ''; // Clear selection
        // In a real app, send to backend: /api/rotation/participants (POST)
    } else {
        addParticipantMsg.textContent = 'Participant is already in the rotation.';
        addParticipantMsg.classList.remove('hidden');
        addParticipantMsg.classList.add('error-msg');
    }
}

function nextParticipant() {
    const rotationStatusMsg = document.getElementById('rotationStatusMsg');
    rotationStatusMsg.classList.add('hidden');

    if (rotationParticipants.length === 0) {
        rotationStatusMsg.textContent = 'No participants in rotation to advance.';
        rotationStatusMsg.classList.remove('hidden');
        rotationStatusMsg.classList.add('error-msg');
        displayTempMessage('No participants in rotation.', false);
        return;
    }

    currentRotationDay++;
    currentRecipientIndex = (currentRecipientIndex + 1) % rotationParticipants.length;
    const currentRecipient = rotationParticipants[currentRecipientIndex];

    // Calculate gain (simplified: total pool = participants * daily investment)
    const totalPool = rotationParticipants.length * dailyInvestmentAmount;
    const recipientGain = totalPool; // For simplicity, recipient gets the whole pool

    displayTempMessage(`Day ${currentRotationDay}: ${currentRecipient.fullName || currentRecipient.username} receives $${recipientGain.toFixed(2)}!`, true);

    // Save history (simulated)
    let history = JSON.parse(localStorage.getItem('ceoRotationHistory') || '[]');
    history.push({
        day: currentRotationDay,
        recipient: currentRecipient.fullName || currentRecipient.username,
        invest: dailyInvestmentAmount,
        totalPool: totalPool,
        gain: recipientGain,
        timestamp: new Date().toLocaleString()
    });
    // Keep only last 25 entries
    if (history.length > 25) {
        history = history.slice(history.length - 25);
    }
    localStorage.setItem('ceoRotationHistory', JSON.stringify(history));


    localStorage.setItem('rotationData', JSON.stringify({
        participants: rotationParticipants,
        currentDay: currentRotationDay,
        currentRecipientIndex: currentRecipientIndex,
        dailyInvestmentAmount: dailyInvestmentAmount
    }));

    document.getElementById('currentRotationDay').textContent = currentRotationDay;
    updateCurrentRecipientDisplay();
    updateRotationParticipantsList(); // Update highlight
    fetchCEORotationHistory(); // Refresh CEO history table
    fetchGeneralHistory(); // Refresh general history

    // In a real app, send to backend: /api/rotation/next (POST)
}


// Dummy data for user management
let allUsers = []; // Stores all registered users (simulated)

async function fetchAllUsersForAdmin() {
    console.log('Fetching all users for admin (simulated)...');
    const tableBody = document.getElementById('adminUsersTable').querySelector('tbody');
    tableBody.innerHTML = '';
    document.getElementById('noUsersFound').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const users = await response.json();

        if (response.ok && users.length > 0) {
            document.getElementById('noUsersFound').classList.add('hidden');
            allUsers = users; // Store fetched users
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.firstName || ''} ${user.lastName || ''}</td>
                    <td>${user.username}</td>
                    <td>${user.role || 'user'}</td>
                    <td><span class="${user.isPaid ? 'status-paid' : 'status-unpaid'}">${user.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                    <td><span class="${user.isActive ? 'status-active' : 'status-inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <button onclick="toggleUserStatus('${user.id}', ${user.isActive})">${user.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button onclick="toggleUserPaymentStatus('${user.id}', ${user.isPaid})">${user.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</button>
                        <button style="background-color: #dc3545;" onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            document.getElementById('noUsersFound').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        document.getElementById('noUsersFound').textContent = 'Error loading users.';
        document.getElementById('noUsersFound').classList.remove('hidden');
    }
}

async function toggleUserStatus(userId, currentStatus) {
    console.log(`Toggling status for user ${userId} to ${!currentStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ isActive: !currentStatus })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchAllUsersForAdmin(); // Refresh table
            fetchGeneralHistory(); // Refresh general history
        } else {
            displayTempMessage(`Status update failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        displayTempMessage('Network error during user status update.', false);
    }
}

async function toggleUserPaymentStatus(userId, currentPaidStatus) {
    console.log(`Toggling payment status for user ${userId} to ${!currentPaidStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/payment-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ isPaid: !currentPaidStatus })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchAllUsersForAdmin(); // Refresh table
            fetchGeneralHistory(); // Refresh general history
        } else {
            displayTempMessage(`Payment status update failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error toggling user payment status:', error);
        displayTempMessage('Network error during user payment status update.', false);
    }
}

async function deleteUser(userId) {
    console.log(`Deleting user ${userId}...`);
    if (confirm('Are you sure you want to delete this user?')) { // Using confirm for demo, replace with custom modal
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                displayTempMessage(data.message, true);
                fetchAllUsersForAdmin(); // Refresh table
                fetchGeneralHistory(); // Refresh general history
            } else {
                displayTempMessage(`User deletion failed: ${data.message}`, false);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            displayTempMessage('Network error during user deletion.', false);
        }
    }
}

// Referral Code Generator
function generateReferralCode() {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // Simple random code
    document.getElementById('generatedReferralCode').textContent = code;
    document.getElementById('generatedReferralCodeMsg').textContent = 'New referral code generated!';
    document.getElementById('generatedReferralCodeMsg').classList.remove('hidden', 'error-msg');
    document.getElementById('generatedReferralCodeMsg').classList.add('success-msg');
    displayTempMessage('New referral code generated!', true);
    // In a real app, send to backend: /api/admin/generate-referral-code (POST)
    // and store it, maybe link to a leader
}

// CEO Dashboard Functions
async function fetchCEORotationHistory() {
    console.log('Fetching CEO rotation history...');
    const tableBody = document.getElementById('ceoRotationHistoryTable').querySelector('tbody');
    tableBody.innerHTML = '';
    document.getElementById('noRotationHistory').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/ceo/rotation-history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const history = await response.json();

        if (response.ok && history.length > 0) {
            document.getElementById('noRotationHistory').classList.add('hidden');
            history.forEach(entry => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${entry.day}</td>
                    <td>${entry.recipient}</td>
                    <td>$${entry.invest.toFixed(2)}</td>
                    <td>$${entry.totalPool.toFixed(2)}</td>
                    <td>$${entry.gain.toFixed(2)}</td>
                    <td>${entry.timestamp}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            document.getElementById('noRotationHistory').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching CEO rotation history:', error);
        document.getElementById('noRotationHistory').textContent = 'Error loading rotation history.';
        document.getElementById('noRotationHistory').classList.remove('hidden');
    }
}

async function fetchAdminHistory() {
    console.log('Fetching admin activity history...');
    const tableBody = document.getElementById('adminHistoryTable').querySelector('tbody');
    tableBody.innerHTML = '';
    document.getElementById('noAdminHistory').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/ceo/admin-history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const history = await response.json();

        if (response.ok && history.length > 0) {
            document.getElementById('noAdminHistory').classList.add('hidden');
            history.forEach(entry => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${entry.timestamp}</td>
                    <td>${entry.type}</td>
                    <td>${entry.description}</td>
                    <td>${entry.details}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            document.getElementById('noAdminHistory').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching admin history:', error);
        document.getElementById('noAdminHistory').textContent = 'Error loading admin history.';
        document.getElementById('noAdminHistory').classList.remove('hidden');
    }
}

// NEW: Fetch General History for CEO
async function fetchGeneralHistory() {
    console.log('Fetching general history for CEO...');
    const tableBody = document.getElementById('generalHistoryTable').querySelector('tbody');
    tableBody.innerHTML = '';
    document.getElementById('noGeneralHistory').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/ceo/general-history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const history = await response.json();

        if (response.ok && history.length > 0) {
            document.getElementById('noGeneralHistory').classList.add('hidden');
            history.forEach(entry => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${entry.timestamp}</td>
                    <td>${entry.type}</td>
                    <td>${entry.description}</td>
                    <td>${entry.details || 'N/A'}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            document.getElementById('noGeneralHistory').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching general history:', error);
        document.getElementById('noGeneralHistory').textContent = 'Error loading general history.';
        document.getElementById('noGeneralHistory').classList.remove('hidden');
    }
}


async function addAdmin() {
    console.log('Adding new admin...');
    const firstName = document.getElementById('newAdminFirstName').value;
    const lastName = document.getElementById('newAdminLastName').value;
    const phoneNumber = document.getElementById('newAdminPhoneNumber').value;
    const email = document.getElementById('newAdminEmail').value;
    const password = document.getElementById('newAdminPass').value;
    const newAdminMsg = document.getElementById('newAdminMsg');

    newAdminMsg.classList.add('hidden');

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
        newAdminMsg.textContent = 'All fields are required to add a new admin.';
        newAdminMsg.classList.remove('hidden');
        newAdminMsg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ceo/add-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}` // CEO token
            },
            body: JSON.stringify({
                username: email, // Email as username for backend
                password: password,
                firstName,
                lastName,
                phoneNumber,
                role: 'leader' // New admins are typically leaders
            })
        });

        const data = await response.json();
        newAdminMsg.textContent = data.message;
        newAdminMsg.classList.remove('hidden');

        if (response.ok) {
            newAdminMsg.classList.remove('error-msg');
            newAdminMsg.classList.add('success-msg');
            displayTempMessage('New admin added successfully!', true);
            document.getElementById('newAdminForm').reset(); // Clear form
            fetchGeneralHistory(); // Refresh general history
        } else {
            newAdminMsg.classList.remove('success-msg');
            newAdminMsg.classList.add('error-msg');
            displayTempMessage(`Failed to add admin: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error adding new admin:', error);
        newAdminMsg.textContent = 'Network error. Please try again.';
        newAdminMsg.classList.remove('hidden');
        newAdminMsg.classList.remove('success-msg');
        newAdminMsg.classList.add('error-msg');
        displayTempMessage('Network error adding admin.', false);
    }
}


function calculRotation() {
    console.log('Generating comprehensive report (simulated)...');
    const ceoReportMsg = document.getElementById('ceoReportMsg');
    ceoReportMsg.classList.remove('hidden');
    ceoReportMsg.classList.remove('error-msg');
    ceoReportMsg.classList.add('success-msg');
    ceoReportMsg.textContent = 'Comprehensive report generation simulated. This would be a complex backend operation.';
    displayTempMessage('Report generation simulated!', true);
}

// NEW: Export History to CSV
function exportTableToCSV(tableId, filename = 'history.csv') {
    const table = document.getElementById(tableId);
    if (!table) {
        displayTempMessage(`Table with ID '${tableId}' not found for export.`, false);
        return;
    }

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (const row of rows) {
        const cols = row.querySelectorAll('th, td');
        const rowData = Array.from(cols).map(col => {
            let text = col.innerText;
            // Handle commas and quotes in data
            if (text.includes(',') || text.includes('"')) {
                text = `"${text.replace(/"/g, '""')}"`;
            }
            return text;
        });
        csv.push(rowData.join(','));
    }

    const csvString = csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    displayTempMessage(`Exported ${filename} successfully!`, true);
}


// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing...');
    // Check if a token exists, if so, try to show the appropriate panel
    if (currentAuthToken && currentUserData.role) {
        if (currentUserData.role === 'user') {
            // In a real app, you'd verify the token with the backend first
            showMainPlatform(currentUserData.fullName || currentUserData.email, 0, 0, currentUserData.referralCode); // Pass dummy financials for now
        } else if (currentUserData.role === 'leader') {
            showLeaderDashboard(currentUserData.fullName || currentUserData.email);
        } else if (currentUserData.role === 'ceo') {
            showCEODashboard();
        } else {
            showLogin(); // Fallback if role is unknown
        }
    } else {
        showSignUp(); // Default to sign up if no token
    }

    // Initial fetch for admin/leader dashboards if they are shown on load
    if (!document.getElementById('leaderPanel').classList.contains('hidden')) {
        fetchPendingPayments();
        fetchUserMessages();
        fetchRotationData();
        fetchAllUsersForAdmin();
    }
    if (!document.getElementById('ceoPanel').classList.contains('hidden')) {
        fetchCEORotationHistory();
        fetchAdminHistory();
        fetchGeneralHistory(); // Fetch general history on CEO dashboard load
    }
});

// For the confirm dialog, replace with a custom modal in a production environment
// window.confirm = (message) => {
//     return customModalConfirm(message); // Implement your own modal
// };
```Okay, I see the `script.js` code you've provided. It already includes the `fetchGeneralHistory()` function and `exportTableToCSV()` function, which is great!

Now, to fully implement the history feature and the export functionality, we need to make changes in two places:

1.  **Your `server.js` (Backend):** This is where you'll store the history data and create the API endpoints to serve it.
2.  **Your `index.html` (Frontend HTML):** You'll need to add the new "General History" table and the "Export" buttons in the CEO dashboard.

I will provide the updated `server.js` first, as the backend needs to be ready to handle the data.

### Updated `server.js` (Backend)

This update to your `server.js` will introduce:
* A new `history.json` file to store all events (registration, payment, gain, leader actions).
* Functions to record these events.
* API endpoints for leaders to validate/reject payments.
* API endpoints for the CEO to fetch all types of history.

**Please replace the entire content of your `server.js` file with this code.**


```javascript
// C:\Users\ASUS\dream2build-backend\server.js

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const { loadAllData } = require('./data/dataLoader'); // Assuming dataLoader.js exists

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key'; // CHANGE THIS IN PRODUCTION!

app.use(bodyParser.json());
app.use(cors());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json'); // New history file
const PENDING_PAYMENTS_FILE = path.join(DATA_DIR, 'pendingPayments.json'); // New pending payments file
const ROTATION_DATA_FILE = path.join(DATA_DIR, 'rotationData.json'); // Centralized rotation data

// Helper function to read JSON files
async function readJsonFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return defaultValue;
        }
        throw error;
    }
}

// Helper function to write JSON files
async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- History Logging Function ---
async function logHistory(type, description, details = {}) {
    const history = await readJsonFile(HISTORY_FILE);
    const newEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(), // ISO format for easy sorting and parsing
        type,
        description,
        details
    };
    history.push(newEntry);
    // Keep history manageable, e.g., last 500 entries
    if (history.length > 500) {
        history.splice(0, history.length - 500);
    }
    await writeJsonFile(HISTORY_FILE, history);
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
    if (req.user && req.user.role === 'leader' || req.user.role === 'ceo') { // CEO can also access leader functions
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

    const users = await readJsonFile(USERS_FILE);
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists.' });
    }

    // IMPORTANT: In a real app, hash the password using bcrypt before saving!
    const newUser = {
        id: uuidv4(),
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
        gain: 0
    };

    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    await logHistory('User Registration', `New user registered: ${username}`, { userId: newUser.id, username: newUser.username });

    res.status(201).json({ message: 'User registered successfully!', user: { id: newUser.id, username: newUser.username, fullName: `${firstName} ${lastName}` } });
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password); // Password not hashed!

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role || 'user' }, SECRET_KEY, { expiresIn: '1h' });
    await logHistory('User Login', `User logged in: ${username}`, { userId: user.id, username: user.username, role: user.role });

    res.json({
        message: 'Login successful!',
        token,
        role: user.role || 'user',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        invest: user.invest,
        gain: user.gain,
        referralCode: user.referralCode
    });
});

// Submit Payment Info
app.post('/api/submit-payment', authenticateToken, async (req, res) => {
    const { email, method } = req.body;
    if (!email || !method) {
        return res.status(400).json({ message: 'Email and payment method are required.' });
    }

    const pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
    const newPayment = {
        id: uuidv4(),
        userId: req.user.id,
        userName: req.user.username,
        email: email,
        method: method,
        amount: 25, // Assuming a fixed amount for now
        status: 'Pending',
        timestamp: new Date().toISOString()
    };
    pendingPayments.push(newPayment);
    await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);
    await logHistory('Payment Submission', `User submitted payment intent: ${email} via ${method}`, { userId: req.user.id, paymentId: newPayment.id, method: method });

    res.json({ message: 'Payment information received. Awaiting validation by a team leader.' });
});

// Contact Admin
app.post('/api/contact-admin', async (req, res) => {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
        return res.status(400).json({ message: 'Email, subject, and message are required.' });
    }
    // In a real app, you'd save this message to a database or send an email
    console.log(`New message from ${email} - Subject: ${subject} - Message: ${message}`);
    await logHistory('Contact Admin', `New message from ${email}`, { subject: subject });
    res.json({ message: 'Your message has been sent to support.' });
});

// Leader Login
app.post('/api/leader-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required for leader login.' });
    }

    const users = await readJsonFile(USERS_FILE);
    const leader = users.find(u => u.username === username && u.password === password && u.role === 'leader');

    if (!leader) {
        return res.status(401).json({ message: 'Invalid credentials or not authorized as a leader.' });
    }

    const token = jwt.sign({ id: leader.id, username: leader.username, role: 'leader' }, SECRET_KEY, { expiresIn: '1h' });
    await logHistory('Leader Login', `Leader logged in: ${username}`, { leaderId: leader.id, username: leader.username });

    res.json({ message: 'Leader login successful!', token, role: 'leader', fullName: `${leader.firstName || ''} ${leader.lastName || ''}`.trim() || leader.username });
});

// Leader Registration (for self-registration)
app.post('/api/leader-register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required for leader registration.' });
    }

    const users = await readJsonFile(USERS_FILE);
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: 'Email already registered as a user or leader.' });
    }

    // IMPORTANT: In a real app, hash the password using bcrypt before saving!
    const newLeader = {
        id: uuidv4(),
        username,
        password, // Store hashed password in production!
        firstName,
        lastName,
        phoneNumber,
        role: 'leader',
        isPaid: true, // Leaders are typically considered paid/active
        isActive: true,
        invest: 0,
        gain: 0
    };

    users.push(newLeader);
    await writeJsonFile(USERS_FILE, users);
    await logHistory('Leader Registration', `New leader registered: ${username}`, { leaderId: newLeader.id, username: newLeader.username });

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

    const users = await readJsonFile(USERS_FILE);
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: 'Admin with this email already exists.' });
    }

    // IMPORTANT: In a real app, hash the password using bcrypt before saving!
    const newAdmin = {
        id: uuidv4(),
        username,
        password, // Store hashed password in production!
        firstName,
        lastName,
        phoneNumber,
        role: role,
        isPaid: true,
        isActive: true,
        invest: 0,
        gain: 0
    };

    users.push(newAdmin);
    await writeJsonFile(USERS_FILE, users);
    await logHistory('Admin Added', `New admin (${role}) added by CEO: ${username}`, { adminId: newAdmin.id, username: newAdmin.username, addedBy: req.user.username });

    res.status(201).json({ message: 'New admin added successfully!', admin: { id: newAdmin.id, username: newAdmin.username, fullName: `${firstName} ${lastName}` } });
});

// Get All Users (Admin/Leader Access)
app.get('/api/admin/users', authenticateToken, authorizeLeader, async (req, res) => {
    const users = await readJsonFile(USERS_FILE);
    // Filter out sensitive data like passwords before sending to frontend
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
});

// Toggle User Status (Admin/Leader Access)
app.put('/api/admin/users/:userId/status', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean.' });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const oldStatus = users[userIndex].isActive;
    users[userIndex].isActive = isActive;
    await writeJsonFile(USERS_FILE, users);
    await logHistory('User Status Update', `User ${users[userIndex].username} status changed from ${oldStatus} to ${isActive}`, { userId, changedBy: req.user.username });

    res.json({ message: `User status updated to ${isActive ? 'active' : 'inactive'}.` });
});

// Toggle User Payment Status (Admin/Leader Access)
app.put('/api/admin/users/:userId/payment-status', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;
    const { isPaid } = req.body;

    if (typeof isPaid !== 'boolean') {
        return res.status(400).json({ message: 'isPaid must be a boolean.' });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const oldPaidStatus = users[userIndex].isPaid;
    users[userIndex].isPaid = isPaid;
    await writeJsonFile(USERS_FILE, users);
    await logHistory('User Payment Status Update', `User ${users[userIndex].username} payment status changed from ${oldPaidStatus ? 'Paid' : 'Unpaid'} to ${isPaid ? 'Paid' : 'Unpaid'}`, { userId, changedBy: req.user.username });

    res.json({ message: `User payment status updated to ${isPaid ? 'paid' : 'unpaid'}.` });
});

// Delete User (Admin/Leader Access)
app.delete('/api/admin/users/:userId', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId } = req.params;

    let users = await readJsonFile(USERS_FILE);
    const initialLength = users.length;
    const userToDelete = users.find(u => u.id === userId);

    users = users.filter(u => u.id !== userId);

    if (users.length === initialLength) {
        return res.status(404).json({ message: 'User not found.' });
    }

    await writeJsonFile(USERS_FILE, users);
    await logHistory('User Deletion', `User deleted: ${userToDelete.username}`, { userId, deletedBy: req.user.username });

    res.json({ message: 'User deleted successfully.' });
});

// Get Pending Payments (Leader Access)
app.get('/api/leader/pending-payments', authenticateToken, authorizeLeader, async (req, res) => {
    const pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
    const pending = pendingPayments.filter(p => p.status === 'Pending');
    res.json(pending);
});

// Validate Payment (Leader Access)
app.post('/api/leader/validate-payment', authenticateToken, authorizeLeader, async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    let pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
    const paymentIndex = pendingPayments.findIndex(p => p.id === paymentId && p.status === 'Pending');

    if (paymentIndex === -1) {
        return res.status(404).json({ message: 'Pending payment not found or already processed.' });
    }

    const payment = pendingPayments[paymentIndex];
    payment.status = 'Validated';
    payment.validatedBy = req.user.username;
    payment.validationTimestamp = new Date().toISOString();

    // Update user's isPaid status in users.json
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === payment.userId);
    if (userIndex !== -1) {
        users[userIndex].isPaid = true;
        await writeJsonFile(USERS_FILE, users);
        await logHistory('User Payment Validated', `Payment for ${payment.userName} (${payment.amount}$) validated by ${req.user.username}`, { userId: payment.userId, paymentId: payment.id });
    } else {
        console.warn(`User ${payment.userId} not found for payment ${payment.id} during validation.`);
        await logHistory('User Payment Validated (User Not Found)', `Payment for ${payment.userName} (${payment.amount}$) validated by ${req.user.username}, but user not found.`, { userId: payment.userId, paymentId: payment.id });
    }

    await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);
    res.json({ message: 'Payment validated successfully!' });
});

// Reject Payment (Leader Access)
app.post('/api/leader/reject-payment', authenticateToken, authorizeLeader, async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }

    let pendingPayments = await readJsonFile(PENDING_PAYMENTS_FILE);
    const paymentIndex = pendingPayments.findIndex(p => p.id === paymentId && p.status === 'Pending');

    if (paymentIndex === -1) {
        return res.status(404).json({ message: 'Pending payment not found or already processed.' });
    }

    const payment = pendingPayments[paymentIndex];
    payment.status = 'Rejected';
    payment.rejectedBy = req.user.username;
    payment.rejectionTimestamp = new Date().toISOString();

    await writeJsonFile(PENDING_PAYMENTS_FILE, pendingPayments);
    await logHistory('User Payment Rejected', `Payment for ${payment.userName} (${payment.amount}$) rejected by ${req.user.username}`, { userId: payment.userId, paymentId: payment.id });

    res.json({ message: 'Payment rejected successfully.' });
});

// Rotation Management (Leader/CEO Access)
app.get('/api/rotation/data', authenticateToken, authorizeLeader, async (req, res) => {
    const rotationData = await readJsonFile(ROTATION_DATA_FILE, {
        participants: [],
        currentDay: 0,
        currentRecipientIndex: -1,
        dailyInvestmentAmount: 10
    });
    res.json(rotationData);
});

app.put('/api/rotation/settings', authenticateToken, authorizeLeader, async (req, res) => {
    const { dailyInvestmentAmount } = req.body;
    if (isNaN(dailyInvestmentAmount) || dailyInvestmentAmount <= 0) {
        return res.status(400).json({ message: 'Daily investment must be a positive number.' });
    }

    let rotationData = await readJsonFile(ROTATION_DATA_FILE, {});
    rotationData.dailyInvestmentAmount = dailyInvestmentAmount;
    await writeJsonFile(ROTATION_DATA_FILE, rotationData);
    await logHistory('Rotation Settings Update', `Daily investment updated to ${dailyInvestmentAmount}$ by ${req.user.username}`, { updatedBy: req.user.username, amount: dailyInvestmentAmount });

    res.json({ message: 'Rotation settings updated successfully!' });
});

app.post('/api/rotation/participants', authenticateToken, authorizeLeader, async (req, res) => {
    const { userId, username, fullName } = req.body;
    if (!userId || !username || !fullName) {
        return res.status(400).json({ message: 'Participant details are required.' });
    }

    let rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [] });
    if (rotationData.participants.some(p => p.id === userId)) {
        return res.status(409).json({ message: 'Participant already in rotation.' });
    }

    rotationData.participants.push({ id: userId, username, fullName });
    await writeJsonFile(ROTATION_DATA_FILE, rotationData);
    await logHistory('Rotation Participant Added', `Participant ${fullName} added to rotation by ${req.user.username}`, { userId, addedBy: req.user.username });

    res.status(201).json({ message: 'Participant added to rotation successfully!' });
});

app.post('/api/rotation/next', authenticateToken, authorizeLeader, async (req, res) => {
    let rotationData = await readJsonFile(ROTATION_DATA_FILE, { participants: [], currentDay: 0, currentRecipientIndex: -1, dailyInvestmentAmount: 10 });

    if (rotationData.participants.length === 0) {
        return res.status(400).json({ message: 'No participants in rotation to advance.' });
    }

    rotationData.currentDay++;
    rotationData.currentRecipientIndex = (rotationData.currentRecipientIndex + 1) % rotationData.participants.length;
    const currentRecipient = rotationData.participants[rotationData.currentRecipientIndex];

    const totalPool = rotationData.participants.length * rotationData.dailyInvestmentAmount;
    const recipientGain = totalPool; // For simplicity, recipient gets the whole pool

    // Update recipient's gain in users.json
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === currentRecipient.id);
    if (userIndex !== -1) {
        users[userIndex].gain = (users[userIndex].gain || 0) + recipientGain;
        await writeJsonFile(USERS_FILE, users);
    } else {
        console.warn(`Recipient user ${currentRecipient.id} not found in users.json during gain distribution.`);
    }

    await writeJsonFile(ROTATION_DATA_FILE, rotationData);
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

// CEO Specific History Endpoints
app.get('/api/ceo/rotation-history', authenticateToken, authorizeCEO, async (req, res) => {
    const history = await readJsonFile(HISTORY_FILE);
    const rotationHistory = history.filter(entry => entry.type === 'Rotation Advance');
    res.json(rotationHistory);
});

app.get('/api/ceo/admin-history', authenticateToken, authorizeCEO, async (req, res) => {
    const history = await readJsonFile(HISTORY_FILE);
    const adminActions = history.filter(entry =>
        entry.type === 'User Status Update' ||
        entry.type === 'User Payment Status Update' ||
        entry.type === 'User Deletion' ||
        entry.type === 'Admin Added' ||
        entry.type === 'Rotation Settings Update' ||
        entry.type === 'Rotation Participant Added' ||
        entry.type === 'User Payment Validated' ||
        entry.type === 'User Payment Rejected'
    );
    res.json(adminActions);
});

// NEW: General History Endpoint for CEO
app.get('/api/ceo/general-history', authenticateToken, authorizeCEO, async (req, res) => {
    const history = await readJsonFile(HISTORY_FILE);
    res.json(history); // Return all history for the CEO
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

// Start the server only after initial data is loaded
// This ensures all necessary JSON files exist or are initialized
async function initializeDataFiles() {
    await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {}); // Ensure data directory exists
    await writeJsonFile(USERS_FILE, await readJsonFile(USERS_FILE)); // Ensure users.json exists
    await writeJsonFile(HISTORY_FILE, await readJsonFile(HISTORY_FILE)); // Ensure history.json exists
    await writeJsonFile(PENDING_PAYMENTS_FILE, await readJsonFile(PENDING_PAYMENTS_FILE)); // Ensure pendingPayments.json exists
    await writeJsonFile(ROTATION_DATA_FILE, await readJsonFile(ROTATION_DATA_FILE)); // Ensure rotationData.json exists
}

initializeDataFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Backend ready. Ensure your frontend is pointing to this address.');
    });
}).catch(err => {
    console.error('Failed to initialize data files or start server:', err);
    process.exit(1);
});
