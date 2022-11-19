//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const validation = require('../utilities/exports').validation
let isStringProvided = validation.isStringProvided

const router = express.Router()

router.get('/', async (request, response) => {
    const email = request.body.email;
    if(isStringProvided(email)) 
    pool.query('SELECT nickname FROM members WHERE email= $1', [email])
        .then((result) => {
            result.email = request.rows[0].nickname;
        })
        .catch((error) => {
            console.error(error);
            response.status(400).json({
                msg:"Could not retrieve nickname",
                error
            })
        });
})

module.exports = router