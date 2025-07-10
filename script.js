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
const API_BASE_URL = 'http://localhost:3000/api'; // For local testing, assuming backend runs on port 3000

// --- Helper Functions to Toggle Panels ---
function hideAllPanels() {
    console.log('Hiding all panels...');
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
    console.log('All panels hidden.');
}

function showSignUp() {
    console.log('Attempting to show Sign Up panel...');
    hideAllPanels();
    document.getElementById('signUpPanel').classList.remove('hidden');
    console.log('Sign Up panel should be visible.');
}

function showLogin() {
    console.log('showLogin function called.'); // Added for debugging
    hideAllPanels();
    const loginPanel = document.getElementById('loginPanel');
    if (loginPanel) {
        loginPanel.classList.remove('hidden');
        console.log('Login panel should be visible.');
    } else {
        console.error('Error: loginPanel element not found!');
    }
}

function showVerificationMessage(email) {
    hideAllPanels();
    document.getElementById('verificationMessagePanel').classList.remove('hidden');
    document.getElementById('verificationEmailDisplay').textContent = email;
}

// New functions to show only one admin/leader panel at a time
function showLeaderLoginOnly() {
    console.log('Attempting to show Leader Login panel only...');
    hideAllPanels();
    document.getElementById('leaderLoginPanel').classList.remove('hidden');
    console.log('Leader Login panel should be visible.');
}

function showLeaderRegisterOnly() {
    console.log('Attempting to show Leader Register panel only...');
    hideAllPanels();
    document.getElementById('leaderRegisterPanel').classList.remove('hidden');
    console.log('Leader Register panel should be visible.');
}

// Function to get current user/admin token (simulated for frontend)
// In a real app, this would get token from cookie or sessionStorage
let currentAuthToken = localStorage.getItem('authToken');
let currentUserData = JSON.parse(localStorage.getItem('currentUserData') || '{}'); // Stores role, name, email etc.

function saveAuthData(token, userData) {
    currentAuthToken = token;
    currentUserData = userData;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUserData', JSON.stringify(userData));
}

function clearAuthData() {
    currentAuthToken = null;
    currentUserData = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserData');
}

// --- Panel Show Functions (Adjusted for Backend Data) ---
async function showPaymentPanel(userEmail) {
    hideAllPanels();
    document.getElementById('paymentPanel').classList.remove('hidden');
    document.getElementById('paymentPanel').dataset.currentUserEmail = userEmail;

    try {
        // This endpoint is not defined in server.js, but we'll use currentUserData for display
        // In a real app, you might fetch user details again if needed.
        document.getElementById('paymentUserName').textContent = currentUserData.fullName || currentUserData.email;
    } catch (error) {
        console.error('Error fetching user data for payment panel:', error);
        document.getElementById('paymentUserName').textContent = 'User';
    }
}

async function showMainPlatform(userName, userInvest, userGain, userReferralCode) {
    console.log('Attempting to show Main Platform panel...');
    hideAllPanels();
    document.getElementById('mainPlatformPanel').classList.remove('hidden');
    document.getElementById('loggedInUserName').textContent = userName;

    const adminAreaNote = document.getElementById('adminAreaNote');
    const participantFinancials = document.getElementById('participantFinancials');

    // Only show financial details for regular users
    if (currentUserData.role === 'user') {
        adminAreaNote.textContent = 'Here you can explore all features, except the administration area.';
        participantFinancials.classList.remove('hidden');
        document.getElementById('participantInvest').textContent = userInvest.toFixed(2);
        document.getElementById('participantGain').textContent = userGain.toFixed(2);
        document.getElementById('participantReferralCode').textContent = userReferralCode || 'N/A';
    } else {
        adminAreaNote.textContent = 'You are logged in as an administrator. Please use the appropriate dashboard for administrative tasks.';
        participantFinancials.classList.add('hidden'); // Hide for admins
    }
    console.log('Main Platform panel should be visible.');
}

function showAdminLoginRegister() {
    console.log('showAdminLoginRegister function called.'); // Added for debugging
    hideAllPanels();
    const leaderLoginPanel = document.getElementById('leaderLoginPanel');
    if (leaderLoginPanel) {
        leaderLoginPanel.classList.remove('hidden');
        console.log('Admin/Leader Login panel should be visible.');
    } else {
        console.error('Error: leaderLoginPanel element not found!');
    }
}

