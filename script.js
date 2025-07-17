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
const API_BASE_URL = 'https://dream2build-api.onrender.com/api';

// --- Helper Functions to Toggle Panels ---
function hideAllPanels() {
    console.log('FUNC: hideAllPanels called. Hiding all panels...');
    document.getElementById('signUpPanel').classList.add('hidden');
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('verificationMessagePanel').classList.add('hidden');
    document.getElementById('paymentPanel').classList.add('hidden');
    document.getElementById('mainPlatformPanel').classList.add('hidden');
    document.getElementById('leaderRegisterPanel').classList.add('hidden');
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

let currentAuthToken = localStorage.getItem('authToken');
let currentUserData = JSON.parse(localStorage.getItem('currentUserData') || '{}');

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
    const userPaymentStatusMessage = document.getElementById('userPaymentStatusMessage');


    if (currentUserData.role === 'user') {
        adminAreaNote.textContent = '';
        participantFinancials.classList.remove('hidden');
        document.getElementById('participantInvest').textContent = userInvest !== undefined ? userInvest.toFixed(2) : '0.00';
        document.getElementById('participantGain').textContent = userGain !== undefined ? userGain.toFixed(2) : '0.00';
        document.getElementById('participantReferralCode').textContent = userReferralCode || 'N/A';

        // Display payment status message to the user
        if (currentUserData.isPaid && currentUserData.isActive) {
            userPaymentStatusMessage.textContent = 'Your payment has been accepted. Welcome to the platform!';
            userPaymentStatusMessage.className = 'success-msg';
            userPaymentStatusMessage.classList.remove('hidden');
        } else if (!currentUserData.isPaid && currentUserData.hasOwnProperty('isPaid')) { // Check if isPaid exists to differentiate from new user
            userPaymentStatusMessage.textContent = 'Your payment is pending validation or has been rejected. Please contact support if you believe this is an error.';
            userPaymentStatusMessage.className = 'error-msg';
            userPaymentStatusMessage.classList.remove('hidden');
        } else {
            userPaymentStatusMessage.classList.add('hidden'); // Hide if no specific status
        }

    } else if (currentUserData.role === 'leader') {
        adminAreaNote.textContent = 'You have Team Leader access. Check the "Team Leader Dashboard" section.';
        participantFinancials.classList.add('hidden');
        userPaymentStatusMessage.classList.add('hidden');
    } else if (currentUserData.role === 'ceo') {
        adminAreaNote.textContent = 'You have CEO access. Check the "CEO Dashboard" section.';
        participantFinancials.classList.add('hidden');
        userPaymentStatusMessage.classList.add('hidden');
    } else {
        adminAreaNote.textContent = 'Your role is not specified.';
        participantFinancials.classList.add('hidden');
        userPaymentStatusMessage.classList.add('hidden');
    }
    console.log('FUNC: showMainPlatform completed. Main platform should be visible.');
}

