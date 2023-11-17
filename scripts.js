const firebaseConfig = {
  apiKey: "AIzaSyDhdEhNLiYKNZoRAuAKMBO7_Rf6I1iCtyQ",
  authDomain: "projetstudi-ecf.firebaseapp.com",
  projectId: "projetstudi-ecf",
  storageBucket: "projetstudi-ecf.appspot.com",
  messagingSenderId: "444367472975",
  appId: "1:444367472975:web:f5a1d58bab3baab0775d3a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Formulaire de connexion
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            window.location.href = 'moncompte.html';
        })
        .catch((error) => {
            alert('Erreur lors de la connexion : ' + error.message);
            console.error(error.message);
        });
});

// Formulaire d'inscription
const signupForm = document.getElementById('signup-form');
const signupFirstnameInput = document.getElementById('user-prenom');
const signupLastnameInput = document.getElementById('user-nom');
const signupEmailInput = document.getElementById('user-email');
const signupPasswordInput = document.getElementById('password');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const signupFirstname = signupFirstnameInput.value;
    const signupLastname = signupLastnameInput.value;
    const signupEmail = signupEmailInput.value;
    const signupPassword = signupPasswordInput.value;

    if (!signupFirstname || !signupLastname || !signupEmail || !signupPassword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(signupEmail, signupPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                nom: signupLastname,
                prenom: signupFirstname,
                email: signupEmail
            }).then(() => {
                alert('Votre connexion est établie, vous allez être redirigé...');
                window.location.href = 'moncompte.html';
            }).catch((error) => {
                console.error('Erreur lors de l\'enregistrement des informations utilisateur : ' + error.message);
            });
        })
        .catch((error) => {
            alert('Erreur lors de l\'inscription : ' + error.message);
            console.error(error.message);
        });
});

// Lien de réinitialisation de mot de passe
const resetPasswordLink = document.getElementById('reset-password-link');

resetPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt("Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe:");
    if (email) {
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert("Un e-mail de réinitialisation de mot de passe a été envoyé, pensez à vérifier votre dossier spam.");
            })
            .catch((error) => {
                alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
                console.error(error.message);
            });
    }
});



