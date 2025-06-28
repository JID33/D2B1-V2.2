let demandes = [];

const superviseurs = [];
const leaders = [];

function enregistrerDemande(demandeur, type, email, cible) {
  const d = {
    demandeur,
    type,
    email,
    cible,
    date: new Date().toLocaleString()
  };
  demandes.push(d);
  afficherDemandes();
}