document.getElementById('signUpForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Sign Up form submitted.');

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode').value;
    const signUpMsg = document.getElementById('signUpMsg');

    signUpMsg.classList.add('hidden');

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
                username: email,
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

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Login form submitted.');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginMsg = document.getElementById('loginMsg');

    loginMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
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

            saveAuthData(data.token, {
                email: email,
                role: data.role || 'user',
                fullName: data.fullName || email,
                isPaid: data.isPaid,
                isActive: data.isActive,
                invest: data.invest,
                gain: data.gain,
                referralCode: data.referralCode
            });

            if (data.role === 'user') {
                if (data.isPaid && data.isActive) {
                    showMainPlatform(data.fullName || email, data.invest, data.gain, data.referralCode);
                } else if (!data.isPaid) {
                    showPaymentPanel(email);
                } else {
                    // This case handles users who are not paid and not active (e.g., rejected, or new user before payment)
                    displayTempMessage('Your account is not active or payment is pending. Please contact support.', false);
                    showLogin(); // Show login or a specific "contact support" panel
                }
            } else if (data.role === 'leader') {
                showLeaderDashboard(data.fullName || email);
            } else if (data.role === 'ceo') {
                showCEODashboard();
            } else {
                displayTempMessage('Unknown user role. Please contact support.', false);
                showLogin();
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

document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Payment form submitted.');

    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUserEmail = document.getElementById('paymentPanel').dataset.currentUserEmail;
    const paymentMsg = document.getElementById('paymentMsg');

    paymentMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/submit-payment`, {
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

        const data = await response.json();
        paymentMsg.textContent = data.message;
        paymentMsg.classList.remove('hidden');

        if (response.ok) {
            paymentMsg.classList.remove('error-msg');
            paymentMsg.classList.add('success-msg');
            displayTempMessage('Payment info submitted! Awaiting validation by a team leader.', true);
            // After submitting payment, the user should be redirected to login,
            // where their status will be checked again upon next login.
            showLogin();
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
            document.getElementById('contactAdminForm').reset();
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


document.getElementById('leaderLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Leader Login form submitted.');

    const email = document.getElementById('loginLeaderEmail').value;
    const password = document.getElementById('loginLeaderPass').value;
    const leaderLoginMsg = document.getElementById('leaderLoginMsg');

    leaderLoginMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/leader-login`, {
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
            showLeaderDashboard(data.fullName || email);
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

document.getElementById('ceoLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('CEO Login form submitted.');

    const email = document.getElementById('ceoLoginEmail').value;
    const password = document.getElementById('ceoLoginPassword').value;
    const ceoLoginMsg = document.getElementById('ceoLoginMsg');

    ceoLoginMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/ceo-login`, {
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
            showCEODashboard();
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

document.getElementById('leaderRegisterForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Leader Registration form submitted.');

    const firstName = document.getElementById('newLeaderFirstName').value;
    const lastName = document.getElementById('newLeaderLastName').value;
    const phoneNumber = document.getElementById('newLeaderPhoneNumber').value;
    const email = document.getElementById('newLeaderEmail').value;
    const password = document.getElementById('newLeaderPassword').value;
    const confirmPassword = document.getElementById('newLeaderConfirmPassword').value;
    const leaderRegisterMsg = document.getElementById('leaderRegisterMsg');

    leaderRegisterMsg.classList.add('hidden');

    if (password !== confirmPassword) {
        leaderRegisterMsg.textContent = 'Passwords do not match!';
        leaderRegisterMsg.classList.remove('hidden');
        leaderRegisterMsg.classList.remove('success-msg');
        leaderRegisterMsg.classList.add('error-msg');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leader-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
                password: password,
                firstName,
                lastName,
                phoneNumber,
                role: 'leader'
            })
        });

        const data = await response.json();
        leaderRegisterMsg.textContent = data.message;
        leaderRegisterMsg.classList.remove('hidden');

        if (response.ok) {
            leaderRegisterMsg.classList.remove('error-msg');
            leaderRegisterMsg.classList.add('success-msg');
            displayTempMessage('Leader registration successful! Please log in.', true);
            setTimeout(() => showLeaderLoginOnly(), 1000);
        } else {
            leaderRegisterMsg.classList.remove('success-msg');
            leaderRegisterMsg.classList.add('error-msg');
            displayTempMessage(`Leader registration failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error during leader registration:', error);
        leaderRegisterMsg.textContent = 'Network error. Please try again.';
        leaderRegisterMsg.classList.remove('hidden');
        leaderRegisterMsg.classList.remove('success-msg');
        leaderRegisterMsg.classList.add('error-msg');
        displayTempMessage('Network error during leader registration.', false);
    }
});


function logoutUser() {
    console.log('FUNC: logoutUser called. Logging out user.');
    clearAuthData();
    displayTempMessage('Logged out successfully!', true);
    showLogin();
}

function logoutLeader() {
    console.log('FUNC: logoutLeader called. Logging out leader.');
    clearAuthData();
    displayTempMessage('Leader logged out successfully!', true);
    showLogin();
}

function logoutCEO() {
    console.log('FUNC: logoutCEO called. Logging out CEO.');
    clearAuthData();
    displayTempMessage('CEO logged out successfully!', true);
    showLogin();
}