function showCEOLogin() {
    console.log('showCEOLogin function called.'); // Added for debugging
    hideAllPanels();
    const ceoLoginPanel = document.getElementById('ceoLoginPanel');
    if (ceoLoginPanel) {
        ceoLoginPanel.classList.remove('hidden');
        console.log('CEO Login panel should be visible.');
    } else {
        console.error('Error: ceoLoginPanel element not found!');
    }
}

function showContactAdmin() {
    hideAllPanels();
    document.getElementById('contactAdminPanel').classList.remove('hidden');
}

// --- User Authentication (Sign Up & Login) ---

document.getElementById('signUpForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode').value.trim();
    const msg = document.getElementById('signUpMsg');

    msg.classList.add('hidden');

    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
        msg.textContent = '❌ Please fill in all required fields (Name, Phone, Email, Password).';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    if (password !== confirmPassword) {
        msg.textContent = '❌ Passwords do not match.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, phoneNumber, email, password, referralCode })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from signup:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Sign up successful! Please proceed to payment.'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            setTimeout(() => showVerificationMessage(email), 1000);
        } else {
            msg.textContent = `❌ ${data.message || 'Signup failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Signup error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Login form submitted.'); // Added for debugging

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');

    msg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from login:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            saveAuthData(data.token, data.user);
            msg.textContent = '✅ Login successful! Redirecting...';
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('Login successful! Received user data:', data.user);

            if (data.user.role === 'user') {
                console.log('Login routing: User role detected. Checking payment status.');
                if (data.user.paid && data.user.status === 'active') {
                    setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
                } else {
                    setTimeout(() => showPaymentPanel(data.user.email), 500);
                }
            } else if (data.user.role === 'leader') {
                console.log('Login routing: Leader role detected. Showing Leader Dashboard.');
                hideAllPanels();
                document.getElementById('leaderPanel').classList.remove('hidden');
                document.getElementById('leaderNameDisplay').textContent = data.user.fullName;
                await loadPendingPayments();
                await loadRotationSettings();
                await loadAvailableMembersForRotation();
                await displayRotationParticipants();
                await loadUserMessages();
                await updateCurrentRecipientDisplay();
                await loadAdminUsers(); // Load users for management
            } else if (data.user.role === 'ceo') {
                console.log('Login routing: CEO role detected. Showing CEO Dashboard.');
                hideAllPanels();
                document.getElementById('ceoPanel').classList.remove('hidden');
                await displayRotationHistory();
                await displayAdminHistory(); // Load system history
                await loadAdminUsers(); // Load users for management (CEO also needs this)
            } else {
                console.warn('Login routing: Unknown user role received:', data.user.role, 'Defaulting to main platform.');
                setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
            }
        } else {
            msg.textContent = `❌ ${data.message || 'Login failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Login error:', error);
        msg.textContent = `❌ Network error: Could not reach the backend server. Please ensure 'nodemon server.js' is running in your Command Prompt.`;
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});

function logoutUser() {
    clearAuthData();
    showLogin();
}

// --- Payment Logic ---
function showPaymentInstructions(value) {
    const allDivs = ['cashInfo', 'mastercardInfo', 'paypalInfo', 'moncashInfo', 'natcashInfo'];
    allDivs.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('paymentInstructions').style.display = 'block';

    if(value && allDivs.includes(value + 'Info')) {
        document.getElementById(value + 'Info').classList.remove('hidden');
    } else {
        document.getElementById('paymentInstructions').style.display = 'none';
    }
}

