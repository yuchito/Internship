const Message = require('../models/message');

formatMessage = function(str) {
    pid = str.split('PID');
    pid = pid[1];
    pid = pid.split('|');

    message = new Message("", false, true, '', (pid[2].split('^')[3]).toLowerCase(), (pid[3].split('^')[3]).toLowerCase(), true);
    return message;
}
module.exports = formatMessage;