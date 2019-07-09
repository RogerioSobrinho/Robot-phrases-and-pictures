const cheerio = require('cheerio');
const request = require('request');
const state = require('./state');
const url = "https://www.pensador.com";

async function robot() {
    console.log('> [scrapping-robot] Starting...');
    const content = state.load();

    if(!content.searchTerm) {
        await getBodyByHome();
    } else {
        await getBodyByAuthor(content.searchTerm);
    }
    state.save(content);

    async function getBodyByAuthor(autor = "") {
        return new Promise(async (resolve, reject) => {
            autor = autor.replace(' ', '_');
            await request(`${url}/autor/${url}`, async function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return reject(err);
                }

                await getAndSaveRandomPhrases(cheerio.load(body))
                return resolve();
            });
        })
    }

    async function getBodyByHome() {
        return new Promise(async (resolve, reject) => {
            await request(url, async function optionalCallback(err, httpResponse, body) {

                if (err) {
                    return reject(err);
                }

                await getAndSaveRandomPhrases(cheerio.load(body))
                return resolve();
            });
        })
    }

    async function getAndSaveRandomPhrases($) {
        console.log('> [scrapping-robot] Get and Save Phrases...');
        let phrases = new Map();

        $('.thought-card').each(function () {
            const phrase = $(this).find('p.frase').text().trim();
            const autor = $(this).find('span.autor').text().replace('\n', '').trim();
            phrases.set(autor, phrase);
        });

        console.log('> [scrapping-robot] Random phrases...');
        const randomKey = getRandomKey(phrases);
        content.phrase = phrases.get(randomKey);
        content.author = randomKey;
    }

    function getRandomKey(collection) {
        let keys = Array.from(collection.keys());
        return keys[Math.floor(Math.random() * keys.length)];
    }
}
module.exports = robot