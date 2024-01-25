const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.checkMatchStatus = functions.pubsub.schedule('0 10-23 * * *').timeZone('Europe/Paris').onRun((context) => {
    const now = admin.firestore.Timestamp.now();
    const matchsRef = admin.firestore().collection('matchs');

    return matchsRef.get().then(snapshot => {
        const updates = [];

        snapshot.forEach(doc => {
            const match = doc.data();
            const matchTime = match.datedumatch; 

            let newStatus = match.statut;

            if (match.statut === 'À venir' && matchTime.toMillis() <= now.toMillis()) {
                newStatus = 'En cours';
            } else if (match.statut === 'En cours' && matchTime.toMillis() + 3600000 <= now.toMillis()) { 
                newStatus = 'Terminé';
            }

            if (newStatus !== match.statut) {
                updates.push(matchsRef.doc(doc.id).update({ statut: newStatus }));
            }
        });

        return Promise.all(updates);
    });
});