document.getElementById('paymentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUserEmail = currentUserData.email; // Get email from stored user data
    const msg = document.getElementById('paymentMsg');
    msg.classList.add('hidden');

    if (!paymentMethod) {
        msg.textContent = '❌ Please select a payment method.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payments/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({
                email: currentUserEmail,
                method: paymentMethod,
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from payment submit:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            if (paymentMethod === 'cash') {
                msg.textContent = `✅ ${data.message || 'Payment method submitted. A team leader will validate your cash payment soon.'}`;
            } else {
                // For mastercard/paypal/moncash/natcash, backend would confirm direct payment
                currentUserData.paid = true;
                currentUserData.status = 'active'; // Frontend updates status immediately for non-cash
                saveAuthData(currentAuthToken, currentUserData);
                msg.textContent = `✅ ${data.message || 'Payment successful! Redirecting to platform...'}`;
                setTimeout(() => showMainPlatform(currentUserData.fullName, currentUserData.invest, currentUserData.gain, currentUserData.referralCode), 1500);
            }
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
        } else {
            msg.textContent = `❌ ${data.message || 'Payment submission failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Payment submission error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});


// --- User Message System ---
document.getElementById('contactAdminForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const messageText = document.getElementById('contactMessage').value.trim();
    const msg = document.getElementById('contactAdminMsg');

    msg.classList.add('hidden');

    if (!email || !subject || !messageText) {
        msg.textContent = '❌ Please fill in all fields.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromEmail: email, subject, message: messageText })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from send message:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Your message has been sent to support!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');

            document.getElementById('contactEmail').value = '';
            document.getElementById('contactSubject').value = '';
            document.getElementById('contactMessage').value = '';
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to send message.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Send message error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
});

// --- Admin (Team Leader / CEO) Logic ---

document.getElementById('leaderLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await loginAdmin('leader');
});

async function addAdmin() {
    const firstName = document.getElementById('newAdminFirstName').value.trim();
    const lastName = document.getElementById('newAdminLastName').value.trim();
    const phoneNumber = document.getElementById('newAdminPhoneNumber').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPass').value;
    const msg = document.getElementById('newAdminMsg');

    msg.classList.add('hidden');

    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        msg.textContent = '❌ Please fill all fields for the new admin.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/add-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ firstName, lastName, email, password, phoneNumber })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from add admin:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'New admin added successfully!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            // Clear form
            document.getElementById('newAdminFirstName').value = '';
            document.getElementById('newAdminLastName').value = '';
            document.getElementById('newAdminPhoneNumber').value = '';
            document.getElementById('newAdminEmail').value = '';
            document.getElementById('newAdminPass').value = '';
            await loadAdminUsers(); // Refresh user list
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to add admin.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Add admin error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
}


async function loginAdmin(role) {
    const emailInput = role === 'leader' ? 'loginLeaderEmail' : 'ceoLoginEmail';
    const passInput = role === 'leader' ? 'loginLeaderPass' : 'ceoLoginPassword';
    const msgId = role === 'leader' ? 'leaderLoginMsg' : 'ceoLoginMsg';

    const email = document.getElementById(emailInput).value.trim();
    const password = document.getElementById(passInput).value;
    const msg = document.getElementById(msgId);

    msg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from admin login:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            saveAuthData(data.token, data.user);
            msg.textContent = '✅ Login successful! Redirecting...';
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log(`Admin/Leader Login successful! Received user data:`, data.user);

            if (data.user.role === 'user') {
                console.log('Login routing: User role detected. Checking payment status.');
                if (data.user.paid && data.user.status === 'active') {
                    setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
                } else {
                    setTimeout(() => showPaymentPanel(data.user.email), 500);
                }
            } else if (data.user.role === 'leader') {
                console.log('Initial load routing: Leader role detected. Showing Leader Dashboard.');
                hideAllPanels();
                document.getElementById('leaderPanel').classList.remove('hidden');
                document.getElementById('leaderNameDisplay').textContent = data.user.fullName;
                await loadPendingPayments();
                await loadRotationSettings();
                await loadAvailableMembersForRotation();
                await displayRotationParticipants();
                await loadUserMessages();
                await updateCurrentRecipientDisplay();
                await loadAdminUsers(); // Load users for management
            } else if (data.user.role === 'ceo') {
                console.log('Initial load routing: CEO role detected. Showing CEO Dashboard.');
                hideAllPanels();
                document.getElementById('ceoPanel').classList.remove('hidden');
                await displayRotationHistory();
                await displayAdminHistory(); // Load system history
                await loadAdminUsers(); // Load users for management
            } else {
                console.warn('Login routing: Unknown user role received:', data.user.role, 'Defaulting to main platform.');
                setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
            }
        } else {
            msg.textContent = `❌ ${data.message || 'Login failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error(`${role} login error:`, error);
        msg.textContent = `❌ Network error: Could not reach the backend server. Please ensure 'nodemon server.js' is running in your Command Prompt.`;
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});

function logoutLeader() {
    clearAuthData();
    showLogin();
}

document.getElementById('ceoLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await loginAdmin('ceo');
});

