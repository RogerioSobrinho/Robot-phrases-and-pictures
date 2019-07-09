const readline = require('readline-sync');
const state = require('./state');

function robot() {
    const content = {};
    content.searchTerm = askAndReturnSearchTerm();
    state.save(content);
    function askAndReturnSearchTerm() {
        return readline.question('Author (Enter for Random Author): ')
    }
}

module.exports = robot;