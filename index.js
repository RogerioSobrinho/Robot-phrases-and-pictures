const robots = {
    input: require('./robots/input'),
    scrapping: require('./robots/scrapping'),
    image: require('./robots/image')
}

async function start() {
    robots.input();
    await robots.scrapping();
    await robots.image();
}
  
start()