function logoutCEO() {
    clearAuthData();
    showLogin();
}

async function loadPendingPayments() {
    const list = document.getElementById('pendingPaymentsList');
    list.innerHTML = '';
    document.getElementById('noPendingPayments').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/payments/pending`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch pending payments');
        const pendingPayments = await response.json();

        let hasPending = false;
        pendingPayments.forEach(payment => {
            hasPending = true;
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${payment.userName}</strong> (${payment.userEmail}) - Method: ${payment.method} - Submitted: ${new Date(payment.timestamp).toLocaleString()}
                <div>
                    <button style="background-color: #28a745;" onclick="validatePayment('${payment.userEmail}')">Validate</button>
                    <button style="background-color: #dc3545; margin-left: 5px;" onclick="rejectPayment('${payment.userEmail}')">Reject</button>
                </div>
            `;
            list.appendChild(listItem);
        });
        document.getElementById('noPendingPayments').classList.toggle('hidden', hasPending);
    } catch (error) {
        console.error('Error loading pending payments:', error);
        list.innerHTML = '<li>Error loading pending payments.</li>';
        document.getElementById('noPendingPayments').classList.add('hidden');
    }
}

async function validatePayment(email) {
    // Replacing confirm with direct action for now, as confirm() is disallowed.
    // In a real application, implement a custom modal for user confirmation.
    displayTempMessage(`Validating payment for ${email}...`, false);
    try {
        const response = await fetch(`${API_BASE_URL}/payments/validate/${email}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayTempMessage(data.message || `Payment for ${email} validated! Account activated.`, true);
            await loadPendingPayments();
            await loadAvailableMembersForRotation();
            await displayRotationParticipants();
            await updateCurrentRecipientDisplay();
            await loadAdminUsers(); // Refresh user list after status change
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error validating payment: ${data.message || 'Unknown error.'}`, false);
        }
    } catch (error) {
        console.error('Error validating payment:', error);
        displayTempMessage('Network error or server unreachable. Could not validate payment.', false);
    }
}

async function rejectPayment(email) {
    // Replacing confirm with direct action for now, as confirm() is disallowed.
    // In a real application, implement a custom modal for user confirmation.
    displayTempMessage(`Rejecting payment for ${email}...`, false);
    try {
        const response = await fetch(`${API_BASE_URL}/payments/reject/${email}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayTempMessage(data.message || `Payment for ${email} rejected.`, true);
            await loadPendingPayments();
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error rejecting payment: ${data.message || 'Unknown error.'}`, false);
        }
    } catch (error) {
        console.error('Error rejecting payment:', error);
        displayTempMessage('Network error or server unreachable. Could not reject payment.', false);
    }
}

async function loadUserMessages() {
    const list = document.getElementById('userMessagesList');
    list.innerHTML = '';
    document.getElementById('noUserMessages').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user messages');
        const messages = await response.json();

        let unreadCount = 0;
        let hasMessages = false;

        messages.forEach(message => {
            hasMessages = true;
            if (message.status === 'unread') {
                unreadCount++;
            }
            const listItem = document.createElement('li');
            listItem.classList.toggle('unread', message.status === 'unread');
            listItem.innerHTML = `
                <strong>From:</strong> ${message.fromEmail}<br>
                <strong>Subject:</strong> ${message.subject}<br>
                <strong>Message:</strong> ${message.message}<br>
                <small><em>Sent: ${new Date(message.timestamp).toLocaleString()} - Status: ${message.status.toUpperCase()}</em></small><br>
                <button style="margin-top: 5px; background-color: #007bff; font-size: 0.9em; padding: 5px 10px;" onclick="markMessageAsRead('${message.id}')">Mark as Read</button>
                <button style="margin-top: 5px; background-color: #dc3545; font-size: 0.9em; padding: 5px 10px; margin-left: 5px;" onclick="deleteMessage('${message.id}')">Delete</button>
            `;
            list.appendChild(listItem);
        });

        document.getElementById('unreadMessageCount').textContent = `(${unreadCount} unread)`;
        document.getElementById('noUserMessages').classList.toggle('hidden', hasMessages);

    } catch (error) {
        console.error('Error loading user messages:', error);
        list.innerHTML = '<li>Error loading messages.</li>';
        document.getElementById('noUserMessages').classList.add('hidden');
    }
}

