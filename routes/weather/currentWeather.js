const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()

//create an async function to get current weather that takes in lat and long parameters
async function getCurrentWeather(long, lat) {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&cnt=10&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    return data;
}

/**
 * @api {get} /currentWeather Request for current weather info
 * @apiName GetCurrentWeather
 * @apiGroup Weather
 */ 
router.get('/', async (request, response) => {
    getCurrentWeather(request.body.longitude, request.body.latitude)
        .then((weather) => {
            //Retrieve temp and conditions
            const result = 
                {
                    temperature: weather.main.temp, //Temperature
                    conditions: weather.weather[0].main //Conditions
                }

            console.log(result);
            response.json(result);
        })
        .catch((error) => {
            console.error(error);
            response.status(400).json({
                msg:"Could not retrieve current weather info",
                error
            })
        });
})
module.exports = router