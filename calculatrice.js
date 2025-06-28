// calculatrice.js

// Fonction pour calcul rotatif selon ta formule personnalisée
function calculRotatif(investissement, totalParticipants = 10) {
  const totalJour = investissement * totalParticipants;
  const reinvesti = totalJour / 3;
  const reserve = reinvesti * 0.10;
  const reste = totalJour - reinvesti;
  const bonus = (reserve % 1) + reste;

  return {
    investi: investissement,
    gagne: Math.round(bonus),
    reserve: Math.floor(reserve),
    totalJour: totalJour
  };
}

// Fonction pour afficher les résultats dans une interface (si appelé depuis admin)
function afficherCalculateur(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <h3>Calculateur Rotatif D2B1</h3>
    <label>Montant investi par personne ($):</label>
    <input type="number" id="valeurInvest" value="10" min="1" />
    <label>Nombre de participants:</label>
    <input type="number" id="valeurParticipants" value="10" min="1" />
    <button onclick="lancerCalcul()">Calculer</button>
    <div id="resultatsCalcul" style="margin-top:10px;"></div>
  `;
}

function lancerCalcul() {
  const montant = parseFloat(document.getElementById("valeurInvest").value);
  const participants = parseInt(document.getElementById("valeurParticipants").value);
  const result = calculRotatif(montant, participants);

  document.getElementById("resultatsCalcul").innerHTML = `
    <strong>Total collecté:</strong> ${result.totalJour} $<br />
    <strong>Montant réinvesti (1/3):</strong> ${(result.totalJour / 3).toFixed(2)} $<br />
    <strong>10% de ce tiers en réserve:</strong> ${result.reserve} $<br />
    <strong>Gains nets du participant en rotation:</strong> ${result.gagne} $
  `;
}