async function markMessageAsRead(messageId) {
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to mark message as read');
        displayTempMessage('Message marked as read.', true);
        await loadUserMessages();
        await displayAdminHistory(); // Update history
    } catch (error) {
        console.error('Error marking message as read:', error);
        displayTempMessage('Could not mark message as read.', false);
    }
}

async function deleteMessage(messageId) {
    // Replacing confirm with direct action for now, as confirm() is disallowed.
    // In a real application, implement a custom modal for user confirmation.
    displayTempMessage(`Deleting message ${messageId}...`, false);
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to delete message');
        displayTempMessage('Message deleted.', true);
        await loadUserMessages();
        await displayAdminHistory(); // Update history
    } catch (error) {
        console.error('Error deleting message:', error);
        displayTempMessage('Could not delete message.', false);
    }
}


// --- Rotation Management Logic ---

async function loadRotationSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/rotation/settings`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch rotation settings');
        const settings = await response.json();
        document.getElementById('dailyInvest').value = settings.invest;
        document.getElementById('currentRotationDay').textContent = settings.currentDay;
    } catch (error) {
        console.error('Error loading rotation settings:', error);
        document.getElementById('dailyInvest').value = 10; // Default
        document.getElementById('currentRotationDay').textContent = 'Error';
    }
}

async function saveRotationSettings() {
    const invest = parseFloat(document.getElementById('dailyInvest').value);
    const msg = document.getElementById('rotationSettingsMsg');
    msg.classList.add('hidden');

    if (isNaN(invest) || invest < 0) {
        msg.textContent = '❌ Please enter a valid number for Individual Participant Investment.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ invest })
        });
        const data = await response.json();

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Rotation settings updated!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            await displayAdminHistory(); // Update history
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to update settings.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Save settings error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

async function loadAvailableMembersForRotation() {
    const select = document.getElementById('availableMembersSelect');
    select.innerHTML = '<option value="">-- Select Paid & Active Member --</option>';
    document.getElementById('noActiveParticipants').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/users/paid-not-in-rotation`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch available members');
        const availableMembers = await response.json();

        let hasAvailable = false;
        availableMembers.forEach(user => {
            hasAvailable = true;
            const option = document.createElement('option');
            option.value = user.email;
            option.textContent = `${user.fullName} (${user.email})`;
            select.appendChild(option);
        });
        if (!hasAvailable && await getActiveRotationMembersCount() === 0) {
            document.getElementById('noActiveParticipants').classList.remove('hidden');
        } else {
            document.getElementById('noActiveParticipants').classList.add('hidden');
        }

    } catch (error) {
        console.error('Error loading available members:', error);
        select.innerHTML = '<option value="">-- Error loading members --</option>';
    }
}

async function getActiveRotationMembersCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) return 0;
        const participants = await response.json();
        return participants.length;
    } catch (error) {
        console.error('Error fetching active rotation members count:', error);
        return 0;
    }
}

async function addParticipantToRotation() {
    const select = document.getElementById('availableMembersSelect');
    const emailToAdd = select.value;
    const msg = document.getElementById('addParticipantMsg');
    msg.classList.add('hidden');

    if (!emailToAdd) {
        msg.textContent = '❌ Please select a member to add.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/add-participant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ email: emailToAdd })
        });
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from add participant:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Participant added to rotation!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            await loadAvailableMembersForRotation();
            await displayRotationParticipants();
            await updateCurrentRecipientDisplay();
            await displayAdminHistory(); // Update history
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to add participant.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Add participant error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

