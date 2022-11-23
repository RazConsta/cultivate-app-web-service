const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()

async function getWeather() {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?lat=47.11&lon=-122.11&cnt=8&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    return data;
}

/**
 * @api {get} /24HourWeather Request for 24hrs of weather info
 * @apiName Get24HourWeather
 * @apiGroup Weather
 */ 
router.get('/', async (request, response) => {

    getWeather()
        .then((weather) => {
            console.log(weather);
            let weatherArray = {};

            weather.list.forEach((day) => {
                //store each weather temperature, conditions and time in an array
                let temp = Math.round(day.main.temp);
                let conditions = day.weather[0].main;
                //get only the time from the date
                let time = day.dt_txt.split(' ')[1];
                
                //Turn the time into an integer and add am or pm
                let timeInt = parseInt(time);
                let ampm = 'am';
                if (timeInt == 0) {
                    timeInt = 12;
                    ampm = 'am';
                } else if (timeInt > 12) {
                    timeInt -= 12;
                    ampm = 'pm';
                } else if (timeInt == 12 && ampm == 'am') {
                    ampm = 'pm';
                } 

                time = timeInt + ampm;

                //create a new object for each day
                let dayObj = {
                    temp: temp,
                    conditions: conditions,
                    time: time
                }

                //add object to weather json
                weatherArray[time] = dayObj;

            })

            //send the weather array to the client
            response.status(200).send(weatherArray);
        })

        .catch((error) => {
            console.error(error);
            response.status(400).json({
                msg:"Could not retrieve 24 hour weather info",
                error
            })
        });
})
module.exports = router