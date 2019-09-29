class Message {
    constructor(type, sent, received, date, externalsystem, facility, ackNack) {
        this.type = type;
        this.sent = sent;
        this.date = date;
        this.externalsystem = externalsystem;
        this.facility = facility;
        this.received = received;
        this.ackNack = ackNack
    }
}

module.exports = Message;