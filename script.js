function envoyerVersGoogleSheet(donnees) {
  fetch('https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec', {
    method: 'POST',
    body: JSON.stringify(donnees),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Données envoyées à Google Sheets :", data.message);
  })
  .catch(err => {
    console.error("Erreur lors de l'envoi vers Google Sheets :", err);
  });
}
