const fs = require("fs");
const os = require("os");
const path = require("path");

const args = process.argv;
console.log(args);

const envFilePath = path.resolve(__dirname, args[2]);

// read .env file & convert to array
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);

/**
 * Finds the key in .env files and returns the corresponding value
 *
 * @param {string} key Key to find
 * @returns {string|null} Value of the key
 */
const getEnvValue = (key) => {
    // find the line that contains the key (exact match)
    const matchedLine = readEnvVars().find((line) => line.split("=")[0] === key);
    // split the line (delimiter is '=') and return the item at index 2
    return matchedLine !== undefined ? matchedLine.split("=")[1] : null;
};

/**
 * Updates value for existing key or creates a new key=value line
 *
 * This function is a modified version of https://stackoverflow.com/a/65001580/3153583
 *
 * @param {string} key Key to update/insert
 * @param {string} value Value to update/insert
 */
const setEnvValue = (key, value) => {
    const envVars = readEnvVars();
    const targetLine = envVars.find((line) => line.split("=")[0] === key);
    if (targetLine !== undefined) {
        // update existing line
        const targetLineIndex = envVars.indexOf(targetLine);
        // replace the key/value with the new value
        envVars.splice(targetLineIndex, 1, `${key}=${value}`);
    } else {
        // create new key value
        envVars.push(`${key}=${value}`);
    }
    // write everything back to the file system
    fs.writeFileSync(envFilePath, envVars.join(os.EOL));
};

// examples
let date_time = new Date();
// get current date
// adjust 0 before single digit date
let date = ("0" + date_time.getDate()).slice(-2);

// get current month
let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

// get current year
let year = date_time.getFullYear();

// get current hours
let hours = date_time.getHours().toString();
if (hours.length === 1) {
    hours = '0' + hours;
}

// get current minutes
let minutes = date_time.getMinutes().toString();
if (minutes.length === 1) {
    minutes = '0' + minutes;
}

// get current seconds
let seconds = date_time.getSeconds().toString();
if (seconds.length === 1) {
    seconds = '0' + seconds;
}
setEnvValue('REACT_APP_BUILD_DATE_TIME', year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds);
