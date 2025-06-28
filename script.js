let otpCode = "";
let demandes = [];

function toggleVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function checkAdminStep1() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "d2b1admin") {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("otpInfo").style.display = "block";
    document.getElementById("otpInput").style.display = "block";
    document.querySelectorAll("button")[2].style.display = "block";
    alert("Votre OTP est : " + otpCode);
  } else {
    alert("Mot de passe incorrect.");
  }
}

function checkAdminStep2() {
  const otpInput = document.getElementById("otpInput").value;
  if (otpInput === otpCode) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    alert("Code OTP invalide.");
  }
}

function ajouterSuperviseur() {
  const container = document.getElementById("superviseursContainer");
  const supId = "sup-" + Date.now();
  const div = document.createElement("div");
  div.className = "superviseur-card";
  div.innerHTML = `
    <h3 contenteditable="true">Nom Superviseur</h3>
    <input placeholder="Email Superviseur" />
    <button onclick="ajouterLeader(this)">➕ Leader</button>
    <button onclick="envoyerDemande(this, 'reset')">🗑 Demande Réinitialisation</button>
    <button onclick="envoyerDemande(this, 'logout')">🚪 Demande Déconnexion</button>
    <div class="leaders"></div>
  `;
  container.appendChild(div);
}

function ajouterLeader(button) {
  const leadersDiv = button.parentElement.querySelector(".leaders");
  const div = document.createElement("div");
  div.className = "leader-card";
  div.innerHTML = `
    <h4 contenteditable="true">Nom Leader</h4>
    <input type="number" value="10" onchange="calculGain(this)" />
    <span class="gain">Gagne: 70$</span>
    <button onclick="envoyerDemande(this, 'reset')">Demande Reset</button>
    <button onclick="envoyerDemande(this, 'logout')">Demande Déconnexion</button>
  `;
  leadersDiv.appendChild(div);
}

function calculGain(input) {
  const montant = parseFloat(input.value);
  const tier = montant * 10 / 3;
  const bonus = (tier * 0.1) % 1;
  const gain = montant * 10 - tier + bonus;
  input.parentElement.querySelector(".gain").textContent = "Gagne: " + gain.toFixed(2) + "$";
}

function envoyerDemande(button, type) {
  const leader = button.closest(".leader-card")?.querySelector("h4")?.textContent || "Leader inconnu";
  const superviseur = button.closest(".superviseur-card")?.querySelector("h3")?.textContent || "Inconnu";
  const demande = { leader, type, date: new Date().toLocaleString(), superviseur };
  demandes.push(demande);
  afficherDemandes();
  alert(`Demande de ${type === 'reset' ? "réinitialisation" : "déconnexion"} envoyée pour ${leader}`);
}

function afficherDemandes() {
  const zone = documlet otpCode = "";
let demandes = [];

function toggleVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function checkAdminStep1() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "d2b1admin") {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("otpInfo").style.display = "block";
    document.getElementById("otpInput").style.display = "block";
    document.querySelectorAll("button")[2].style.display = "block";
    alert("Votre OTP est : " + otpCode);
  } else {
    alert("Mot de passe incorrect.");
  }
}

function checkAdminStep2() {
  const otpInput = document.getElementById("otpInput").value;
  if (otpInput === otpCode) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    alert("Code OTP invalide.");
  }
}

function ajouterSuperviseur() {
  const container = document.getElementById("superviseursContainer");
  const supId = "sup-" + Date.now();
  const div = document.createElement("div");
  div.className = "superviseur-card";
  div.innerHTML = `
    <h3 contenteditable="true">Nom Superviseur</h3>
    <input placeholder="Email Superviseur" />
    <button onclick="ajouterLeader(this)">➕ Leader</button>
    <button onclick="envoyerDemande(this, 'reset')">🗑 Demande Réinitialisation</button>
    <button onclick="envoyerDemande(this, 'logout')">🚪 Demande Déconnexion</button>
    <div class="leaders"></div>
  `;
  container.appendChild(div);
}

