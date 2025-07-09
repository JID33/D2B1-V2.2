// Dream2Build1 - Main Script

// --- Helper Functions to Toggle Panels ---
function hideAllPanels() {
    const ids = [
        'signUpPanel', 'loginPanel', 'verificationMessagePanel', 'paymentPanel',
        'mainPlatformPanel', 'leaderRegisterPanel', 'leaderLoginPanel', 'ceoLoginPanel',
        'leaderPanel', 'ceoPanel', 'contactAdminPanel'
    ];
    ids.forEach(id => document.getElementById(id).classList.add('hidden'));
}

function showSignUp() { hideAllPanels(); document.getElementById('signUpPanel').classList.remove('hidden'); }
function showLogin() { hideAllPanels(); document.getElementById('loginPanel').classList.remove('hidden'); }
function showVerificationMessage(email) {
    hideAllPanels();
    document.getElementById('verificationMessagePanel').classList.remove('hidden');
    document.getElementById('verificationEmailDisplay').textContent = email;
}
function showPaymentPanel(userName, userEmail) {
    hideAllPanels();
    document.getElementById('paymentPanel').classList.remove('hidden');
    document.getElementById('paymentUserName').textContent = userName;
    document.getElementById('paymentPanel').dataset.currentUserEmail = userEmail;
}
function showMainPlatform(userName) {
    hideAllPanels();
    document.getElementById('mainPlatformPanel').classList.remove('hidden');
    document.getElementById('loggedInUserName').textContent = userName;
}
function showAdminLoginRegister() {
    hideAllPanels();
    document.getElementById('leaderLoginPanel').classList.remove('hidden');
    document.getElementById('leaderRegisterPanel').classList.remove('hidden');
}
function showCEOLogin() { hideAllPanels(); document.getElementById('ceoLoginPanel').classList.remove('hidden'); }
function showContactAdmin() { hideAllPanels(); document.getElementById('contactAdminPanel').classList.remove('hidden'); }

// --- Data Storage (Client-Side Simulation) ---
const users = JSON.parse(localStorage.getItem('users')) || {};
let admins = JSON.parse(localStorage.getItem('admins')) || {};
const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || {};
let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || {};
let rotationSettings = JSON.parse(localStorage.getItem('rotationSettings')) || {
    invest: 100, gain: 1000, currentDay: 0, lastPaidMemberIndex: -1
};
let activeRotationMembers = JSON.parse(localStorage.getItem('activeRotationMembers')) || [];
let rotationHistory = JSON.parse(localStorage.getItem('rotationHistory')) || [];

