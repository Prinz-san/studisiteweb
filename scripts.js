const firebaseConfig = {
// Masqué
  

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
let selectedCote = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeFormHandlers();
    loadAndDisplayMatchesForBetting();
});

document.addEventListener('DOMContentLoaded', function() {


    

    const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const emailInput = document.getElementById('email');
    const loginPasswordInput = document.getElementById('login-password');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = loginPasswordInput.value;

      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).get().then((doc) => {
              if (doc.exists && doc.data().role === 'admin') {
                window.location.href = 'administration.html';
              } else {
                window.location.href = 'moncompte.html';
              }
            }).catch((error) => {
              console.error("Erreur lors de la récupération du rôle : ", error);
            });
          })
          .catch((error) => {
            alert('Erreur lors de la connexion : ' + error.message);
            console.error(error.message);
          });
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    const signupFirstnameInput = document.getElementById('user-prenom');
    const signupLastnameInput = document.getElementById('user-nom');
    const signupEmailInput = document.getElementById('user-email');
    const signupPasswordInput = document.getElementById('signup-password');

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const signupFirstname = signupFirstnameInput.value;
      const signupLastname = signupLastnameInput.value;
      const signupEmail = signupEmailInput.value;
      const signupPassword = signupPasswordInput.value;

      firebase.auth().createUserWithEmailAndPassword(signupEmail, signupPassword)
          .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
              nom: signupLastname,
              prenom: signupFirstname,
              email: signupEmail,
              role: 'user'
            }).then(() => {
              alert('Votre compte a été créé avec succès.');
              window.location.href = 'moncompte.html';
            }).catch((error) => {
              console.error('Erreur lors de l\'enregistrement des informations utilisateur : ', error);
            });
          })
          .catch((error) => {
            alert('Erreur lors de l\'inscription : ' + error.message);
            console.error(error.message);
          });
    });
  }

  const resetPasswordLink = document.getElementById('reset-password-link');
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = prompt("Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe:");
      if (email) {
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
              alert("Un e-mail de réinitialisation de mot de passe a été envoyé.");
            })
            .catch((error) => {
              alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
              console.error(error.message);
            });
      }
    });
  }

  loadAndDisplayAllMatchs(db);
});

function loadAndDisplayAllMatchs(db) {
    console.log("Chargement des matchs...");
    const matchsContainer = document.querySelector('.matchs-container');
    if (!matchsContainer) {
        console.error("Élément .matchs-container non trouvé dans le HTML.");
        return;
    }
    
    db.collection('matchs').get().then((querySnapshot) => {
        querySnapshot.forEach((matchDoc) => {
            const matchData = matchDoc.data();
            matchData.id = matchDoc.id;
            const matchCard = document.createElement('div');
            matchCard.classList.add('match-card');
  
           
            const matchDate = matchData.datedumatch.toDate();
            matchCard.innerHTML = `
                <img src="assets/logo.png" alt="Logo">
                <div class="match-details">
                    <div class="match-teams">${matchData.equipe1} VS ${matchData.equipe2}</div>
                    <div class="match-cote">Cote: ${matchData.cote1} - ${matchData.cote2}</div>
                    <div class="match-date">${matchDate.toLocaleString()}</div>
                    <button class="status-button" style="background-color: lightgray;">Statut: ${matchData.statut}</button>
                    <div class="match-score">Score: ${matchData.score1} - ${matchData.score2} </div>
                    <div class="match-vainqueur">Vainqueur : ${matchData.vainqueur} </div>
                </div>
            `;

            
            matchCard.addEventListener('click', () => {
                openMatchModal(matchData);
            });

            matchsContainer.appendChild(matchCard);
        });
    }).catch((error) => {
        console.error("Erreur lors du chargement des matchs: ", error);
    });
}

  
  function loadAndDisplayMatchsDuJour(db) {
    console.log("Chargement des matchs du jour...");
    const matchsContainer = document.querySelector('.matchs-container-jour');
  
    const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); 

  const startTimestamp = firebase.firestore.Timestamp.fromDate(today);
  const endTimestamp = firebase.firestore.Timestamp.fromDate(tomorrow);

  db.collection('matchs')
    .where('datedumatch', '>=', startTimestamp)
    .where('datedumatch', '<', endTimestamp)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        matchsContainer.innerHTML = '<p>Aucun match n\'est prévu pour aujourd\'hui.</p>';
      } else {
        querySnapshot.forEach((matchDoc) => {
          const matchData = matchDoc.data();
          const matchCard = document.createElement('div');
          matchCard.classList.add('match-card');
  
          const matchDate = matchData.datedumatch.toDate();
  
          matchCard.innerHTML = `
            <img src="assets/logo.png" alt="Logo">
            <div class="match-details">
              <div class="match-teams">${matchData.equipe1} <br> VS <br>${matchData.equipe2}</div>
              <div class="match-cote">Cote: ${matchData.cote1} - ${matchData.cote2}</div>
              <div class="match-date">${matchDate.toLocaleString()}</div>
              <button class="status-button" style="background-color: lightgray;">Statut: ${matchData.statut}</button>
              <div class="match-score">Score: ${matchData.score1} - ${matchData.score2} </div>
              <div class="match-vainqueur">Vainqueur : ${matchData.vainqueur} </div>
            </div>
          `;
  
          matchsContainer.appendChild(matchCard);
        });
      }
    }).catch((error) => {
      console.error("Erreur lors du chargement des matchs: ", error);
    });
}


