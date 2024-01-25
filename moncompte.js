document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const infoDiv = document.getElementById('mes-informations');
    const parisDiv = document.getElementById('paris-historique');
    const graphDiv = document.getElementById('graphique-container');

    auth.onAuthStateChanged((user) => {
        if (user) {
            getUserInfo(user, db, infoDiv);
            loadAndDisplayParis(user.uid, db, parisDiv, graphDiv);
        } else {
            handleNonAuthenticatedUser(infoDiv);
        }
    });
});

function getUserInfo(user, db, infoDiv) {
    db.collection('users').doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            displayUserInfo(doc, infoDiv);
            addLogoutHandler();
        }
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données : ", error);
    });
}

function displayUserInfo(doc, infoDiv) {
    infoDiv.innerHTML = `
        <p id="user-nom">Nom: ${doc.data().nom}</p>
        <p id="user-prenom">Prénom: ${doc.data().prenom}</p>
        <p id="user-email">Email: ${doc.data().email}</p>
        <button id="logout-button" class="logout-button">Se déconnecter</button>
    `;
}

function addLogoutHandler() {
    document.getElementById('logout-button').addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}

function handleNonAuthenticatedUser(infoDiv) {
    infoDiv.innerHTML = '<button id="login-button" class="login-button">Se connecter</button>';
    document.getElementById('login-button').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

function loadAndDisplayParis(userId, db, parisDiv, graphDiv) {

    db.collection('matchs').get().then(matchSnapshot => {
        const historiqueHtml = [];
        const graphData = {
            dates: [],
            gains: [],
            pertes: []
        };

        matchSnapshot.forEach(matchDoc => {
          
            db.collection(`matchs/${matchDoc.id}/paris`).where("parieur", "==", userId).get().then(parisSnapshot => {
                parisSnapshot.forEach(doc => {
                    const pari = doc.data();
                    const gainOuPerte = parseFloat(pari.gainpossible);
                    const dateDuPari = pari.dateDuPari ? new Date(pari.dateDuPari.seconds * 1000) : new Date();
                    const dateDuPariFormattee = dateDuPari.toLocaleDateString();

                    historiqueHtml.push(`
                        <details class="pari-accordeon">
                            <summary>Pari numéro: ${pari.numeroPari}</summary>
                            <div class="pari-details">
                                <p>Match: ${matchDoc.data().equipe1} - ${matchDoc.data().equipe2}</p>
                                <p>Date: ${dateDuPariFormattee}</p>
                                <p>Gain estimé : ${pari.gainpossible}</p>
                                <p>Mise de départ: ${pari.misechoisie}</p>
                                <p>Statut: ${pari.statut}</p>
                            </div>
                        </details>
                    `);

                    graphData.dates.push(dateDuPariFormattee);
                    if (pari.statut === 'gagnant') {
                        graphData.gains.push(gainOuPerte);
                        graphData.pertes.push(0);
                    } else if (pari.statut === 'perdant') {
                        graphData.gains.push(0);
                        graphData.pertes.push(gainOuPerte);
                    }
                });

              
                if (!matchSnapshot.empty) {
                    parisDiv.innerHTML = historiqueHtml.join('');
                    displayParisGraph(graphData, graphDiv);
                }
            });
        });
    });
}


function displayParisGraph(graphData, graphDiv) {
    const ctx = document.getElementById('myChart').getContext('2d');

 
    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    // Créer un nouveau graphique
    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: graphData.dates,
            datasets: [{
                label: 'Gains',
                data: graphData.gains,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }, {
                label: 'Pertes',
                data: graphData.pertes,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}
