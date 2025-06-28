function approuverDemande(btn) {
  alert("Demande approuvée et action exécutée !");
  btn.disabled = true;
  btn.innerText = "✔️ Approuvé";
}
