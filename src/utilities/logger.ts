import fs from "node:fs";

const logFilePath = 'application.log';

export function logToFile(message: string) {
    const Timestamp = new Date().toISOString();
    const logEntry = `${Timestamp} - ${message}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file: ', err);
        }
    });
}