
   document.addEventListener('DOMContentLoaded', () => {
        const auth = firebase.auth();
        const db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                db.collection('users').doc(user.uid).get().then((doc) => {
                    if (doc.exists && doc.data().role === 'admin') {
                        setupAdminInterface(db);
                    } else {
                        alert("Vous n'êtes pas autorisé à accéder à cette page");
                        window.location.href = 'login.html';
                    }
                }).catch((error) => {
                    console.error("Erreur lors de la récupération des données : ", error);
                });
            } else {
                window.location.href = 'login.html';
            }
        });
    });

    function setupAdminInterface(db) {
        setupTeamInterface(db);
        setupPlayerInterface(db);
        setupMatchInterface(db);
        loadAndDisplayMatches(db);
    }

    function setupTeamInterface(db) {
        const addTeamButton = document.getElementById('add-team-button');
        const addTeamModal = document.getElementById('add-team-modal');
        const closeBtn = document.querySelector('.close-button');
        const addTeamForm = document.getElementById('add-team-form');

        loadAndDisplayTeams(db);

        addTeamButton.addEventListener('click', () => {
            addTeamModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            addTeamModal.style.display = 'none';
        });

        addTeamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const teamNom = document.getElementById('team-nom').value;
            const teamPays = document.getElementById('team-pays').value;
            addTeamToFirestore(teamNom, teamPays, db);
            addTeamModal.style.display = 'none';
        });
    }

    function addTeamToFirestore(teamNom, teamPays, db) {
        db.collection('teams').doc(teamNom).set({
            nom: teamNom,
            pays: teamPays
        }).then(() => {
            alert("Équipe ajoutée avec succès.");
            window.location.reload();
        }).catch((error) => {
            console.error("Erreur lors de l'ajout de l'équipe : ", error);
        });
    }

    function loadAndDisplayTeams(db) {
        const teamListContainer = document.getElementById('team-list');
        db.collection('teams').get().then((querySnapshot) => {
            querySnapshot.forEach((teamDoc) => {
                const teamLi = document.createElement('li');
                teamLi.textContent = `${teamDoc.data().nom} (${teamDoc.data().pays})`;
                teamLi.classList.add('team-item');
                teamLi.onclick = () => openPlayerListModal(teamDoc.id, db);

                const deleteIcon = document.createElement('span');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.classList.add('delete-icon');
                deleteIcon.onclick = (e) => {
                    e.stopPropagation();
                    deleteTeam(teamDoc.id, db);
                };
                teamLi.appendChild(deleteIcon);

                teamListContainer.appendChild(teamLi);
            });
        });
    }

    function openPlayerListModal(teamId, db) {
        const playerListModal = document.getElementById('player-list-modal');
        const closePlayerListBtn = playerListModal.querySelector('.close-button');
        const playerListContainer = document.getElementById('player-list');
        playerListContainer.innerHTML = '';

        db.collection('teams').doc(teamId).collection('joueurs').get().then((querySnapshot) => {
            querySnapshot.forEach((playerDoc) => {
                const playerLi = document.createElement('li');
                playerLi.textContent = `Nom: ${playerDoc.data().nom}, Numéro: ${playerDoc.data().numero}`;

                const deleteIcon = document.createElement('span');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.classList.add('delete-icon');
                deleteIcon.onclick = () => deletePlayer(teamId, playerDoc.id, db);
                playerLi.appendChild(deleteIcon);

                playerListContainer.appendChild(playerLi);
            });
        });

        playerListModal.style.display = 'block';
        closePlayerListBtn.onclick = () => { playerListModal.style.display = 'none'; };
    }

    function deleteTeam(teamId, db) {
        if (confirm('Êtes-vous certain de vouloir supprimer cette équipe ?')) {
            db.collection('teams').doc(teamId).delete().then(() => {
                alert("Équipe supprimée avec succès.");
                window.location.reload();
            }).catch((error) => {
                console.error("Erreur lors de la suppression de l'équipe : ", error);
            });
        }
    }

    function deletePlayer(teamId, playerId, db) {
        if (confirm('Êtes-vous certain de vouloir supprimer ce joueur ?')) {
            db.collection('teams').doc(teamId).collection('joueurs').doc(playerId).delete().then(() => {
                alert("Joueur supprimé avec succès.");
                openPlayerListModal(teamId, db); 
            }).catch((error) => {
                console.error("Erreur lors de la suppression du joueur : ", error);
            });
        }
    }

    function setupPlayerInterface(db) {
        const addPlayerButton = document.getElementById('add-player-button');
        const addPlayerModal = document.getElementById('add-player-modal');
        const closePlayerBtn = document.querySelector('#add-player-modal .close-button');
        const addPlayerForm = document.getElementById('add-player-form');

        addPlayerButton.addEventListener('click', () => {
            loadTeamsIntoSelect(db, 'player-equipe');
            addPlayerModal.style.display = 'block';
        });

        closePlayerBtn.addEventListener('click', () => {
            addPlayerModal.style.display = 'none';
        });

        addPlayerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerNom = document.getElementById('player-nom').value;
            const playerNumero = document.getElementById('player-numero').value;
            const playerEquipe = document.getElementById('player-equipe').value;
            addPlayerToTeam(playerNom, playerNumero, playerEquipe, db);
            addPlayerModal.style.display = 'none';
        
        
        
        
        
        
        });
    }

    function loadTeamsIntoSelect(db, selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Choisir une équipe</option>'; 
        db.collection('teams').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = doc.data().nom;
                select.appendChild(option);
            });
        });
    }



    function addPlayerToTeam(playerNom, playerNumero, playerEquipe, db) {
        db.collection('teams').doc(playerEquipe).collection('joueurs').add({
            nom: playerNom,
            numero: playerNumero
        }).then(() => {
            alert("Joueur ajouté avec succès.");
        }).catch((error) => {
            console.error("Erreur lors de l'ajout du joueur : ", error);
        });
    }
    function setupMatchInterface(db) {
        const addMatchButton = document.getElementById('add-match-button');
        const addMatchModal = document.getElementById('add-match-modal');
        const closeMatchBtn = document.querySelector('#add-match-modal .close-button');
        const addMatchForm = document.getElementById('add-match-form');

        addMatchButton.addEventListener('click', () => {
            loadTeamsIntoSelect(db, 'match-equipe1');
            loadTeamsIntoSelect(db, 'match-equipe2');
            addMatchModal.style.display = 'block';
        });

        closeMatchBtn.addEventListener('click', () => {
            addMatchModal.style.display = 'none';
        });

        addMatchForm.addEventListener('submit', (e) => {
            e.preventDefault();
        
            const equipe1 = document.getElementById('match-equipe1').value;
            const equipe2 = document.getElementById('match-equipe2').value;
            const date = document.getElementById('match-date').value;
            const time = document.getElementById('match-time').value;
            const cote1 = parseFloat(document.getElementById('match-cote1').value);
            const cote2 = parseFloat(document.getElementById('match-cote2').value);
            const meteo = document.getElementById('match-meteo').value;
        
            const dateDuMatch = new Date(`${date}T${time}`);
        
         
            const heureMatch = parseInt(time.split(":")[0]);
        
         
            if (equipe1 === equipe2) {
                alert("Veuillez choisir deux équipes différentes.");
                return;
            }
            if (dateDuMatch <= new Date()) {
                alert("La date du match doit être dans le futur.");
                return;
            }
            if (heureMatch < 10 || heureMatch > 23) {
                alert("L'heure du match doit être entre 10h00 et 23h00.");
                return;
            }
            if (isNaN(cote1) || cote1 < 1.50 || cote1 > 10 || isNaN(cote2) || cote2 < 1.50 || cote2 > 10) {
                alert("Veuillez entrer des cotes valides entre 1.50 et 10 pour chaque équipe.");
                return;
            }
        
          
            addMatchToFirebase(equipe1, cote1, equipe2, cote2, dateDuMatch, meteo, db);
            addMatchModal.style.display = 'none';
        });
        
    }

    function addMatchToFirebase(equipe1, cote1, equipe2, cote2, dateDuMatch, meteo, db) {
        db.collection('matchs').add({
            equipe1: equipe1,
            cote1: cote1,
            equipe2: equipe2,
            cote2: cote2,
            datedumatch: firebase.firestore.Timestamp.fromDate(dateDuMatch), 
            meteo: meteo,
            statut: 'À venir'
        }).then((docRef) => {
            alert("Match ajouté avec succès.");
        }).catch((error) => {
            console.error("Erreur lors de l'ajout du match : ", error);
        });
    }


    // Fonction pour charger et afficher les matchs
    function loadAndDisplayMatches(db) {
        const matchListContainer = document.getElementById('match-list');
        db.collection('matchs').get().then((querySnapshot) => {
            querySnapshot.forEach((matchDoc) => {
    
            const matchDate = matchDoc.data().datedumatch.toDate();
                const matchLi = document.createElement('li');
                matchLi.textContent = `${matchDoc.data().equipe1} vs ${matchDoc.data().equipe2} - ${matchDate.toLocaleString()}`;

                const deleteIcon = document.createElement('span');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.classList.add('delete-icon');
                deleteIcon.onclick = (e) => {
                    e.stopPropagation();
                    deleteMatch(matchDoc.id, db);
                };
                matchLi.appendChild(deleteIcon);

                matchListContainer.appendChild(matchLi);
            });
        });
    }

    // Fonction pour supprimer un match
    function deleteMatch(matchId, db) {
        if (confirm('Êtes-vous certain de vouloir supprimer ce match ?')) {
            db.collection('matchs').doc(matchId).delete().then(() => {
                alert("Match supprimé avec succès.");
                window.location.reload(); 
            }).catch((error) => {
                console.error("Erreur lors de la suppression du match : ", error);
            });
        }
    }