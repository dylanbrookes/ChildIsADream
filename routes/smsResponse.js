const express = require('express');
const router = express.Router();
const database = require('../database');
const users = database.userDatabase();
const IncomingMessage = require('../classes/IncomingMessage');
const SMS = require('../classes/SMS');

const symptomList = [
    "childAgeLessThan5",
    "fever",
    "wheezing",
    "priorCold",
    "chestPain"
];

let hospitalList = [
    "\r\n\r\nMukwaya General Hospital\r\nGgaba Road, Kampala, Uganda\r\n+256 708 459012\r\nOpen 24 Hours",
    "\r\n\r\nKiruddu General Hospital\r\nKampala, Uganda\r\n+256 41 4672315\r\nOpen 24 Hours",
    "\r\n\r\nKomamboga Health Center III\r\nKampala, Uganda\r\n+256 772 332957\r\nOpen 24 Hours"
];

let responseList = [
    "Let's get started! Is your child younger than 5 years of age?",
    "Is your child experiencing fever, like sweating and shaking?",
    "Is your child making wheezing sounds when exhaling?",
    "Did your child have a cold prior to these symptoms?",
    "Is your child experiencing chest pain?"
];

router.post('/sms', async (req, res) => {

    let incomingMessage = new IncomingMessage(req, res);
    let sms = new SMS(req, res);
    let chosenHospital = hospitalList[Math.floor(Math.random() * hospitalList.length)];

    let messageLowercase = incomingMessage.message.toLowerCase();
    let existingPatient = await incomingMessage.existingPatient();

    if ((messageLowercase != "yes" && messageLowercase != "no") && existingPatient) { errorMessage(sms); return; }

    let currentIndex = existingPatient.currentAction;
    let symptom = symptomList[currentIndex-1];
    let response = responseList[currentIndex];

    if (currentIndex == 1 && messageLowercase == "no") {
        sms.send("We're sorry, this service is only available to diagnose children less than 5 years of age.\r\n\r\nIf you would like to go through the questions again, simply text CHILD CARE back to this number. Have a great day!",
            incomingMessage.phone,
            false
        );
        users.collection("patients").deleteOne({phone: incomingMessage.phone});
        return;
    }

    if (!existingPatient) {
        sms.send(responseList[0]);
        return;
    }

    if (currentIndex == responseList.length) {
        //diagnosis
        if (existingPatient.totalScore > 0.5) {
            let probability = existingPatient.totalScore * 100;
            sms.send(`Your diagnosis with ${probability.toFixed(0)}% probability is: pneumonia. We recommend you see your local health professional located at:${chosenHospital}`, incomingMessage.phone, false);
        } else {
            sms.send(`We weren't able to estimate a diagnosis for your child. If you are still concerned about your child's health, please visit your nearest hospital:${chosenHospital}`, incomingMessage.phone, false);
        }

        sms.send("If you would like to go through the questions again, simply text CHILD CARE back to this number. Have a great day!", incomingMessage.phone, false);
        users.collection("patients").deleteOne({phone: incomingMessage.phone});
        return;
    }

    if (messageLowercase == "yes") {
        let score = 1 / responseList.length;
        await users.collection("patients").updateOne({phone: incomingMessage.phone}, {$set: {[symptom]: true}, $inc: {totalScore: score}}, {upsert: true});
    } else if (messageLowercase == "no") {
        await users.collection("patients").updateOne({phone: incomingMessage.phone}, {$set: {[symptom]: false}}, {upsert: true});
    }
    
    sms.send(response);
    incomingMessage.incrementCurrentAction();

});


function errorMessage(sms) {
    sms.send("Oops! That wasn't recognized.");
}


module.exports = router;