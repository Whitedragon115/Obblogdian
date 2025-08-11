const colors = {
    gray: '\x1b[90m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    purple: '\x1b[35m',
    white: '\x1b[97m',

    backgroundGray: '\x1b[100m',
    backgroundRed: '\x1b[41m',
    backgroundYellow: '\x1b[43m',
    backgroundGreen: '\x1b[42m',
    backgroundBlue: '\x1b[44m',
    backgroundCyan: '\x1b[46m',
    backgroundPurple: '\x1b[45m',
    backgroundWhite: '\x1b[107m',

    reset: '\x1b[0m',
    bold: '\x1b[1m',
    faint: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
};

// Logging Color

function successLog(message) {
    console.log(`${colors.bold}${colors.green}✅ ${message}${colors.reset}`);
}

function errorLog(message) {
    console.log(`${colors.bold}${colors.red}❌ ${message}${colors.reset}`);
}

function warningLog(message) {
    console.log(`${colors.bold}${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function infoLog(message) {
    console.log(`${colors.bold}${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function noteLog(message) {
    console.log(`${colors.bold}${colors.gray}📝 ${message}${colors.reset}`);
}

function textLog(message) {
    console.log(`${colors.bold}${colors.white}${message}${colors.reset}`);
}

// Line

function grayline() {
    console.log(colors.gray + '-'.repeat(50) + colors.reset);
}

function whiteline() {
    console.log(colors.white + '-'.repeat(50) + colors.reset);
}

function whitedoubleline() {
    console.log(colors.white + '='.repeat(50) + colors.reset);
}

// Table

function logTable(data) {
    const maxLength = [];

    for (const dt of data) {
        for (const item of dt) {
            const length = item.toString().length;
            if (!maxLength[dt.indexOf(item)]) maxLength.push(0);
            if (length > maxLength[dt.indexOf(item)]) {
                maxLength[dt.indexOf(item)] = length;
            }
        }
    }

    const separator = '+-' + maxLength.map(len => '-'.repeat(len)).join('-+-') + '-+';
    const headerRow = '| ' + data[0].map((item, index) => item.toString().padEnd(maxLength[index])).join(' | ') + ' |';

    console.log(separator);
    console.log(headerRow);
    console.log(separator);
    for (let i = 1; i < data.length; i++) {
        const row = '| ' + data[i].map((item, index) => item.toString().padEnd(maxLength[index])).join(' | ') + ' |';
        console.log(row);
    }
    console.log(separator);
}

// Loader

function loader(message, duration) {
    const frames = [
        "▰▱▱▱▱▱▱",
        "▰▰▱▱▱▱▱",
        "▰▰▰▱▱▱▱",
        "▰▰▰▰▱▱▱",
        "▰▰▰▰▰▱▱",
        "▰▰▰▰▰▰▱",
        "▰▰▰▰▰▰▰",
        "▱▰▰▰▰▰▰",
        "▱▱▰▰▰▰▰",
        "▱▱▱▰▰▰▰",
        "▱▱▱▱▰▰▰",
        "▱▱▱▱▱▰▰",
        "▱▱▱▱▱▱▰",
        "▱▱▱▱▱▰▰",
        "▱▱▱▱▰▰▰",
        "▱▱▱▰▰▰▰",
        "▱▱▰▰▰▰▰",
        "▱▰▰▰▰▰▰",
        "▰▰▰▰▰▰▰",
        "▰▰▰▰▰▰▱",
        "▰▰▰▰▰▱▱",
        "▰▰▰▰▱▱▱",
        "▰▰▰▱▱▱▱",
        "▰▰▱▱▱▱▱",
    ]
    let i = 0;

    const interval = setInterval(() => {
        process.stdout.write(`\r${colors.cyan}${frames[i]} ${message}${colors.reset}`);
        i = (i + 1) % frames.length;
    }, 50);

    setTimeout(() => {
        clearInterval(interval);
        process.stdout.write(`\r${colors.green}✅ ${message} 完成!${colors.reset}\n`);
    }, duration);
}

module.exports = {
    successLog,
    errorLog,
    warningLog,
    infoLog,
    noteLog,
    textLog,
    colors,
    grayline,
    whiteline,
    whitedoubleline,
    logTable,
    loader
};
