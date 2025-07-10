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
        adminAreaNote.textContent = 'Here you can explore all features, except the administration area.';
        participantFinancials.classList.remove('hidden');
        document.getElementById('participantInvest').textContent = userInvest.toFixed(2);
        document.getElementById('participantGain').textContent = userGain.toFixed(2);
        document.getElementById('participantReferralCode').textContent = userReferralCode || 'N/A';
        console.log('Main Platform: Displaying user financial details.');
    } else {
        adminAreaNote.textContent = 'You are logged in as an administrator. Please use the appropriate dashboard for administrative tasks.';
        participantFinancials.classList.add('hidden'); // Hide for admins
        console.log('Main Platform: Hiding financial details for admin.');
    }
    console.log('FUNC: showMainPlatform completed. Main Platform panel should be visible.');
}

function showAdminLoginRegister() {
    console.log('FUNC: showAdminLoginRegister called. Attempting to show Admin/Leader Login panel...');
    hideAllPanels();
    const leaderLoginPanel = document.getElementById('leaderLoginPanel');
    if (leaderLoginPanel) {
        leaderLoginPanel.classList.remove('hidden');
        console.log('FUNC: showAdminLoginRegister completed. Admin/Leader Login panel should be visible.');
    } else {
        console.error('ERROR: leaderLoginPanel element not found!');
    }
}

function showCEOLogin() {
    console.log('FUNC: showCEOLogin called. Attempting to show CEO Login panel...');
    hideAllPanels();
    const ceoLoginPanel = document.getElementById('ceoLoginPanel');
    if (ceoLoginPanel) {
        ceoLoginPanel.classList.remove('hidden');
        console.log('FUNC: showCEOLogin completed. CEO Login panel should be visible.');
    } else {
        console.error('ERROR: ceoLoginPanel element not found!');
    }
}

function showContactAdmin() {
    console.log('FUNC: showContactAdmin called. Attempting to show Contact Admin panel...');
    hideAllPanels();
    document.getElementById('contactAdminPanel').classList.remove('hidden');
    console.log('FUNC: showContactAdmin completed. Contact Admin panel should be visible.');
}

// --- User Authentication (Sign Up & Login) ---

document.getElementById('signUpForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('EVENT: signUpForm submitted.');

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode').value.trim();
    const msg = document.getElementById('signUpMsg');

    msg.classList.add('hidden');

    console.log('Signup Form Data:', { firstName, lastName, phoneNumber, email, password: '***', confirmPassword: '***', referralCode });

    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
        msg.textContent = '❌ Please fill in all required fields (First Name, Last Name, Phone, Email, Password).';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Signup form validation failed: Missing fields.');
        return;
    }

    if (password !== confirmPassword) {
        msg.textContent = '❌ Passwords do not match.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Signup form validation failed: Passwords do not match.');
        return;
    }

    try {
        console.log('FETCH: Sending signup request to backend...');
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, phoneNumber, email, password, referralCode })
        });
        console.log('FETCH: Signup response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Signup response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from signup:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Sign up successful! Please proceed to payment.'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('SIGNUP: Successful. Showing verification message.');
            setTimeout(() => showVerificationMessage(email), 1000);
        } else {
            msg.textContent = `❌ ${data.message || 'Signup failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('SIGNUP: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Signup fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('EVENT: loginForm submitted.');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');

    msg.classList.add('hidden');
    console.log('Login Form Data:', { email, password: '***' });

    try {
        console.log('FETCH: Sending login request to backend...');
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        console.log('FETCH: Login response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Login response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from login:', jsonError);
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
            console.log('LOGIN: Successful. Received user data:', data.user);

            if (data.user.role === 'user') {
                console.log('LOGIN ROUTING: User role detected. Checking payment status.');
                if (data.user.paid && data.user.status === 'active') {
                    console.log('LOGIN ROUTING: User is paid and active. Showing Main Platform.');
                    setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
                } else {
                    console.log('LOGIN ROUTING: User is not paid or not active. Showing Payment Panel.');
                    setTimeout(() => showPaymentPanel(data.user.email), 500);
                }
            } else if (data.user.role === 'leader') {
                console.log('LOGIN ROUTING: Leader role detected. Showing Leader Dashboard.');
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
                console.log('LOGIN ROUTING: CEO role detected. Showing CEO Dashboard.');
                hideAllPanels();
                document.getElementById('ceoPanel').classList.remove('hidden');
                await displayRotationHistory();
                await displayAdminHistory(); // Load system history
                await loadAdminUsers(); // Load users for management (CEO also needs this)
            } else {
                console.warn('LOGIN ROUTING: Unknown user role received:', data.user.role, 'Defaulting to main platform.');
                setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
            }
        } else {
            msg.textContent = `❌ ${data.message || 'Login failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('LOGIN: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Login fetch error:', error);
        msg.textContent = `❌ Network error: Could not reach the backend server. Please ensure 'nodemon server.js' is running in your Command Prompt.`;
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});