function showPaymentInstructions(method) {
    console.log('FUNC: showPaymentInstructions called for method:', method);
    const instructionsDiv = document.getElementById('paymentInstructions');
    const allInfos = instructionsDiv.querySelectorAll('div');
    allInfos.forEach(div => div.classList.add('hidden'));

    if (method) {
        document.getElementById(`${method}Info`).classList.remove('hidden');
        instructionsDiv.style.display = 'block';
    } else {
        instructionsDiv.style.display = 'none';
    }
}

function showLeaderDashboard(leaderName) {
    console.log('FUNC: showLeaderDashboard called for leader:', leaderName);
    hideAllPanels();
    document.getElementById('leaderPanel').classList.remove('hidden');
    document.getElementById('leaderNameDisplay').textContent = leaderName;
    fetchPendingPayments();
    fetchUserMessages();
    fetchRotationData();
    fetchAllUsersForAdmin();
}

function showCEODashboard() {
    console.log('FUNC: showCEODashboard called.');
    hideAllPanels();
    document.getElementById('ceoPanel').classList.remove('hidden');
    fetchCEORotationHistory();
    fetchAdminHistory();
    fetchGeneralHistory();
}

async function fetchPendingPayments() {
    console.log('Fetching pending payments...');
    const list = document.getElementById('pendingPaymentsList');
    list.innerHTML = '';
    document.getElementById('noPendingPayments').classList.remove('hidden');

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
            fetchPendingPayments();
            fetchAllUsersForAdmin();
            fetchGeneralHistory();
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
            fetchPendingPayments();
            fetchGeneralHistory();
        } else {
            displayTempMessage(`Rejection failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error rejecting payment:', error);
        displayTempMessage('Network error during payment rejection.', false);
    }
}


async function fetchUserMessages() {
    console.log('Fetching user messages...');
    const list = document.getElementById('userMessagesList');
    list.innerHTML = '';
    document.getElementById('noUserMessages').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/leader/messages`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const messages = await response.json();

        if (response.ok && messages.length > 0) {
            document.getElementById('noUserMessages').classList.add('hidden');
            messages.forEach(msg => {
                const li = document.createElement('li');
                li.classList.add(msg.read ? 'read' : 'unread');
                li.innerHTML = `
                    <strong>From: ${msg.email}</strong><br>
                    Subject: ${msg.subject}<br>
                    Message: ${msg.message}
                    ${!msg.read ? `<button onclick="markMessageRead('${msg.id}')">Mark as Read</button>` : ''}
                `;
                list.appendChild(li);
            });
        } else {
            document.getElementById('noUserMessages').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching user messages:', error);
        document.getElementById('noUserMessages').textContent = 'Error loading messages.';
        document.getElementById('noUserMessages').classList.remove('hidden');
    }
}

async function markMessageRead(messageId) {
    console.log(`Marking message ${messageId} as read...`);
    try {
        const response = await fetch(`${API_BASE_URL}/leader/messages/${messageId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchUserMessages();
            fetchGeneralHistory();
        } else {
            displayTempMessage(`Failed to mark message as read: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
        displayTempMessage('Network error marking message as read.', false);
    }
}

let rotationParticipants = [];
let currentRotationDay = 0;
let currentRecipientIndex = -1;
let dailyInvestmentAmount = 10;

async function fetchRotationData() {
    console.log('Fetching rotation data...');
    const select = document.getElementById('availableMembersSelect');
    select.innerHTML = '<option value="">-- Select Paid & Active Member --</option>';

    try {
        const rotationResponse = await fetch(`${API_BASE_URL}/rotation/data`, {
            headers: { 'Authorization': `Bearer ${currentAuthToken}` }
        });
        const rotationData = await rotationResponse.json();

        if (rotationResponse.ok) {
            rotationParticipants = rotationData.participants || [];
            currentRotationDay = rotationData.currentDay || 0;
            currentRecipientIndex = rotationData.currentRecipientIndex !== undefined ? rotationData.currentRecipientIndex : -1;
            dailyInvestmentAmount = rotationData.dailyInvestmentAmount || 10;

            document.getElementById('currentRotationDay').textContent = currentRotationDay;
            document.getElementById('dailyInvest').value = dailyInvestmentAmount;
            updateRotationParticipantsList();
            updateCurrentRecipientDisplay();

            const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            const allUsers = await usersResponse.json();

            if (usersResponse.ok) {
                const activePaidUsers = allUsers.filter(user => user.isActive && user.isPaid && user.role === 'user');
                activePaidUsers.forEach(user => {
                    if (!rotationParticipants.some(p => p.id === user.id)) {
                        const option = document.createElement('option');
                        option.value = user.id;
                        option.textContent = user.fullName || user.username;
                        select.appendChild(option);
                    }
                });
            } else {
                console.error('Failed to fetch users for rotation dropdown:', allUsers.message);
            }
        } else {
            console.error('Failed to fetch rotation data:', rotationData.message);
        }
    } catch (error) {
        console.error('Error fetching rotation data:', error);
    }
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

async function saveRotationSettings() {
    dailyInvestmentAmount = parseFloat(document.getElementById('dailyInvest').value);
    if (isNaN(dailyInvestmentAmount) || dailyInvestmentAmount <= 0) {
        displayTempMessage('Investment must be a positive number.', false);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/rotation/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ dailyInvestmentAmount })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            fetchGeneralHistory();
        } else {
            displayTempMessage(`Failed to update settings: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error saving rotation settings:', error);
        displayTempMessage('Network error saving rotation settings.', false);
    }
}

async function addParticipantToRotation() {
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

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({ userId: selectedUserId, username: selectedUserName, fullName: selectedUserName })
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            addParticipantMsg.classList.remove('error-msg');
            addParticipantMsg.classList.add('success-msg');
            addParticipantMsg.textContent = data.message;
            select.value = '';
            fetchRotationData();
            fetchGeneralHistory();
        } else {
            addParticipantMsg.textContent = `Failed to add participant: ${data.message}`;
            addParticipantMsg.classList.remove('hidden');
            addParticipantMsg.classList.add('error-msg');
            displayTempMessage(`Failed to add participant: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error adding participant:', error);
        addParticipantMsg.textContent = 'Network error adding participant.';
        addParticipantMsg.classList.remove('hidden');
        addParticipantMsg.classList.add('error-msg');
        displayTempMessage('Network error adding participant.', false);
    }
}

async function nextParticipant() {
    const rotationStatusMsg = document.getElementById('rotationStatusMsg');
    rotationStatusMsg.classList.add('hidden');

    if (rotationParticipants.length === 0) {
        rotationStatusMsg.textContent = 'No participants in rotation to advance.';
        rotationStatusMsg.classList.remove('hidden');
        rotationStatusMsg.classList.add('error-msg');
        displayTempMessage('No participants in rotation.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/rotation/next`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAuthToken}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            displayTempMessage(data.message, true);
            currentRotationDay = data.rotationData.currentDay;
            currentRecipientIndex = data.rotationData.currentRecipientIndex;
            rotationParticipants = data.rotationData.participants;
            document.getElementById('currentRotationDay').textContent = currentRotationDay;
            updateCurrentRecipientDisplay();
            updateRotationParticipantsList();
            fetchCEORotationHistory();
            fetchGeneralHistory();
            fetchAllUsersForAdmin();
        } else {
            rotationStatusMsg.textContent = `Rotation failed: ${data.message}`;
            rotationStatusMsg.classList.remove('hidden');
            rotationStatusMsg.classList.add('error-msg');
            displayTempMessage(`Rotation failed: ${data.message}`, false);
        }
    } catch (error) {
        console.error('Error advancing rotation:', error);
        rotationStatusMsg.textContent = 'Network error advancing rotation.';
        rotationStatusMsg.classList.remove('hidden');
        rotationStatusMsg.classList.add('error-msg');
        displayTempMessage('Network error advancing rotation.', false);
    }
}

let allUsers = [];

async function fetchAllUsersForAdmin() {
    console.log('Fetching all users for admin...');
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
            allUsers = users;
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
    }
    catch (error) {
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
            fetchAllUsersForAdmin();
            fetchGeneralHistory();
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
            fetchAllUsersForAdmin();
            fetchGeneralHistory();
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
    const confirmDelete = await new Promise(resolve => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001; text-align: center;
        `;
        modal.innerHTML = `
            <p>Are you sure you want to delete this user?</p>
            <button id="confirmYes" style="margin-right: 10px;">Yes</button>
            <button id="confirmNo" style="background-color: #6c757d;">No</button>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmYes').onclick = () => { modal.remove(); resolve(true); };
        document.getElementById('confirmNo').onclick = () => { modal.remove(); resolve(false); };
    });

    if (confirmDelete) {
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
                fetchAllUsersForAdmin();
                fetchGeneralHistory();
            } else {
                displayTempMessage(`User deletion failed: ${data.message}`, false);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            displayTempMessage('Network error during user deletion.', false);
        }
    }
}

