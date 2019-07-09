const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state')
const gm = require('gm').subClass({ imageMagick: true });

const googleSearchCredentials = require('../credentials/google-search.json')


async function robot() {
    console.log('> [image-robot] Starting...');
    const content = state.load();

    await fetchGoogleAndReturnImagesLinks(content.author);
    const options = {
        url: `${content.imageUrl}`,
        dest: `./content/0-original.png`
    }
    await downloadAndSave(options);
    await createImageFromSentence();

    state.save(content);

    async function fetchGoogleAndReturnImagesLinks(searchTerm) {
        console.log(`> [image-robot] Search Term in Google Images with: "${searchTerm}"`);
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: searchTerm,
            searchType: 'image',
            // imgSize: 'huge',
            num: 1 //Default
        })
        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })

        content.imageUrl = imagesUrl;
    }

    async function downloadAndSave(options) {
        console.log(`> [image-robot] Save image ${options.url} in path ${options.dest}`);
        return imageDownloader.image(options);
    }

    async function createImageFromSentence() {
        return new Promise((resolve, reject) => {
            console.log(`> [image-robot] Creating image from sentence...`);
            const inputFile = "./content/0-original.png[0]";
            const outputFile = "./content/0-converted.png";

            gm()
                .in(inputFile)
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'black')
                    .out('-resize', '1080x1080')
                .out(')')
                .out('(')
                    .out('-size', '700x600')
                    .out('-gravity', 'center')
                    .out('-background', 'transparent')
                    .out('-fill', 'white')
                    .out('-font', 'white')
                    .out('-box', 'rgba(0, 0, 0, 0.22)')
                    .autoOrient()
                    .out('-kerning', '-1')
                    .out(`caption: "${content.phrase}" - ${content.author}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log(`> [video-robot] Image converted: ${outputFile}`)
                    resolve()
                })
        });
    }
}

module.exports = robot;