document.addEventListener('DOMContentLoaded', function() { 
    loadAndDisplayMatchsDuJour(db);
});




function openMatchModal(matchData) {
    if (!matchData.id) {
        console.error("L'ID du match est indéfini.");
        return;
    }
    loadTeamData(matchData.equipe1, (joueursEquipe1) => {
        let equipe1Html = `
            <h3>${matchData.equipe1}</h3>
            <p>Côte: ${matchData.cote1}</p>
            <div>${generatePlayerList(joueursEquipe1)}</div>
        `;
        document.getElementById('colonne1').innerHTML = equipe1Html;
    });

    // Charger les données de l'équipe 2 et remplir les informations
    loadTeamData(matchData.equipe2, (joueursEquipe2) => {
        let equipe2Html = `
            <h3>${matchData.equipe2}</h3>
            <p>Côte: ${matchData.cote2}</p>
            <div>${generatePlayerList(joueursEquipe2)}</div>
        `;
        document.getElementById('colonne3').innerHTML = equipe2Html;
    });

    // Remplir les informations pour le match, la météo, le statut et les commentaires
    let meteoIcone = getMeteoIcone(matchData.meteo);
    let matchHtml = `
    <button><a href="paris.html">Parier en ligne</a></button>
    <p>Date: ${matchData.datedumatch.toDate().toLocaleString()}</p>
    <p>Météo: ${matchData.meteo}</p>
    <img src="${meteoIcone}" alt="${matchData.meteo}" style="display: block; margin: auto;">
    <p>Statut: ${matchData.statut}</p>
    <div id="commentaires"></div>  
    `;
    document.getElementById('colonne2').innerHTML = matchHtml;
    loadCommentaires(matchData.id);


    
    document.getElementById('matchModal').style.display = 'block';
}

function loadTeamData(teamName, callback) {
    db.collection('teams').doc(teamName).collection('joueurs').get()
    .then(querySnapshot => {
        const joueurs = [];
        querySnapshot.forEach(doc => {
            joueurs.push(doc.data());
        });
        callback(joueurs);
    })
    .catch(error => {
        console.error("Erreur lors du chargement des joueurs: ", error);
        callback([]); 
    });
}

function generatePlayerList(joueurs) {
    return joueurs.length > 0 ? joueurs.map(joueur => `<p>${joueur.numero} - ${joueur.nom}</p>`).join('') : 'Aucun joueur n\'est enregistré';
}

function getMeteoIcone(meteo) {
    const icones = {
        "ensoleillé": "assets/soleil.png",
        "nuageux": "assets/nuage.png",
        "pluvieux": "assets/pluie.png",
        "venteux": "assets/vent.png",
        "neigeux": "assets/neige.png"
    };
    return icones[meteo] || 'icone_default.png';
}