function generateReferralCode() {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    document.getElementById('generatedReferralCode').textContent = code;
    document.getElementById('generatedReferralCodeMsg').textContent = 'New referral code generated!';
    document.getElementById('generatedReferralCodeMsg').classList.remove('hidden', 'error-msg');
    document.getElementById('generatedReferralCodeMsg').classList.add('success-msg');
    displayTempMessage('New referral code generated!', true);
}

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
                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
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
                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
                    <td>${entry.type}</td>
                    <td>${entry.description}</td>
                    <td>${JSON.stringify(entry.details) || 'N/A'}</td>
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
                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
                    <td>${entry.type}</td>
                    <td>${entry.description}</td>
                    <td>${JSON.stringify(entry.details) || 'N/A'}</td>
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
                'Authorization': `Bearer ${currentAuthToken}`
            },
            body: JSON.stringify({
                username: email,
                password: password,
                firstName,
                lastName,
                phoneNumber,
                role: 'leader'
            })
        });

        const data = await response.json();
        newAdminMsg.textContent = data.message;
        newAdminMsg.classList.remove('hidden');

        if (response.ok) {
            newAdminMsg.classList.remove('error-msg');
            newAdminMsg.classList.add('success-msg');
            displayTempMessage('New admin added successfully!', true);
            document.getElementById('newAdminForm').reset();
            fetchGeneralHistory();
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


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing...');

    // Attach event listeners for navigation links
    const navLoginLink = document.getElementById('navLoginLink');
    if (navLoginLink) {
        navLoginLink.addEventListener('click', (event) => {
            event.preventDefault();
            showLogin();
        });
    }

    const navAdminLoginRegisterLink = document.getElementById('navAdminLoginRegisterLink');
    if (navAdminLoginRegisterLink) {
        navAdminLoginRegisterLink.addEventListener('click', (event) => {
            event.preventDefault();
            showAdminLoginRegister();
        });
    }

    const navContactAdminLink = document.getElementById('navContactAdminLink');
    if (navContactAdminLink) {
        navContactAdminLink.addEventListener('click', (event) => {
            event.preventDefault();
            showContactAdmin();
        });
    }

    // Existing initial load logic
    if (currentAuthToken && currentUserData.role) {
        if (currentUserData.role === 'user') {
            // Check if user is paid and active
            if (currentUserData.isPaid && currentUserData.isActive) {
                showMainPlatform(currentUserData.fullName || currentUserData.email, currentUserData.invest, currentUserData.gain, currentUserData.referralCode);
            } else {
                // If not paid or not active, show payment panel or a message
                showPaymentPanel(currentUserData.email);
            }
        } else if (currentUserData.role === 'leader') {
            showLeaderDashboard(currentUserData.fullName || currentUserData.email);
        } else if (currentUserData.role === 'ceo') {
            showCEODashboard();
        } else {
            showLogin();
        }
    } else {
        showSignUp();
    }

    // Initial fetch for admin/leader dashboards if they are shown on load
    // These checks ensure data is fetched only if the panel is visible,
    // which happens after successful login for leader/CEO roles.
    if (!document.getElementById('leaderPanel').classList.contains('hidden')) {
        fetchPendingPayments();
        fetchUserMessages();
        fetchRotationData();
        fetchAllUsersForAdmin();
    }
    if (!document.getElementById('ceoPanel').classList.contains('hidden')) {
        fetchCEORotationHistory();
        fetchAdminHistory();
        fetchGeneralHistory();
    }
});