// --- User Authentication (Sign Up & Login) ---
document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const msg = document.getElementById('signUpMsg');
    msg.classList.add('hidden');
    if (!fullName || !phoneNumber || !email || !password || !confirmPassword) {
        msg.textContent = '❌ Please fill in all fields.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg'); return;
    }
    if (password !== confirmPassword) {
        msg.textContent = '❌ Passwords do not match.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg'); return;
    }
    if (users[email]) {
        msg.textContent = '❌ This email is already registered.';
        msg.classList.remove('hidden', 'success-msg');
        msg.classList.add('error-msg'); return;
    }
    users[email] = { fullName, phoneNumber, password, verified: false, paid: false };
    localStorage.setItem('users', JSON.stringify(users));
    msg.textContent = '✅ Sign up successful! Your account is automatically verified for this demo. Please proceed to login.';
    msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
    setTimeout(() => {
        users[email].verified = true;
        localStorage.setItem('users', JSON.stringify(users));
        showVerificationMessage(email);
    }, 1000);
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');
    msg.classList.add('hidden');
    const user = users[email];
    if (!user) {
        msg.textContent = '❌ No account found with this email.'; msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    if (!user.verified) {
        msg.textContent = '❌ Please verify your email first.'; msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    if (user.password !== password) {
        msg.textContent = '❌ Incorrect password.'; msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    localStorage.setItem('currentUser', JSON.stringify({ email: email, name: user.fullName, role: 'user' }));
    if (user.paid) {
        showMainPlatform(user.fullName);
    } else {
        showPaymentPanel(user.fullName, email);
    }
});
function logoutUser() { localStorage.removeItem('currentUser'); showLogin(); }

// --- Payment Logic ---
function showPaymentInstructions(value) {
    const allDivs = ['cashInfo', 'mastercardInfo', 'paypalInfo', 'moncashInfo', 'natcashInfo'];
    allDivs.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('paymentInstructions').style.display = 'block';
    if(value && allDivs.includes(value + 'Info')) document.getElementById(value + 'Info').classList.remove('hidden');
    else document.getElementById('paymentInstructions').style.display = 'none';
}

document.getElementById('paymentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUserEmail = document.getElementById('paymentPanel').dataset.currentUserEmail.toLowerCase();
    const msg = document.getElementById('paymentMsg');
    msg.classList.add('hidden');
    if (!paymentMethod) {
        msg.textContent = '❌ Please select a payment method.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    if (paymentMethod === 'cash') {
        if (!pendingPayments[currentUserEmail]) {
            const userName = users[currentUserEmail] ? users[currentUserEmail].fullName : 'Unknown User';
            pendingPayments[currentUserEmail] = {
                email: currentUserEmail, name: userName, method: 'Cash',
                status: 'pending_leader_validation', timestamp: new Date().toLocaleString()
            };
            localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
            msg.textContent = '✅ Payment method submitted. A team leader will validate your cash payment soon.';
            msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
        } else {
            msg.textContent = 'ℹ️ Your cash payment is already pending validation.';
            msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg');
        }
    } else {
        const user = users[currentUserEmail];
        if (user) {
            user.paid = true;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.fullName, role: 'user' }));
            if (!activeRotationMembers.includes(currentUserEmail)) {
                activeRotationMembers.push(currentUserEmail);
                localStorage.setItem('activeRotationMembers', JSON.stringify(activeRotationMembers));
            }
            msg.textContent = '✅ Payment successful! Redirecting to platform...';
            msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
            setTimeout(() => showMainPlatform(user.fullName), 1500);
        }
    }
});

// --- User Message System ---
document.getElementById('contactAdminForm').addEventListener('submit', function(event) {
    const email = document.getElementById('contactEmail').value.trim().toLowerCase();
    const subject = document.getElementById('contactSubject').value.trim();
    const messageText = document.getElementById('contactMessage').value.trim();
    const msg = document.getElementById('contactAdminMsg');
    msg.classList.add('hidden');
    if (!email || !subject || !messageText) {
        msg.textContent = '❌ Please fill in all fields.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    adminMessages[messageId] = {
        id: messageId, fromEmail: email, subject, message: messageText,
        timestamp: new Date().toLocaleString(), status: 'unread'
    };
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    msg.textContent = '✅ Your message has been sent to support!';
    msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';
    setTimeout(() => msg.classList.add('hidden'), 3000);
});

