const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express')
const router = express.Router()
require('dotenv').config()

async function getWeather() {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?lat=47.11&lon=-122.11&cnt=38&units=imperial&appid=' + process.env.WEATHER_API_KEY
    const request = await fetch(WEATHER_API_URL);
    const data = request.json();
    return data;
}

router.get('/', async (request, response) => {

    getWeather()
        .then((weather) => {
            console.log(weather);
            //iterate through the weather list
            let forecast = new Map();
            weather.list.forEach((day) => {
                //console.log(time);
                let temp = Math.round(day.main.temp);

                //get the day of the week based on the date
                let date = new Date("" + day.dt_txt.split(" ")[0]);
                let dayOfWeek = date.getDay() + 1;
                let dayOfWeekString = "";
                switch(dayOfWeek) {
                    case 0:
                        dayOfWeekString = "Sun";
                        break;
                    case 1:
                        dayOfWeekString = "Mon";
                        break;

                    case 2:
                        dayOfWeekString = "Tues";
                        break;

                    case 3:
                        dayOfWeekString = "Wed";
                        break;

                    case 4:
                        dayOfWeekString = "Thurs";
                        break;

                    case 5:
                        dayOfWeekString = "Fri";
                        break;

                    case 6:
                        dayOfWeekString = "Sat";
                        break;
                    case 7:
                        dayOfWeekString = "Sun";
                        break;
                }


                //update the map if the high temp is higher than the current high temp or if the low temp is lower than the current low temp
                if(forecast.has(dayOfWeekString)) {
                    if(forecast.get(dayOfWeekString)[0] < temp) {
                        forecast.set(dayOfWeekString, [temp, forecast.get(dayOfWeekString)[1]]);
                    }
                    if(forecast.get(dayOfWeekString)[1] > temp) {
                        forecast.set(dayOfWeekString, [forecast.get(dayOfWeekString)[0], temp]);
                    }   

                } else {
                    forecast.set(dayOfWeekString, [temp, temp]);
                }                    
            })

            //print the map
            for (let [key, value] of forecast) {
                console.log(key + " = " + value);
            }

            //make a new map with the key as a value and day1, day2, etc. as the key
            let newForecast = new Map();
            let i = 1;
            for (let [key, value] of forecast) {
                value.push(key);
                newForecast.set("day" + i, value);
                i++;
            }
            //turn the map into a json object
            let json = {};
            for (let [key, value] of newForecast) {
                json[key] = value;
            }


            response.json(json);

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