<script>
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby44bVHJV3oXXZ7OK7vl5NuOHQdiJDmjKvSve1GfZ-We3tG2ANyAV6X5l9jSR4ls8x0/exec";

  // Fonction pour envoyer une demande (déconnexion, réinitialisation, reconnexion, ajout participant, erreur)
  function envoyerVersGoogleSheets(donnees) {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(donnees),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.text())
    .then((data) => console.log("✅ Enregistrement réussi :", data))
    .catch((err) => console.error("❌ Erreur :", err));
  }

  // Exemple : appel lors d’une demande de déconnexion
  function demandeDeconnexion(nomLeader, email, superviseur) {
    const data = {
      nom: nomLeader,
      email: email,
      telephone: "", // Optionnel
      nif: "", // Optionnel
      role: "Team Leader",
      typeDemande: "Demande de déconnexion",
      superviseur: superviseur,
      participantMontant: "",
      participantGain: "",
      messageErreur: ""
    };
    envoyerVersGoogleSheets(data);
  }

  // Exemple : ajout de participant avec montant et gain
  function ajouterParticipant(nom, montant, gain, email = "", superviseur = "") {
    const data = {
      nom: nom,
      email: email,
      telephone: "",
      nif: "",
      role: "Participant",
      typeDemande: "Ajout participant",
      superviseur: superviseur,
      participantMontant: montant,
      participantGain: gain,
      messageErreur: ""
    };
    envoyerVersGoogleSheets(data);
  }

  // Exemple : rapport d'erreur
  function rapporterErreur(nomTL, email, messageErreur, superviseur) {
    const data = {
      nom: nomTL,
      email: email,
      telephone: "",
      nif: "",
      role: "Team Leader",
      typeDemande: "Erreur",
      superviseur: superviseur,
      participantMontant: "",
      participantGain: "",
      messageErreur: messageErreur
    };
    envoyerVersGoogleSheets(data);
  }

</script>
