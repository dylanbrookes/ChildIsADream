const IncomingMessage = require('./IncomingMessage');
const credentials = require('../credentials.json');
const client = require('twilio')(credentials.twilio.accountSid, credentials.twilio.authToken);

class SMS extends IncomingMessage {
    constructor(req, res) {
        super(req, res);
        console.log('SMS class initialized');
    }

    send(message, to=this.phone, replyMsg=true) {

        let result = new Promise((resolve, reject) => {
            let body;

            if (replyMsg) body = `👼 Child Is A Dream\r\n${message}\r\n(reply YES or NO)`;
            else body = `👼 Child Is A Dream\r\n${message}`;

            client.messages
            .create({
               body,
               from: this.outboundServiceNumber,
               to
             })
            .then(_ => {
                console.log(`SMS sent to ${this.phone}: ${message}`);
                resolve("success");
            })
            .catch((e) => {
                console.log(`Message failed to send: ${e}`);
                resolve(`failure`);
            });
        }).catch((e) => console.log(e));

        return result;
    }
}

module.exports = SMS;