async function displayRotationParticipants() {
    const list = document.getElementById('rotationParticipantsList');
    list.innerHTML = '';
    document.getElementById('noActiveParticipants').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch participants');
        const participants = await response.json();

        let hasParticipants = false;
        let currentRecipientIndex = -1;
        try {
            const settingsResponse = await fetch(`${API_BASE_URL}/rotation/settings`, {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            if (settingsResponse.ok) {
                const settings = await settingsResponse.json();
                currentRecipientIndex = settings.lastPaidMemberIndex;
            } else {
                console.warn('Could not fetch rotation settings for current recipient, using default -1.');
            }
        } catch (error) {
            console.error('Error fetching rotation settings for recipient:', error);
        }


        if (participants.length > 0) {
            hasParticipants = true;
            participants.forEach((user, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${user.fullName} (${user.email})`;
                if (index === currentRecipientIndex) {
                    listItem.classList.add('current-recipient');
                    listItem.title = "Last member who received payment";
                }
                list.appendChild(listItem);
            });
        }
        document.getElementById('noActiveParticipants').classList.toggle('hidden', hasParticipants);
    }
    catch (error) {
        console.error('Error displaying rotation participants:', error);
        list.innerHTML = '<li>Error loading participants.</li>';
        document.getElementById('noActiveParticipants').classList.add('hidden');
    }
}

async function updateCurrentRecipientDisplay() {
    const currentRecipientDisplay = document.getElementById('currentRecipientDisplay');
    currentRecipientDisplay.textContent = 'N/A';

    try {
        const settingsResponse = await fetch(`${API_BASE_URL}/rotation/settings`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const settings = await settingsResponse.json();

        const participantsResponse = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        // FIX: Corrected variable name from `participants` to `participantsResponse`
        const participants = await participantsResponse.json(); 

        if (settings.lastPaidMemberIndex !== -1 && participants[settings.lastPaidMemberIndex]) {
            const recipient = participants[settings.lastPaidMemberIndex];
            currentRecipientDisplay.textContent = `${recipient.fullName} (${recipient.email})`;
        } else {
            currentRecipientDisplay.textContent = 'No recipient yet or no participants.';
        }
    } catch (error) {
        console.error('Error updating current recipient display:', error);
        currentRecipientDisplay.textContent = 'Error loading recipient.';
    }
}

async function nextParticipant() {
    const msg = document.getElementById('rotationStatusMsg');
    msg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/next`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from next participant:', jsonError);
            displayTempMessage(`Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`, false);
            return;
        }

        if (response.ok) {
            displayTempMessage(data.message || 'Rotation moved to next participant!', true);
            await loadRotationSettings();
            await displayRotationParticipants();
            await updateCurrentRecipientDisplay();
            await displayRotationHistory();
            await displayAdminHistory(); // Update history
            // If the current user is the recipient, update their dashboard
            if (currentUserData.role === 'user' && currentUserData.id === data.currentRecipient.id) {
                currentUserData.gain = data.winnerGain; // Update local gain
                saveAuthData(currentAuthToken, currentUserData); // Save updated user data
                document.getElementById('participantGain').textContent = data.winnerGain.toFixed(2);
            }
        } else {
            displayTempMessage(`Error during rotation: ${data.message || 'Unknown error.'}`, false);
        }
    } catch (error) {
        console.error('Next participant error:', error);
        displayTempMessage('Network error: Could not reach server. Please ensure the backend is running.', false);
    }
}


// --- Admin User Management Functions ---
async function loadAdminUsers() {
    const tableBody = document.querySelector('#adminUsersTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('noUsersFound').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user list');
        const users = await response.json();

        let hasUsers = false;
        users.forEach(user => {
            hasUsers = true;
            const row = tableBody.insertRow();
            row.insertCell().textContent = user.fullName;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.role + (user.adminLevel ? ` (${user.adminLevel})` : '');
            row.insertCell().innerHTML = `<span class="${user.isPaid ? 'status-paid' : 'status-unpaid'}">${user.isPaid ? 'Paid' : 'Unpaid'}</span>`;
            row.insertCell().innerHTML = `<span class="${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status.toUpperCase()}</span>`;

            const actionsCell = row.insertCell();
            if (user.id !== currentUserData.id && !(user.adminLevel === 'superAdmin' && currentUserData.adminLevel !== 'superAdmin')) { // Cannot deactivate self or superAdmin by subAdmin
                if (user.status === 'active') {
                    const deactivateBtn = document.createElement('button');
                    deactivateBtn.textContent = 'Deactivate';
                    deactivateBtn.style.backgroundColor = '#f0ad4e'; // Warning yellow
                    deactivateBtn.onclick = () => updateUserStatus(user.id, 'inactive');
                    actionsCell.appendChild(deactivateBtn);
                } else {
                    const activateBtn = document.createElement('button');
                    activateBtn.textContent = 'Activate';
                    activateBtn.style.backgroundColor = '#5cb85c'; // Success green
                    activateBtn.onclick = () => updateUserStatus(user.id, 'active');
                    actionsCell.appendChild(activateBtn);
                }
            } else {
                actionsCell.textContent = 'N/A'; // Cannot change status
            }
        });
        document.getElementById('noUsersFound').classList.toggle('hidden', hasUsers);
    } catch (error) {
        console.error('Error loading admin users:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading user list.</td>';
        document.getElementById('noUsersFound').classList.add('hidden');
    }
}

async function updateUserStatus(userId, status) {
    // Replacing confirm with direct action for now, as confirm() is disallowed.
    // In a real application, implement a custom modal for user confirmation.
    displayTempMessage(`Updating status for user ${userId} to ${status}...`, false);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();

        if (response.ok) {
            displayTempMessage(data.message || `User status updated to ${status}.`, true);
            await loadAdminUsers(); // Refresh the user list
            await loadAvailableMembersForRotation(); // Refresh available participants
            await displayRotationParticipants(); // Refresh rotation list
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error updating user status: ${data.message || 'Unknown error.'}`, false);
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        displayTempMessage('Network error or server unreachable. Could not update user status.', false);
    }
}

async function generateReferralCode() {
    const msg = document.getElementById('generatedReferralCodeMsg');
    const codeDisplay = document.getElementById('generatedReferralCode');
    msg.classList.add('hidden');
    codeDisplay.textContent = 'Generating...';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/referral-code/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const data = await response.json();

        if (response.ok) {
            codeDisplay.textContent = data.referralCode;
            msg.textContent = `✅ ${data.message || 'New referral code generated!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            await displayAdminHistory(); // Update history
        } else {
            codeDisplay.textContent = 'Error';
            msg.textContent = `❌ ${data.message || 'Failed to generate referral code.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
        }
    } catch (error) {
        console.error('Generate referral code error:', error);
        codeDisplay.textContent = 'Error';
        msg.textContent = '❌ Network error: Could not reach server.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
}


// --- CEO Specific Functions ---

async function displayRotationHistory() {
    const tableBody = document.querySelector('#ceoRotationHistoryTable tbody');
    tableBody.innerHTML = '';
    const noHistoryMsg = document.getElementById('noRotationHistory');
    noHistoryMsg.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        let history;
        try {
            history = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from rotation history:', jsonError);
            tableBody.innerHTML = '<tr><td colspan="6">Server communication problem: Expected JSON, but received unexpected data.</td></tr>';
            noHistoryMsg.classList.add('hidden');
            return;
        }

        if (!response.ok) throw new Error(`Failed to fetch rotation history: ${history.message || response.statusText}`);


        if (history.length === 0) {
            return;
        } else {
            noHistoryMsg.classList.add('hidden');
        }

        // Display newest first
        [...history].reverse().forEach(entry => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = entry.day;
            row.insertCell().textContent = `${entry.recipientName} (${entry.recipientEmail})`;
            row.insertCell().textContent = entry.invest.toFixed(2);
            row.insertCell().textContent = entry.totalPool.toFixed(2); // New: Display total pool
            row.insertCell().textContent = entry.gain.toFixed(2);
            row.insertCell().textContent = new Date(entry.timestamp).toLocaleString();
        });

    } catch (error) {
        console.error('Error loading rotation history:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading history.</td></tr>';
        noHistoryMsg.classList.add('hidden');
    }
}

async function displayAdminHistory() {
    const tableBody = document.querySelector('#adminHistoryTable tbody');
    tableBody.innerHTML = '';
    const noHistoryMsg = document.getElementById('noAdminHistory');
    noHistoryMsg.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        let history;
        try {
            history = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse JSON response from admin history:', jsonError);
            tableBody.innerHTML = '<tr><td colspan="4">Server communication problem: Expected JSON, but received unexpected data.</td></tr>';
            noHistoryMsg.classList.add('hidden');
            return;
        }

        if (!response.ok) throw new Error(`Failed to fetch admin history: ${history.message || response.statusText}`);

        if (history.length === 0) {
            return;
        } else {
            noHistoryMsg.classList.add('hidden');
        }

        // Display newest first
        [...history].reverse().forEach(entry => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = new Date(entry.timestamp).toLocaleString();
            row.insertCell().textContent = entry.type;
            row.insertCell().textContent = entry.description;
            row.insertCell().textContent = JSON.stringify(entry.details); // Display details as JSON string
        });

    } catch (error) {
        console.error('Error loading admin history:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Error loading system history.</td></tr>';
        noHistoryMsg.classList.add('hidden');
    }
}


function calculRotation() {
    const msg = document.getElementById('ceoReportMsg');
    msg.textContent = 'This button can be expanded to generate more complex reports (e.g., total funds, financial projections, export data). For now, please view the history tables above.';
    msg.classList.remove('hidden');
    msg.classList.remove('success-msg');
    msg.classList.add('error-msg');
    setTimeout(() => msg.classList.add('hidden'), 4000);
}

// --- Initial Load Logic ---
window.onload = async function() {
    console.log("window.onload triggered.");
    // Here, we check if a token exists, and if so, attempt to validate it with the backend
    // This is how a "session" would persist.
    if (currentAuthToken && currentUserData.email && currentUserData.role) {
        console.log("Auth token and user data found in localStorage. Attempting token verification.");
        try {
            // Verify the token with the backend
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response from token verification:', jsonError);
                clearAuthData();
                showLogin();
                return;
            }

            if (response.ok) {
                // Token is valid, proceed based on role
                console.log('Token verified. User data from token:', data.user);
                saveAuthData(data.token, data.user); // Update currentUserData with fresh data from backend

                if (data.user.role === 'user') {
                    console.log('Initial load routing: User role detected. Checking payment status.');
                    if (data.user.paid && data.user.status === 'active') {
                        showMainPlatform(data.user.fullName || data.user.email, data.user.invest, data.user.gain, data.user.referralCode);
                    } else {
                        showPaymentPanel(data.user.email);
                    }
                } else if (data.user.role === 'leader') {
                    console.log('Initial load routing: Leader role detected. Showing Leader Dashboard.');
                    hideAllPanels();
                    document.getElementById('leaderPanel').classList.remove('hidden');
                    document.getElementById('leaderNameDisplay').textContent = data.user.fullName;
                    await loadPendingPayments();
                    await loadRotationSettings();
                    await loadAvailableMembersForRotation();
                    await displayRotationParticipants();
                    await loadUserMessages();
                    await updateCurrentRecipientDisplay();
                    await loadAdminUsers(); // Load users for management
                } else if (data.user.role === 'ceo') {
                    console.log('Initial load routing: CEO role detected. Showing CEO Dashboard.');
                    hideAllPanels();
                    document.getElementById('ceoPanel').classList.remove('hidden');
                    await displayRotationHistory();
                    await displayAdminHistory(); // Load system history
                    await loadAdminUsers(); // Load users for management
                } else {
                    console.warn('Initial load routing: Unknown role from token verification:', data.user.role, 'Defaulting to login.');
                    clearAuthData();
                    showLogin();
                }
            } else {
                console.warn('Auth token invalid/expired or server reported error, forcing re-login.', data.message);
                clearAuthData();
                showLogin();
            }
        } catch (error) {
            console.error('Error during initial token verification:', error);
            clearAuthData();
            showLogin();
        }
    } else {
        console.log('No auth token found or incomplete user data. Showing signup/login.');
        showSignUp();
    }
};
