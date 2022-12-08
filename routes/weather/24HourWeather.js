const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()

async function getWeather(long, lat) {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + long + '&cnt=8&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    return data;
}

/**
 * @api {get} /24HourWeather Request for 24hrs of weather info
 * @apiName Get24HourWeather
 * @apiGroup Weather
 */ 
router.post('/', async (request, response) => {

    getWeather(request.body.longitude, request.body.latitude)
        .then((weather) => {
            //get the time zone from the weather data
            let secondsFromUTC = weather.city.timezone;
            let hoursFromUTC = secondsFromUTC / 3600;
            
            console.log(hoursFromUTC);
            console.log(weather);
            let weatherArray = {};
            let i = 0;
            weather.list.forEach((day) => {
                console.log(day);
                //store each weather temperature, conditions and time in an array
                let temp = Math.round(day.main.temp);
                console.log(temp);
                let conditions = day.weather[0].main;
                //get only the time from the date
                let time = day.dt_txt.split(' ')[1];                
                
                //Turn the time into an integer and add am or pm
                let timeInt = parseInt(time);
                time -= hoursFromUTC;
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

                let dayObj = [temp, conditions, time];


                let hour = 'hour' + (i + 1);
                weatherArray[hour] = dayObj;
                i++;

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