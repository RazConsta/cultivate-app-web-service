const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()


async function getWeather() {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather?lat=47.11&lon=-122.11&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    //console.log(data);
    return data;
}

router.get('/', async (request, response) => {
    try {
        const weather = await getWeather();
        
        response.json(weather)[0]
        //response.status(200).send(weather);
    } catch (err) {
        response.status(400).send("Could not retrieve weather info")
    }
})

module.exports = router