// --- Admin (Team Leader / CEO) Logic ---
document.getElementById('leaderLoginForm').addEventListener('submit', function(event) {
    event.preventDefault(); loginLeader();
});
function registerLeader() {
    const name = document.getElementById('leaderName').value.trim();
    const email = document.getElementById('leaderEmailReg').value.trim().toLowerCase();
    const pass1 = document.getElementById('leaderPass1').value;
    const pass2 = document.getElementById('leaderPass2').value;
    const msg = document.getElementById('leaderRegisterMsg');
    if(!name || !email || !pass1 || !pass2) { msg.textContent = '❌ Please fill all fields'; msg.className = 'error-msg'; return; }
    if(pass1 !== pass2) { msg.textContent = '❌ Passwords do not match'; msg.className = 'error-msg'; return; }
    if (admins[email]) { msg.textContent = '❌ This email is already registered as an admin.'; msg.className = 'error-msg'; return; }
    admins[email] = { name, email, password: pass1, role: 'leader' };
    localStorage.setItem('admins', JSON.stringify(admins));
    msg.textContent = '✅ Registration successful. You can now login as a Leader.'; msg.className = 'success-msg';
    document.getElementById('leaderName').value = '';
    document.getElementById('leaderEmailReg').value = '';
    document.getElementById('leaderPass1').value = '';
    document.getElementById('leaderPass2').value = '';
}
function loginLeader() {
    const email = document.getElementById('loginLeaderEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginLeaderPass').value;
    const msg = document.getElementById('leaderLoginMsg');
    const stored = admins[email];
    if(!stored || stored.role !== 'leader') { msg.textContent = '❌ No leader account found with this email.'; msg.className = 'error-msg'; return; }
    if(stored.password !== pass) { msg.textContent = '❌ Incorrect password.'; msg.className = 'error-msg'; return; }
    localStorage.setItem('currentAdmin', JSON.stringify({ email: stored.email, name: stored.name, role: stored.role }));
    hideAllPanels();
    document.getElementById('leaderPanel').classList.remove('hidden');
    document.getElementById('leaderNameDisplay').textContent = stored.name;
    loadPendingPayments();
    loadRotationSettings();
    loadAvailableMembersForRotation();
    displayRotationParticipants();
    loadUserMessages();
}
function logoutLeader() { localStorage.removeItem('currentAdmin'); showLogin(); }
function loadPendingPayments() {
    const list = document.getElementById('pendingPaymentsList');
    list.innerHTML = '';
    let hasPending = false;
    for (const email in pendingPayments) {
        const payment = pendingPayments[email];
        if (payment.status === 'pending_leader_validation') {
            hasPending = true;
            const userDisplayName = users[email] ? users[email].fullName : 'Unknown User';
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${userDisplayName}</strong> (${payment.email}) - Method: ${payment.method} - Submitted: ${payment.timestamp}
                <div>
                    <button style="background-color: #28a745;" onclick="validatePayment('${email}')">Validate</button>
                    <button style="background-color: #dc3545; margin-left: 5px;" onclick="rejectPayment('${email}')">Reject</button>
                </div>
            `;
            list.appendChild(listItem);
        }
    }
    document.getElementById('noPendingPayments').classList.toggle('hidden', hasPending);
}
function validatePayment(email) {
    email = email.toLowerCase();
    if (users[email]) {
        users[email].paid = true;
        localStorage.setItem('users', JSON.stringify(users));
        delete pendingPayments[email];
        localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        if (!activeRotationMembers.includes(email)) {
            activeRotationMembers.push(email);
            localStorage.setItem('activeRotationMembers', JSON.stringify(activeRotationMembers));
            alert(`Payment for ${users[email].fullName} (${email}) validated! User has been added to rotation and now has full access.`);
        } else {
            alert(`Payment for ${users[email].fullName} (${email}) validated! User already in rotation. User now has full access.`);
        }
        loadPendingPayments();
        loadAvailableMembersForRotation();
        displayRotationParticipants();
    } else {
        alert(`Error: User with email ${email} not found. Please ensure the user has registered. If not, reject this payment.`);
    }
}
function rejectPayment(email) {
    email = email.toLowerCase();
    if (users[email] || pendingPayments[email]) {
        delete pendingPayments[email];
        localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        alert(`Payment for ${users[email]?.fullName || email} rejected. User needs to resubmit.`);
        loadPendingPayments();
    }
}
function loadUserMessages() {
    const list = document.getElementById('userMessagesList');
    list.innerHTML = '';
    let unreadCount = 0;
    let hasMessages = false;
    const messagesArray = Object.values(adminMessages).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    messagesArray.forEach(message => {
        hasMessages = true;
        if (message.status === 'unread') unreadCount++;
        const listItem = document.createElement('li');
        listItem.classList.toggle('unread', message.status === 'unread');
        listItem.innerHTML = `
            <strong>From:</strong> ${message.fromEmail}<br>
            <strong>Subject:</strong> ${message.subject}<br>
            <strong>Message:</strong> ${message.message}<br>
            <small><em>Sent: ${message.timestamp} - Status: ${message.status.toUpperCase()}</em></small><br>
            <button style="margin-top: 5px; background-color: #007bff; font-size: 0.9em; padding: 5px 10px;" onclick="markMessageAsRead('${message.id}')">Mark as Read</button>
            <button style="margin-top: 5px; background-color: #dc3545; font-size: 0.9em; padding: 5px 10px; margin-left: 5px;" onclick="deleteMessage('${message.id}')">Delete</button>
        `;
        list.appendChild(listItem);
    });
    document.getElementById('unreadMessageCount').textContent = `(${unreadCount} unread)`;
    document.getElementById('noUserMessages').classList.toggle('hidden', hasMessages);
}
function markMessageAsRead(messageId) {
    if (adminMessages[messageId]) {
        adminMessages[messageId].status = 'read';
        localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
        loadUserMessages();
    }
}
function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        delete adminMessages[messageId];
        localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
        loadUserMessages();
    }
}

// CEO Login Logic
document.getElementById('ceoLoginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('ceoLoginEmail').value.trim().toLowerCase();
    const password = document.getElementById('ceoLoginPassword').value;
    const msg = document.getElementById('ceoLoginMsg');
    msg.classList.add('hidden');
    const ceoAccount = admins[email];
    if (!ceoAccount || ceoAccount.role !== 'ceo') {
        msg.textContent = '❌ No CEO account found with this email.'; msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    if (ceoAccount.password !== password) {
        msg.textContent = '❌ Incorrect password.'; msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    localStorage.setItem('currentAdmin', JSON.stringify({ email: ceoAccount.email, name: ceoAccount.name, role: ceoAccount.role }));
    hideAllPanels();
    document.getElementById('ceoPanel').classList.remove('hidden');
    msg.textContent = '';
    document.getElementById('ceoLoginEmail').value = '';
    document.getElementById('ceoLoginPassword').value = '';
    displayRotationHistory();
});
function logoutCEO() { localStorage.removeItem('currentAdmin'); showLogin(); }

// --- Rotation Management Logic ---
function loadRotationSettings() {
    document.getElementById('dailyInvest').value = rotationSettings.invest;
    document.getElementById('dailyGain').value = rotationSettings.gain;
    document.getElementById('currentRotationDay').textContent = rotationSettings.currentDay;
}
function saveRotationSettings() {
    const invest = parseFloat(document.getElementById('dailyInvest').value);
    const gain = parseFloat(document.getElementById('dailyGain').value);
    const msg = document.getElementById('rotationSettingsMsg');
    msg.classList.add('hidden');
    if (isNaN(invest) || isNaN(gain) || invest < 0 || gain < 0) {
        msg.textContent = '❌ Please enter valid numbers for Invest and Gain.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    rotationSettings.invest = invest;
    rotationSettings.gain = gain;
    localStorage.setItem('rotationSettings', JSON.stringify(rotationSettings));
    msg.textContent = '✅ Rotation settings updated!';
    msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
    setTimeout(() => msg.classList.add('hidden'), 2000);
}
function loadAvailableMembersForRotation() {
    const select = document.getElementById('availableMembersSelect');
    select.innerHTML = '<option value="">-- Select Paid Member --</option>';
    for (const email in users) {
        const user = users[email];
        if (user.verified && user.paid && !activeRotationMembers.includes(email)) {
            const option = document.createElement('option');
            option.value = email; option.textContent = `${user.fullName} (${user.email})`;
            select.appendChild(option);
        }
    }
    document.getElementById('noActiveParticipants').classList.toggle('hidden', select.options.length > 1 || activeRotationMembers.length > 0);
}
function addParticipantToRotation() {
    const select = document.getElementById('availableMembersSelect');
    const emailToAdd = select.value;
    const msg = document.getElementById('addParticipantMsg');
    msg.classList.add('hidden');
    if (!emailToAdd) {
        msg.textContent = '❌ Please select a member to add.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    if (activeRotationMembers.includes(emailToAdd)) {
        msg.textContent = 'ℹ️ This member is already in the rotation.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    activeRotationMembers.push(emailToAdd);
    localStorage.setItem('activeRotationMembers', JSON.stringify(activeRotationMembers));
    msg.textContent = `✅ ${users[emailToAdd].fullName} added to rotation!`;
    msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
    setTimeout(() => msg.classList.add('hidden'), 2000);
    loadAvailableMembersForRotation();
    displayRotationParticipants();
}
function displayRotationParticipants() {
    const list = document.getElementById('rotationParticipantsList');
    list.innerHTML = '';
    let hasParticipants = false;
    if (activeRotationMembers.length > 0) {
        hasParticipants = true;
        activeRotationMembers.forEach((email, index) => {
            const userFullName = users[email]?.fullName || 'Unknown User';
            const listItem = document.createElement('li');
            listItem.textContent = `${userFullName} (${email})`;
            if (index === rotationSettings.lastPaidMemberIndex) {
                listItem.classList.add('current-recipient');
                listItem.title = "Last member who received payment";
            }
            list.appendChild(listItem);
        });
    }
    document.getElementById('noActiveParticipants').classList.toggle('hidden', hasParticipants);
}
function nextParticipant() {
    const msg = document.getElementById('rotationStatusMsg');
    msg.classList.add('hidden');
    if (activeRotationMembers.length === 0) {
        msg.textContent = '❌ No participants in rotation. Add members first.';
        msg.classList.remove('hidden', 'success-msg'); msg.classList.add('error-msg'); return;
    }
    let nextIndex = (rotationSettings.lastPaidMemberIndex + 1) % activeRotationMembers.length;
    const recipientEmail = activeRotationMembers[nextIndex];
    const recipientName = users[recipientEmail]?.fullName || 'Unknown';
    rotationSettings.currentDay++;
    rotationSettings.lastPaidMemberIndex = nextIndex;
    localStorage.setItem('rotationSettings', JSON.stringify(rotationSettings));
    rotationHistory.push({
        day: rotationSettings.currentDay, recipientEmail, recipientName,
        invest: rotationSettings.invest, gain: rotationSettings.gain,
        timestamp: new Date().toLocaleString()
    });
    if (rotationHistory.length > 25) rotationHistory.shift();
    localStorage.setItem('rotationHistory', JSON.stringify(rotationHistory));
    msg.textContent = `✅ Day ${rotationSettings.currentDay}: ${recipientName} (${recipientEmail}) is the next recipient! Gain: $${rotationSettings.gain.toFixed(2)}`;
    msg.classList.remove('hidden', 'error-msg'); msg.classList.add('success-msg');
    setTimeout(() => msg.classList.add('hidden'), 3000);
    loadRotationSettings();
    displayRotationParticipants();
    displayRotationHistory();
}

// --- CEO Specific Functions ---
function displayRotationHistory() {
    const tableBody = document.querySelector('#ceoRotationHistoryTable tbody');
    tableBody.innerHTML = '';
    const noHistoryMsg = document.getElementById('noRotationHistory');
    if (rotationHistory.length === 0) {
        noHistoryMsg.classList.remove('hidden'); return;
    } else { noHistoryMsg.classList.add('hidden'); }
    [...rotationHistory].reverse().forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = entry.day;
        row.insertCell().textContent = `${entry.recipientName} (${entry.recipientEmail})`;
        row.insertCell().textContent = entry.invest.toFixed(2);
        row.insertCell().textContent = entry.gain.toFixed(2);
        row.insertCell().textContent = entry.timestamp;
    });
}
function calculRotation() {
    const msg = document.getElementById('ceoReportMsg');
    msg.textContent = 'This button can be expanded to generate more complex reports (e.g., total funds, financial projections). For now, view the history above.';
    msg.classList.remove('hidden');
    msg.classList.remove('success-msg');
    msg.classList.add('error-msg');
    setTimeout(() => msg.classList.add('hidden'), 4000);
}

// --- Initial Load Logic ---
window.onload = function() {
    // Ensure a default CEO account exists for demo purposes
    if (!admins['ceo@dream2build.com'] || admins['ceo@dream2build.com'].role !== 'ceo') {
        admins['ceo@dream2build.com'] = { name: 'CEO Admin', email: 'ceo@dream2build.com', password: 'admin123', role: 'ceo' };
        localStorage.setItem('admins', JSON.stringify(admins));
        console.log("Default CEO account created: ceo@dream2build.com / admin123");
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentUser && currentUser.role === 'user') {
        const user = users[currentUser.email];
        if (user && user.verified) {
            if (user.paid) showMainPlatform(user.fullName);
            else showPaymentPanel(user.fullName, user.email);
        } else {
            localStorage.removeItem('currentUser'); showLogin();
        }
    } else if (currentAdmin) {
        if (currentAdmin.role === 'leader') {
            hideAllPanels();
            document.getElementById('leaderPanel').classList.remove('hidden');
            document.getElementById('leaderNameDisplay').textContent = currentAdmin.name;
            loadPendingPayments(); loadRotationSettings(); loadAvailableMembersForRotation();
            displayRotationParticipants(); loadUserMessages();
        } else if (currentAdmin.role === 'ceo') {
            hideAllPanels();
            document.getElementById('ceoPanel').classList.remove('hidden');
            displayRotationHistory();
        }
    } else {
        showSignUp();
    }
};
