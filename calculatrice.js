function calculerGains() {
  const montant = parseFloat(document.getElementById("montantInvesti").value);
  const nb = parseInt(document.getElementById("nbParticipants").value);

  const total = montant * nb;
  const reinvesti = total / 3;
  const reserve = reinvesti * 0.1;
  const net = total - reinvesti + (reserve / 10);

  document.getElementById("resultatCalcul").textContent =
    `Gains calculés : ${net.toFixed(2)} $ (réserve : ${reserve.toFixed(2)}$)`;

  dessinerGraphique(net);
}

function dessinerGraphique(gain) {
  const svg = document.getElementById("graphiqueGain");
  svg.innerHTML = '';

  const barWidth = 50;
  const barHeight = gain;
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

  rect.setAttribute("x", "10");
  rect.setAttribute("y", 100 - barHeight);
  rect.setAttribute("width", barWidth);
  rect.setAttribute("height", barHeight);
  rect.setAttribute("fill", "#3498db");

  svg.appendChild(rect);
}

function ouvrirCalculatrice() {
  document.getElementById("calculatriceModal").style.display = "flex";
}

function fermerCalculatrice() {
  document.getElementById("calculatriceModal").style.display = "none";
}
