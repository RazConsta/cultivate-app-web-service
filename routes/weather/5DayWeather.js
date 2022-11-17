const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()

async function getWeather() {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?lat=47.11&lon=-122.11&cnt=40&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    return data;
}

router.get('/', async (request, response) => {

    getWeather()
        .then((weather) => {
  
            const res = {

                day1: {
                    weather: weather.list[0].dt_txt,
                    temp: weather.list[0].main.temp,
                    conditions: weather.list[0].weather[0].main
                },
                day2: {
                    weather: weather.list[7].dt_txt,
                    temp: weather.list[7].main.temp,
                    conditions: weather.list[7].weather[0].main
                },
                day3: {
                    weather: weather.list[15].dt_txt,
                    temp: weather.list[15].main.temp,
                    conditions: weather.list[15].weather[0].main
                },
                day4: {
                    weather: weather.list[23].dt_txt,
                    temp: weather.list[23].main.temp,
                    conditions: weather.list[23].weather[0].main
                },
                day5: {
                    weather: weather.list[31].dt_txt,
                    temp: weather.list[31].main.temp,
                    conditions: weather.list[31].weather[0].main
                }
            }

            console.log(res);

            response.json(res);
        })
        .catch((error) => {
            console.error(error);
            response.status(400).json({
                msg:"Could not retrieve weather info",
                error
            })
        });
})
module.exports = router