function ajouterLeader(button) {
  const leadersDiv = button.parentElement.querySelector(".leaders");
  const div = document.createElement("div");
  div.className = "leader-card";
  div.innerHTML = `
    <h4 contenteditable="true">Nom Leader</h4>
    <input type="number" value="10" onchange="calculGain(this)" />
    <span class="gain">Gagne: 70$</span>
    <button onclick="envoyerDemande(this, 'reset')">Demande Reset</button>
    <button onclick="envoyerDemande(this, 'logout')">Demande Déconnexion</button>
  `;
  leadersDiv.appendChild(div);
}

function calculGain(input) {
  const montant = parseFloat(input.value);
  const tier = montant * 10 / 3;
  const bonus = (tier * 0.1) % 1;
  const gain = montant * 10 - tier + bonus;
  input.parentElement.querySelector(".gain").textContent = "Gagne: " + gain.toFixed(2) + "$";
}

function envoyerDemande(button, type) {
  const leader = button.closest(".leader-card")?.querySelector("h4")?.textContent || "Leader inconnu";
  const superviseur = button.closest(".superviseur-card")?.querySelector("h3")?.textContent || "Inconnu";
  const demande = { leader, type, date: new Date().toLocaleString(), superviseur };
  demandes.push(demande);
  afficherDemandes();
  alert(`Demande de ${type === 'reset' ? "réinitialisation" : "déconnexion"} envoyée pour ${leader}`);
}