function loadCommentaires(matchId) {
    db.collection('matchs').doc(matchId).collection('commentaires').get()
    .then((querySnapshot) => {
        let commentairesHtml = querySnapshot.empty ? '<p>Aucun commentaire n\'est publié.</p>' : '';
        querySnapshot.forEach((doc) => {
            Object.values(doc.data()).forEach(commentaire => {
                commentairesHtml += `<li>${commentaire}</li>`;
            });
        });
        document.getElementById('commentaires').innerHTML = querySnapshot.empty ? commentairesHtml : `<ul>${commentairesHtml}</ul>`;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayMatchesForBetting();
});

function loadAndDisplayMatchesForBetting() {
    const matchsContainer = document.querySelector('.matchs-paris');
    db.collection('matchs')
      .where('statut', 'in', ['en cours', 'À venir'])
      .get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          matchsContainer.innerHTML = '<p>Aucun match disponible pour le pari.</p>';
          return;
        }

        // ligne match
        let row = document.createElement('div');
        row.className = 'row';
        let matchCount = 0;
        let selectedCote = null;

        querySnapshot.forEach(doc => {
          const match = doc.data();
          const matchCard = document.createElement('div');
          matchCard.className = 'match-card';
          matchCard.innerHTML = `
            <div class="match-details">
                <div class="match-teams">${match.equipe1} VS ${match.equipe2}</div>
                <div class="match-date">${new Date(match.datedumatch.seconds * 1000).toLocaleString()}</div>
                <button onclick="handleBettingClick('${doc.id}')">Parier</button>
            </div>
          `;

          const betButton = matchCard.querySelector('button');
          betButton.addEventListener('click', function() {
              handleBettingClick(doc.id);
          });

          row.appendChild(matchCard);
          matchCount++;

         
          if (matchCount % 2 === 0 || matchCount === querySnapshot.size) {
            matchsContainer.appendChild(row);
            row = document.createElement('div');
            row.className = 'row';
          }
        });
      }).catch(error => {
        console.error("Erreur lors du chargement des matchs: ", error);
      });
}

function handleBettingClick(matchId) {
    db.collection('matchs').doc(matchId).get().then(doc => {
        const match = doc.data();
        displayBettingOptions(match, matchId);
    });
}

function chooseBet(cote) {
    selectedCote = cote;
    updatePossibleGain();


    const buttons = document.querySelectorAll('.right-div button');
    buttons.forEach(button => {
        if (button.getAttribute('data-cote') == cote.toString()) {
            button.style.backgroundColor = '#4CAF50'; 
            button.style.color = 'white'; 
        } else {
            button.style.backgroundColor = ''; 
            button.style.color = ''; 
        }
    });
}



function updatePossibleGain() {
    const mise = document.getElementById('bet-amount').value;
    if (mise && selectedCote) {
        const possibleGain = selectedCote * mise;
        document.getElementById('possible-gain').textContent = `Gain possible: ${possibleGain.toFixed(2)}`;
    }
}


function displayBettingOptions(match, matchId) {
    const bettingDiv = document.querySelector('.right-div');
    bettingDiv.innerHTML = `
    <h2>Parier sur le match : </h2>
    <p>Date: ${new Date(match.datedumatch.seconds * 1000).toLocaleString()}</p>
    <button id="cote1-btn" data-cote="${match.cote1}">Cote ${match.cote1} : ${match.equipe1}</button>
    <button id="cote2-btn" data-cote="${match.cote2}">Cote ${match.cote2} : ${match.equipe2}</button>
    <input type="number" id="bet-amount" class="bet-input" placeholder="Votre mise" />
    <p id="possible-gain">Gain possible: </p>
    <button id="validate-bet-button">Valider</button>
`;
    document.getElementById('cote1-btn').addEventListener('click', () => chooseBet(match.cote1));
    document.getElementById('cote2-btn').addEventListener('click', () => chooseBet(match.cote2));
    document.getElementById('bet-amount').addEventListener('input', updatePossibleGain);
    document.getElementById('validate-bet-button').addEventListener('click', () => validateBet(matchId));
}

function validateBet(matchId) {
    const mise = document.getElementById('bet-amount').value;
    if (!selectedCote || !mise) {
        alert('Veuillez sélectionner une cote et saisir votre mise.');
        return;
    }

    const userId = firebase.auth().currentUser.uid;
    const gainPossible = selectedCote * mise;
    const numeroPari = '2023SBM' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const dateDuPari = new Date();

    const pari = {
        numeroPari,
        misechoisie: mise,
        cotechoisie: selectedCote,
        gainpossible: gainPossible.toFixed(2),
        statut: 'en attente',
        parieur: userId,
        datedupari: firebase.firestore.Timestamp.fromDate(dateDuPari)
    };

    // Enregistrement du pari dans la sous-collection 'paris' du match
    db.collection('matchs').doc(matchId).collection('paris').add(pari)
       .then(() => {
           alert(`Votre pari a bien été enregistré sous la référence ${numeroPari}`);
       })
       .catch(error => {
           console.error('Erreur lors de l\'enregistrement du pari: ', error);
       });
}


function createMatchCard(match, matchId) {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    matchCard.innerHTML = `
        <div class="match-details">
            <div class="match-teams">${match.equipe1} VS ${match.equipe2}</div>
            <div class="match-date">${new Date(match.datedumatch.seconds * 1000).toLocaleString()}</div>
            <button id="bet-${matchId}">Parier</button>
        </div>
    `;
    matchCard.querySelector(`#bet-${matchId}`).addEventListener('click', function() {
        handleBettingClick(matchId);
    });
    return matchCard;
}