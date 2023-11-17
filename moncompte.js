document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged((user) => {
        const infoDiv = document.getElementById('mes-informations');

        if (user) {
            // Utilisateur connecté, récupérez les informations
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    infoDiv.innerHTML = `
                        <p id="user-nom">Nom: ${doc.data().nom}</p>
                        <p id="user-prenom">Prénom: ${doc.data().prenom}</p>
                        <p id="user-email">Email: ${doc.data().email}</p>
                        <button id="logout-button" class="logout-button">Se déconnecter</button>
                    `;

                    document.getElementById('logout-button').addEventListener('click', () => {
                        auth.signOut().then(() => {
                            window.location.href = 'login.html';
                        });
                    });
                }
            }).catch((error) => {
                console.error("Erreur lors de la récupération des données : ", error);
            });
        } else {
            // Utilisateur non connecté, affichez le bouton de connexion
            infoDiv.innerHTML = '<button id="login-button" class="login-button">Se connecter</button>';

            document.getElementById('login-button').addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    });
});
