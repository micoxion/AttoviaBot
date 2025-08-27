const fs = require("node:fs")

const logFilePath = 'application.log';

exports.logToFile = function logToFile(message) {
    const Timestamp = new Date().toISOString();
    const logEntry = `${Timestamp} - ${message}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file: ', err);
        }
    });
}