function afficherDemandes() {
  const zone = document.getElementById("demandesContainer");
  zone.innerHTML = `
    <table border="1" width="100%">
      <tr><th>Leader</th><th>Type</th><th>Date</th><th>Superviseur</th></tr>
      ${demandes.map(d => `
        <tr>
          <td>${d.leader}</td>
          <td>${d.type}</td>
          <td>${d.date}</td>
          <td>${d.superviseur}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function fermerSysteme() {
  alert("🚨 Le système est temporairement fermé. Contactez l’admin.");
}
ent.getElementById("demandesContainer");
  zone.innerHTML = `
    <table border="1" width="100%">
      <tr><th>Leader</th><th>Type</th><th>Date</th><th>Superviseur</th></tr>
      ${demandes.map(let otpCode = "";
let demandes = [];

function toggleVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function checkAdminStep1() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "d2b1admin") {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("otpInfo").style.display = "block";
    document.getElementById("otpInput").style.display = "block";
    document.querySelectorAll("button")[2].style.display = "block";
    alert("Votre OTP est : " + otpCode);
  } else {
    alert("Mot de passe incorrect.");
  }
}

function checkAdminStep2() {
  const otpInput = document.getElementById("otpInput").value;
  if (otpInput === otpCode) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    alert("Code OTP invalide.");
  }
}

function ajouterSuperviseur() {
  const container = document.getElementById("superviseursContainer");
  const supId = "sup-" + Date.now();
  const div = document.createElement("div");
  div.className = "superviseur-card";
  div.innerHTML = `
    <h3 contenteditable="true">Nom Superviseur</h3>
    <input placeholder="Email Superviseur" />
    <button onclick="ajouterLeader(this)">➕ Leader</button>
    <button onclick="envoyerDemande(this, 'reset')">🗑 Demande Réinitialisation</button>
    <button onclick="envoyerDemande(this, 'logout')">🚪 Demande Déconnexion</button>
    <div class="leaders"></div>
  `;
  container.appendChild(div);
}

function ajouterLeader(button) {
  const leadersDiv = button.parentElement.querySelector(".leaders");
  const div = document.createElement("div");
  div.className = "leader-card";
  div.innerHTML = `
    <h4 contenteditable="true">Nom Leader</h4>
    <input type="number" value="10" onchange="calculGain(this)" />
    <span class="gain">Gagne: 70$</span>
    <button onclick="envoyerDemande(this, 'reset')">Demande Reset</button>
    <button onclick="envoyerDemande(this, 'logout')">Demande Déconnexion</button>
  `;
  leadersDiv.appendChild(div);
}

function calculGain(input) {
  const montant = parseFloat(input.value);
  const tier = montant * 10 / 3;
  const bonus = (tier * 0.1) % 1;
  const gain = montant * 10 - tier + bonus;
  input.parentElement.querySelector(".gain").textContent = "Gagne: " + gain.toFixed(2) + "$";
}

function envoyerDemande(button, type) {
  const leader = button.closest(".leader-card")?.querySelector("h4")?.textContent || "Leader inconnu";
  const superviseur = button.closest(".superviseur-card")?.querySelector("h3")?.textContent || "Inconnu";
  const demande = { leader, type, date: new Date().toLocaleString(), superviseur };
  demandes.push(demande);
  afficherDemandes();
  alert(`Demande de ${type === 'reset' ? "réinitialisation" : "déconnexion"} envoyée pour ${leader}`);
}

function afficherDemandes() {
  const zone = document.getElementById("demandesContainer");
  zone.innerHTML = `
    <table border="1" width="100%">
      <tr><th>Leader</th><th>Type</th><th>Date</th><th>Superviseur</th></tr>
      ${demandes.map(d => `
        <tr>
          <td>${d.leader}</td>
          <td>${d.type}</td>
          <td>${d.date}</td>
          <td>${d.superviseur}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function fermerSysteme() {
  alert("🚨 Le système est temporairement fermé. Contactez l’admin.");
}
d => `
        <tr>
          <td>${d.leader}</td>
          <td>${d.type}</td>
          <td>${d.date}</td>
          <td>${d.superviseur}</td>
        </tr>
      `).join('')}
    </table>function fermerSysteme() {
  alert("🚨 Le système est fermé temporairement. Contactez l’admin.");
}

function ajouterSuperviseur() {
  const id = Date.now();
  const div = document.createElement("div");
  div.className = "superviseur-card";
  div.innerHTML = `
    <h3 contenteditable="true" style="text-align:center;font-weight:bold;">Nom du Superviseur</h3>
    <input placeholder="Email" /><br>
    <button onclick="ajouterLeader(this)">➕ Ajouter Leader</button>
  `;
  document.getElementById("superviseursContainer").appendChild(div);
}

function ajouterLeader(btn) {
  const parent = btn.parentNode;
  const leaderDiv = document.createElement("div");
  leaderDiv.className = "leader-card";
  leaderDiv.innerHTML = `
    <h4 contenteditable="true" style="text-align:center;font-weight:bold;">Nom du Team Leader</h4>
    <input placeholder="Email" /><br>
    <div>
      <input type="number" placeholder="Montant investi" value="10" oninput="calculerGainParticipant(this)">
      <input placeholder="Gains" readonly />
    </div>
    <button onclick="demander('reset', this)">🗑️ Demande Réinit.</button>
    <button onclick="demander('deconnexion', this)">🚪 Demande Déconn.</button>
    <button onclick="reconnecterLeader(this)">🔄 Reconnecter</button>
  `;
  parent.appendChild(leaderDiv);
}

function demander(type, btn) {
  const leader = btn.parentNode.querySelector("h4").textContent.trim();
  const email = btn.parentNode.querySelector("input[type=email]")?.value || "N/A";
  enregistrerDemande(leader, type, email, 'admin');
  alert(`Demande de ${type} envoyée pour ${leader}`);
}

function reconnecterLeader(btn) {
  const leader = btn.parentNode.querySelector("h4").textContent.trim();
  alert(`Leader ${leader} reconnecté.`);
}

function afficherDemandes() {
  const zone = document.getElementById("historiqueDemandes");
  zone.innerHTML = "<h4>Demandes de déconnexion/réinitialisation :</h4>";
  zone.innerHTML += "<table border='1'><tr><th>Leader</th><th>Type</th><th>Date</th><th>Superviseur</th><th>Action</th></tr>";
  demandes.forEach(d => {
    zone.innerHTML += `<tr>
      <td>${d.demandeur}</td>
      <td>${d.type}</td>
      <td>${d.date}</td>
      <td>${d.email}</td>
      <td><button onclick="traiter('${d.demandeur}', '${d.type}')">Accepter</button></td>
    </tr>`;
  });
  zone.innerHTML += "</table>";
}

function traiter(nom, type) {
  alert(`Action “${type}” effectuée pour ${nom}`);
}

function calculerGainParticipant(input) {
  const montant = parseFloat(input.value);
  const total = montant * 10;
  const reinvesti = total / 3;
  const reserve = reinvesti * 0.1;
  const net = total - reinvesti + (reserve / 10);
  input.nextElementSibling.value = net.toFixed(2);
}

  `;
}

function fermerSysteme() {
  alert("🚨 Le système est temporairement fermé. Contactez l’admin.");
}