function logoutUser() {
    console.log('FUNC: logoutUser called.');
    clearAuthData();
    showLogin();
}

// --- Payment Logic ---
function showPaymentInstructions(value) {
    console.log('FUNC: showPaymentInstructions called with value:', value);
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
    console.log('EVENT: paymentForm submitted.');
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUserEmail = currentUserData.email; // Get email from stored user data
    const msg = document.getElementById('paymentMsg');
    msg.classList.add('hidden');

    console.log('Payment Form Data:', { paymentMethod, currentUserEmail });

    if (!paymentMethod) {
        msg.textContent = '❌ Please select a payment method.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Payment form validation failed: No method selected.');
        return;
    }

    try {
        console.log('FETCH: Sending payment submission request to backend...');
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
        console.log('FETCH: Payment submission response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Payment submission response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from payment submit:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            if (paymentMethod === 'cash') {
                msg.textContent = `✅ ${data.message || 'Payment method submitted. A team leader will validate your cash payment soon.'}`;
                console.log('PAYMENT: Cash payment submitted.');
            } else {
                currentUserData.paid = true;
                currentUserData.status = 'active'; // Frontend updates status immediately for non-cash
                saveAuthData(currentAuthToken, currentUserData);
                msg.textContent = `✅ ${data.message || 'Payment successful! Redirecting to platform...'}`;
                console.log('PAYMENT: Direct payment successful. Showing Main Platform.');
                setTimeout(() => showMainPlatform(currentUserData.fullName, currentUserData.invest, currentUserData.gain, currentUserData.referralCode), 1500);
            }
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
        } else {
            msg.textContent = `❌ ${data.message || 'Payment submission failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('PAYMENT: Submission failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Payment submission fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
});


// --- User Message System ---
document.getElementById('contactAdminForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('EVENT: contactAdminForm submitted.');

    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const messageText = document.getElementById('contactMessage').value.trim();
    const msg = document.getElementById('contactAdminMsg');

    msg.classList.add('hidden');
    console.log('Contact Admin Form Data:', { email, subject, messageText });

    if (!email || !subject || !messageText) {
        msg.textContent = '❌ Please fill in all fields.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Contact form validation failed: Missing fields.');
        return;
    }

    try {
        console.log('FETCH: Sending message to admin backend...');
        const response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromEmail: email, subject, message: messageText })
        });
        console.log('FETCH: Message send response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Message send response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from send message:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Your message has been sent to support!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('MESSAGE: Sent successfully.');

            document.getElementById('contactEmail').value = '';
            document.getElementById('contactSubject').value = '';
            document.getElementById('contactMessage').value = '';
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to send message.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('MESSAGE: Send failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Send message fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
});

// --- Admin (Team Leader / CEO) Logic ---

document.getElementById('leaderLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('EVENT: leaderLoginForm submitted.');
    await loginAdmin('leader');
});

async function addAdmin() {
    console.log('FUNC: addAdmin called.');
    const firstName = document.getElementById('newAdminFirstName').value.trim();
    const lastName = document.getElementById('newAdminLastName').value.trim();
    const phoneNumber = document.getElementById('newAdminPhoneNumber').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPass').value;
    const msg = document.getElementById('newAdminMsg');

    msg.classList.add('hidden');
    console.log('Add Admin Form Data:', { firstName, lastName, phoneNumber, email, password: '***' });

    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        msg.textContent = '❌ Please fill all fields for the new admin.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Add Admin form validation failed: Missing fields.');
        return;
    }

    try {
        console.log('FETCH: Sending add admin request to backend...');
        const response = await fetch(`${API_BASE_URL}/admin/add-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ firstName, lastName, email, password, phoneNumber })
        });
        console.log('FETCH: Add admin response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Add admin response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from add admin:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'New admin added successfully!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('ADD ADMIN: Successful.');
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
            console.log('ADD ADMIN: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Add admin fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
}


async function loginAdmin(role) {
    console.log(`FUNC: loginAdmin called for role: ${role}`);
    const emailInput = role === 'leader' ? 'loginLeaderEmail' : 'ceoLoginEmail';
    const passInput = role === 'leader' ? 'loginLeaderPass' : 'ceoLoginPassword';
    const msgId = role === 'leader' ? 'leaderLoginMsg' : 'ceoLoginMsg';

    const email = document.getElementById(emailInput).value.trim();
    const password = document.getElementById(passInput).value;
    const msg = document.getElementById(msgId);

    msg.classList.add('hidden');
    console.log(`Login Admin Form Data (${role}):`, { email, password: '***' });

    try {
        console.log('FETCH: Sending admin login request to backend...');
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        console.log('FETCH: Admin login response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('FETCH: Admin login response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from admin login:', jsonError);
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
            console.log(`ADMIN LOGIN: Successful. Received user data:`, data.user);

            if (data.user.role === 'user') {
                console.log('LOGIN ROUTING: User role detected during admin login. Checking payment status.');
                if (data.user.paid && data.user.status === 'active') {
                    setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
                } else {
                    setTimeout(() => showPaymentPanel(data.user.email), 500);
                }
            } else if (data.user.role === 'leader') {
                console.log('LOGIN ROUTING: Leader role detected. Showing Leader Dashboard.');
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
                console.log('LOGIN ROUTING: CEO role detected. Showing CEO Dashboard.');
                hideAllPanels();
                document.getElementById('ceoPanel').classList.remove('hidden');
                await displayRotationHistory();
                await displayAdminHistory(); // Load system history
                await loadAdminUsers(); // Load users for management
            } else {
                console.warn('LOGIN ROUTING: Unknown user role received during admin login:', data.user.role, 'Defaulting to main platform.');
                setTimeout(() => showMainPlatform(data.user.fullName, data.user.invest, data.user.gain, data.user.referralCode), 500);
            }
        } else {
            msg.textContent = `❌ ${data.message || 'Login failed.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('ADMIN LOGIN: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error(`ERROR: ${role} login fetch error:`, error);
        msg.textContent = `❌ Network error: Could not reach the backend server. Please ensure 'nodemon server.js' is running in your Command Prompt.`;
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
}

function logoutLeader() {
    console.log('FUNC: logoutLeader called.');
    clearAuthData();
    showLogin();
}

document.getElementById('ceoLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('EVENT: ceoLoginForm submitted.');
    await loginAdmin('ceo');
});

function logoutCEO() {
    console.log('FUNC: logoutCEO called.');
    clearAuthData();
    showLogin();
}

async function loadPendingPayments() {
    console.log('FUNC: loadPendingPayments called.');
    const list = document.getElementById('pendingPaymentsList');
    list.innerHTML = '';
    document.getElementById('noPendingPayments').classList.remove('hidden');

    try {
        console.log('FETCH: Requesting pending payments...');
        const response = await fetch(`${API_BASE_URL}/payments/pending`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Pending payments response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch pending payments');
        const pendingPayments = await response.json();
        console.log('FETCH: Pending payments data:', pendingPayments);

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
        console.log('Pending payments displayed. Has pending:', hasPending);
    } catch (error) {
        console.error('ERROR: Error loading pending payments:', error);
        list.innerHTML = '<li>Error loading pending payments.</li>';
        document.getElementById('noPendingPayments').classList.add('hidden');
    }
}

async function validatePayment(email) {
    console.log('FUNC: validatePayment called for email:', email);
    displayTempMessage(`Validating payment for ${email}...`, false);
    try {
        console.log('FETCH: Sending validate payment request...');
        const response = await fetch(`${API_BASE_URL}/payments/validate/${email}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Validate payment response status:', response.status);
        const data = await response.json();
        console.log('FETCH: Validate payment response data:', data);

        if (response.ok) {
            displayTempMessage(data.message || `Payment for ${email} validated! Account activated.`, true);
            console.log('PAYMENT VALIDATION: Successful. Reloading dashboards.');
            await loadPendingPayments();
            await loadAvailableMembersForRotation();
            await displayRotationParticipants();
            await updateCurrentRecipientDisplay();
            await loadAdminUsers(); // Refresh user list after status change
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error validating payment: ${data.message || 'Unknown error.'}`, false);
            console.log('PAYMENT VALIDATION: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Error validating payment:', error);
        displayTempMessage('Network error or server unreachable. Could not validate payment.', false);
    }
}

async function rejectPayment(email) {
    console.log('FUNC: rejectPayment called for email:', email);
    displayTempMessage(`Rejecting payment for ${email}...`, false);
    try {
        console.log('FETCH: Sending reject payment request...');
        const response = await fetch(`${API_BASE_URL}/payments/reject/${email}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Reject payment response status:', response.status);
        const data = await response.json();
        console.log('FETCH: Reject payment response data:', data);

        if (response.ok) {
            displayTempMessage(data.message || `Payment for ${email} rejected.`, true);
            console.log('PAYMENT REJECTION: Successful. Reloading dashboards.');
            await loadPendingPayments();
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error rejecting payment: ${data.message || 'Unknown error.'}`, false);
            console.log('PAYMENT REJECTION: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Error rejecting payment:', error);
        displayTempMessage('Network error or server unreachable. Could not reject payment.', false);
    }
}

async function loadUserMessages() {
    console.log('FUNC: loadUserMessages called.');
    const list = document.getElementById('userMessagesList');
    list.innerHTML = '';
    document.getElementById('noUserMessages').classList.remove('hidden');

    try {
        console.log('FETCH: Requesting user messages...');
        const response = await fetch(`${API_BASE_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: User messages response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch user messages');
        const messages = await response.json();
        console.log('FETCH: User messages data:', messages);

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
        console.log('User messages displayed. Unread count:', unreadCount);

    } catch (error) {
        console.error('ERROR: Error loading user messages:', error);
        list.innerHTML = '<li>Error loading messages.</li>';
        document.getElementById('noUserMessages').classList.add('hidden');
    }
}

async function markMessageAsRead(messageId) {
    console.log('FUNC: markMessageAsRead called for messageId:', messageId);
    try {
        console.log('FETCH: Sending mark message as read request...');
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Mark message as read response status:', response.status);
        if (!response.ok) throw new Error('Failed to mark message as read');
        displayTempMessage('Message marked as read.', true);
        console.log('MESSAGE READ: Successful. Reloading messages.');
        await loadUserMessages();
        await displayAdminHistory(); // Update history
    } catch (error) {
        console.error('ERROR: Error marking message as read:', error);
        displayTempMessage('Could not mark message as read.', false);
    }
}

async function deleteMessage(messageId) {
    console.log('FUNC: deleteMessage called for messageId:', messageId);
    displayTempMessage(`Deleting message ${messageId}...`, false);
    try {
        console.log('FETCH: Sending delete message request...');
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Delete message response status:', response.status);
        if (!response.ok) throw new Error('Failed to delete message');
        displayTempMessage('Message deleted.', true);
        console.log('MESSAGE DELETE: Successful. Reloading messages.');
        await loadUserMessages();
        await displayAdminHistory(); // Update history
    } catch (error) {
        console.error('ERROR: Error deleting message:', error);
        displayTempMessage('Could not delete message.', false);
    }
}


// --- Rotation Management Logic ---

async function loadRotationSettings() {
    console.log('FUNC: loadRotationSettings called.');
    try {
        console.log('FETCH: Requesting rotation settings...');
        const response = await fetch(`${API_BASE_URL}/rotation/settings`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Rotation settings response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch rotation settings');
        const settings = await response.json();
        console.log('FETCH: Rotation settings data:', settings);
        document.getElementById('dailyInvest').value = settings.invest;
        document.getElementById('currentRotationDay').textContent = settings.currentDay;
        console.log('Rotation settings loaded and displayed.');
    } catch (error) {
        console.error('ERROR: Error loading rotation settings:', error);
        document.getElementById('dailyInvest').value = 10; // Default
        document.getElementById('currentRotationDay').textContent = 'Error';
    }
}

async function saveRotationSettings() {
    console.log('FUNC: saveRotationSettings called.');
    const invest = parseFloat(document.getElementById('dailyInvest').value);
    const msg = document.getElementById('rotationSettingsMsg');
    msg.classList.add('hidden');

    console.log('Rotation settings to save:', { invest });

    if (isNaN(invest) || invest < 0) {
        msg.textContent = '❌ Please enter a valid number for Individual Participant Investment.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Save rotation settings failed: Invalid investment amount.');
        return;
    }

    try {
        console.log('FETCH: Sending save rotation settings request...');
        const response = await fetch(`${API_BASE_URL}/rotation/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ invest })
        });
        console.log('FETCH: Save rotation settings response status:', response.status);
        const data = await response.json();
        console.log('FETCH: Save rotation settings response data:', data);

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Rotation settings updated!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('ROTATION SETTINGS: Saved successfully.');
            await displayAdminHistory(); // Update history
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to update settings.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('ROTATION SETTINGS: Save failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Save settings fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

async function loadAvailableMembersForRotation() {
    console.log('FUNC: loadAvailableMembersForRotation called.');
    const select = document.getElementById('availableMembersSelect');
    select.innerHTML = '<option value="">-- Select Paid & Active Member --</option>';
    document.getElementById('noActiveParticipants').classList.remove('hidden');

    try {
        console.log('FETCH: Requesting paid and active users not in rotation...');
        const response = await fetch(`${API_BASE_URL}/users/paid-not-in-rotation`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Available members response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch available members');
        const availableMembers = await response.json();
        console.log('FETCH: Available members data:', availableMembers);

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
        console.log('Available members loaded and displayed. Has available:', hasAvailable);

    } catch (error) {
        console.error('ERROR: Error loading available members:', error);
        select.innerHTML = '<option value="">-- Error loading members --</option>';
    }
}

async function getActiveRotationMembersCount() {
    console.log('FUNC: getActiveRotationMembersCount called.');
    try {
        const response = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        if (!response.ok) return 0;
        const participants = await response.json();
        console.log('Active rotation participants count:', participants.length);
        return participants.length;
    } catch (error) {
        console.error('ERROR: Error fetching active rotation members count:', error);
        return 0;
    }
}

async function addParticipantToRotation() {
    console.log('FUNC: addParticipantToRotation called.');
    const select = document.getElementById('availableMembersSelect');
    const emailToAdd = select.value;
    const msg = document.getElementById('addParticipantMsg');
    msg.classList.add('hidden');

    console.log('Participant to add:', emailToAdd);

    if (!emailToAdd) {
        msg.textContent = '❌ Please select a member to add.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
        console.log('VALIDATION: Add participant failed: No member selected.');
        return;
    }

    try {
        console.log('FETCH: Sending add participant request...');
        const response = await fetch(`${API_BASE_URL}/rotation/add-participant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ email: emailToAdd })
        });
        console.log('FETCH: Add participant response status:', response.status);
        let data;
        try {
            data = await response.json();
            console.log('FETCH: Add participant response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from add participant:', jsonError);
            msg.textContent = `❌ Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            return;
        }

        if (response.ok) {
            msg.textContent = `✅ ${data.message || 'Participant added to rotation!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('ADD PARTICIPANT: Successful. Reloading rotation lists.');
            await loadAvailableMembersForRotation();
            await displayRotationParticipants();
            await updateCurrentRecipientDisplay();
            await displayAdminHistory(); // Update history
        } else {
            msg.textContent = `❌ ${data.message || 'Failed to add participant.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('ADD PARTICIPANT: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Add participant fetch error:', error);
        msg.textContent = '❌ Network error: Could not reach server. Please ensure the backend is running.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

async function displayRotationParticipants() {
    console.log('FUNC: displayRotationParticipants called.');
    const list = document.getElementById('rotationParticipantsList');
    list.innerHTML = '';
    document.getElementById('noActiveParticipants').classList.remove('hidden');

    try {
        console.log('FETCH: Requesting rotation participants...');
        const response = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Rotation participants response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch participants');
        const participants = await response.json();
        console.log('FETCH: Rotation participants data:', participants);

        let hasParticipants = false;
        let currentRecipientIndex = -1;
        try {
            console.log('FETCH: Requesting rotation settings for current recipient...');
            const settingsResponse = await fetch(`${API_BASE_URL}/rotation/settings`, {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            console.log('FETCH: Rotation settings for recipient response status:', settingsResponse.status);
            if (settingsResponse.ok) {
                const settings = await settingsResponse.json();
                currentRecipientIndex = settings.lastPaidMemberIndex;
                console.log('Current recipient index from settings:', currentRecipientIndex);
            } else {
                console.warn('WARNING: Could not fetch rotation settings for current recipient, using default -1.');
            }
        } catch (error) {
            console.error('ERROR: Error fetching rotation settings for recipient:', error);
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
        console.log('Rotation participants displayed. Has participants:', hasParticipants);
    }
    catch (error) {
        console.error('ERROR: Error displaying rotation participants:', error);
        list.innerHTML = '<li>Error loading participants.</li>';
        document.getElementById('noActiveParticipants').classList.add('hidden');
    }
}

async function updateCurrentRecipientDisplay() {
    console.log('FUNC: updateCurrentRecipientDisplay called.');
    const currentRecipientDisplay = document.getElementById('currentRecipientDisplay');
    currentRecipientDisplay.textContent = 'N/A';

    try {
        console.log('FETCH: Requesting rotation settings for recipient display...');
        const settingsResponse = await fetch(`${API_BASE_URL}/rotation/settings`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const settings = await settingsResponse.json();
        console.log('FETCH: Rotation settings for recipient display data:', settings);

        console.log('FETCH: Requesting rotation participants for recipient display...');
        const participantsResponse = await fetch(`${API_BASE_URL}/rotation/participants`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const participants = await participantsResponse.json(); 
        console.log('FETCH: Rotation participants for recipient display data:', participants);

        if (settings.lastPaidMemberIndex !== -1 && participants[settings.lastPaidMemberIndex]) {
            const recipient = participants[settings.lastPaidMemberIndex];
            currentRecipientDisplay.textContent = `${recipient.fullName} (${recipient.email})`;
            console.log('Current recipient displayed:', recipient.fullName);
        } else {
            currentRecipientDisplay.textContent = 'No recipient yet or no participants.';
            console.log('No current recipient to display.');
        }
    } catch (error) {
        console.error('ERROR: Error updating current recipient display:', error);
        currentRecipientDisplay.textContent = 'Error loading recipient.';
    }
}

async function nextParticipant() {
    console.log('FUNC: nextParticipant called.');
    const msg = document.getElementById('rotationStatusMsg');
    msg.classList.add('hidden');

    try {
        console.log('FETCH: Sending next participant request...');
        const response = await fetch(`${API_BASE_URL}/rotation/next`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Next participant response status:', response.status);
        let data;
        try {
            data = await response.json();
            console.log('FETCH: Next participant response data:', data);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from next participant:', jsonError);
            displayTempMessage(`Server communication problem: Expected JSON, but received unexpected data. Status: ${response.status}`, false);
            return;
        }

        if (response.ok) {
            displayTempMessage(data.message || 'Rotation moved to next participant!', true);
            console.log('ROTATION ADVANCE: Successful. Reloading dashboards.');
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
                console.log('ROTATION ADVANCE: Current user was recipient, updated gain.');
            }
        } else {
            displayTempMessage(`Error during rotation: ${data.message || 'Unknown error.'}`, false);
            console.log('ROTATION ADVANCE: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Next participant fetch error:', error);
        displayTempMessage('Network error: Could not reach server. Please ensure the backend is running.', false);
    }
}


// --- Admin User Management Functions ---
async function loadAdminUsers() {
    console.log('FUNC: loadAdminUsers called.');
    const tableBody = document.querySelector('#adminUsersTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('noUsersFound').classList.remove('hidden');

    try {
        console.log('FETCH: Requesting all admin users...');
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Admin users response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch user list');
        const users = await response.json();
        console.log('FETCH: Admin users data:', users);

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
        console.log('Admin users loaded and displayed. Has users:', hasUsers);
    } catch (error) {
        console.error('ERROR: Error loading admin users:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading user list.</td>';
        document.getElementById('noUsersFound').classList.add('hidden');
    }
}

async function updateUserStatus(userId, status) {
    console.log(`FUNC: updateUserStatus called for userId: ${userId}, status: ${status}`);
    displayTempMessage(`Updating status for user ${userId} to ${status}...`, false);
    try {
        console.log('FETCH: Sending update user status request...');
        const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ status })
        });
        console.log('FETCH: Update user status response status:', response.status);
        const data = await response.json();
        console.log('FETCH: Update user status response data:', data);

        if (response.ok) {
            displayTempMessage(data.message || `User status updated to ${status}.`, true);
            console.log('USER STATUS UPDATE: Successful. Reloading user lists.');
            await loadAdminUsers(); // Refresh the user list
            await loadAvailableMembersForRotation(); // Refresh available participants
            await displayRotationParticipants(); // Refresh rotation list
            await displayAdminHistory(); // Update history
        } else {
            displayTempMessage(`Error updating user status: ${data.message || 'Unknown error.'}`, false);
            console.log('USER STATUS UPDATE: Failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Error updating user status:', error);
        displayTempMessage('Network error or server unreachable. Could not update user status.', false);
    }
}

async function generateReferralCode() {
    console.log('FUNC: generateReferralCode called.');
    const msg = document.getElementById('generatedReferralCodeMsg');
    const codeDisplay = document.getElementById('generatedReferralCode');
    msg.classList.add('hidden');
    codeDisplay.textContent = 'Generating...';

    try {
        console.log('FETCH: Sending generate referral code request...');
        const response = await fetch(`${API_BASE_URL}/admin/referral-code/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Generate referral code response status:', response.status);
        const data = await response.json();
        console.log('FETCH: Generate referral code response data:', data);

        if (response.ok) {
            codeDisplay.textContent = data.referralCode;
            msg.textContent = `✅ ${data.message || 'New referral code generated!'}`;
            msg.classList.remove('hidden', 'error-msg');
            msg.classList.add('success-msg');
            console.log('REFERRAL CODE: Generated successfully.');
            await displayAdminHistory(); // Update history
        } else {
            codeDisplay.textContent = 'Error';
            msg.textContent = `❌ ${data.message || 'Failed to generate referral code.'}`;
            msg.classList.remove('hidden', 'success-msg');
            msg.classList.add('error-msg');
            console.log('REFERRAL CODE: Generation failed. Message:', data.message);
        }
    } catch (error) {
        console.error('ERROR: Generate referral code fetch error:', error);
        codeDisplay.textContent = 'Error';
        msg.textContent = '❌ Network error: Could not reach server.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg');
    }
    setTimeout(() => msg.classList.add('hidden'), 3000);
}


// --- CEO Specific Functions ---

async function displayRotationHistory() {
    console.log('FUNC: displayRotationHistory called.');
    const tableBody = document.querySelector('#ceoRotationHistoryTable tbody');
    tableBody.innerHTML = '';
    const noHistoryMsg = document.getElementById('noRotationHistory');
    noHistoryMsg.classList.remove('hidden');

    try {
        console.log('FETCH: Requesting rotation history...');
        const response = await fetch(`${API_BASE_URL}/rotation/history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Rotation history response status:', response.status);
        let history;
        try {
            history = await response.json();
            console.log('FETCH: Rotation history data:', history);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from rotation history:', jsonError);
            tableBody.innerHTML = '<tr><td colspan="6">Server communication problem: Expected JSON, but received unexpected data.</td></tr>';
            noHistoryMsg.classList.add('hidden');
            return;
        }

        if (!response.ok) throw new Error(`Failed to fetch rotation history: ${history.message || response.statusText}`);


        if (history.length === 0) {
            console.log('Rotation history: No entries found.');
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
        console.log('Rotation history displayed.');

    } catch (error) {
        console.error('ERROR: Error loading rotation history:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading history.</td></tr>';
        noHistoryMsg.classList.add('hidden');
    }
}

async function displayAdminHistory() {
    console.log('FUNC: displayAdminHistory called.');
    const tableBody = document.querySelector('#adminHistoryTable tbody');
    tableBody.innerHTML = '';
    const noHistoryMsg = document.getElementById('noAdminHistory');
    noHistoryMsg.classList.remove('hidden');

    try {
        console.log('FETCH: Requesting admin history...');
        const response = await fetch(`${API_BASE_URL}/admin/history`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        console.log('FETCH: Admin history response status:', response.status);
        let history;
        try {
            history = await response.json();
            console.log('FETCH: Admin history data:', history);
        } catch (jsonError) {
            console.error('ERROR: Failed to parse JSON response from admin history:', jsonError);
            tableBody.innerHTML = '<tr><td colspan="4">Server communication problem: Expected JSON, but received unexpected data.</td></tr>';
            noHistoryMsg.classList.add('hidden');
            return;
        }

        if (!response.ok) throw new Error(`Failed to fetch admin history: ${history.message || response.statusText}`);

        if (history.length === 0) {
            console.log('Admin history: No entries found.');
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
        console.log('Admin history displayed.');

    } catch (error) {
        console.error('ERROR: Error loading admin history:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Error loading system history.</td></tr>';
        noHistoryMsg.classList.add('hidden');
    }
}


function calculRotation() {
    console.log('FUNC: calculRotation called.');
    const msg = document.getElementById('ceoReportMsg');
    msg.textContent = 'This button can be expanded to generate more complex reports (e.g., total funds, financial projections, export data). For now, please view the history tables above.';
    msg.classList.remove('hidden');
    msg.classList.remove('success-msg');
    msg.classList.add('error-msg');
    setTimeout(() => msg.classList.add('hidden'), 4000);
}

// --- Initial Load Logic ---
window.onload = async function() {
    console.log("EVENT: window.onload triggered.");
    // Here, we check if a token exists, and if so, attempt to validate it with the backend
    // This is how a "session" would persist.
    if (currentAuthToken && currentUserData.email && currentUserData.role) {
        console.log("INITIAL LOAD: Auth token and user data found in localStorage. Attempting token verification.");
        try {
            // Verify the token with the backend
            console.log('FETCH: Sending token verification request...');
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            console.log('FETCH: Token verification response status:', response.status);

            let data;
            try {
                data = await response.json();
                console.log('FETCH: Token verification response data:', data);
            } catch (jsonError) {
                console.error('ERROR: Failed to parse JSON response from token verification:', jsonError);
                clearAuthData();
                showLogin();
                return;
            }

            if (response.ok) {
                // Token is valid, proceed based on role
                console.log('INITIAL LOAD ROUTING: Token verified. User data from token:', data.user);
                saveAuthData(data.token, data.user); // Update currentUserData with fresh data from backend

                if (data.user.role === 'user') {
                    console.log('INITIAL LOAD ROUTING: User role detected. Checking payment status.');
                    if (data.user.paid && data.user.status === 'active') {
                        console.log('INITIAL LOAD ROUTING: User is paid and active. Showing Main Platform.');
                        showMainPlatform(data.user.fullName || data.user.email, data.user.invest, data.user.gain, data.user.referralCode);
                    } else {
                        console.log('INITIAL LOAD ROUTING: User is not paid or not active. Showing Payment Panel.');
                        showPaymentPanel(data.user.email);
                    }
                } else if (data.user.role === 'leader') {
                    console.log('INITIAL LOAD ROUTING: Leader role detected. Showing Leader Dashboard.');
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
                    console.log('INITIAL LOAD ROUTING: CEO role detected. Showing CEO Dashboard.');
                    hideAllPanels();
                    document.getElementById('ceoPanel').classList.remove('hidden');
                    await displayRotationHistory();
                    await displayAdminHistory(); // Load system history
                    await loadAdminUsers(); // Load users for management
                } else {
                    console.warn('INITIAL LOAD ROUTING: Unknown role from token verification:', data.user.role, 'Defaulting to login.');
                    clearAuthData();
                    showLogin();
                }
            } else {
                console.warn('INITIAL LOAD: Auth token invalid/expired or server reported error, forcing re-login.', data.message);
                clearAuthData();
                showLogin();
            }
        } catch (error) {
            console.error('ERROR: Error during initial token verification:', error);
            clearAuthData();
            showLogin();
        }
    } else {
        console.log('INITIAL LOAD: No auth token found or incomplete user data. Showing signup/login.');
        showSignUp();
    }
};
