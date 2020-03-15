const database = require('../database');
const users = database.userDatabase();

class IncomingMessage {
    constructor(req, res) {
        let data = req.body;

        this.phone = data.From;
        this.message = data.Body;
        this.city = data.FromCity;
        this.country = data.FromCountry;
        this.state = data.FromState;
        this.outboundServiceNumber = data.To;
    }

    async existingPatient() {
        let patient = await users.collection("patients").findOne({phone: this.phone});
        if (!patient) {
            console.log(`Patient with phone number ${this.phone} is a new patient`);
            users.collection("patients").insertOne({
                phone: this.phone,
                city: this.city,
                state: this.state,
                country: this.country,
                currentAction: 1,
                dateContacted: Date.now()
            });
            return false;
        }

        return patient;
    }

    incrementCurrentAction() {
        users.collection("patients").updateOne({phone: this.phone}, {$inc: {currentAction: 1}});
    }
}


module.exports = IncomingMessage;