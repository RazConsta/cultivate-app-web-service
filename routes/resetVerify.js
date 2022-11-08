const {response} = require('express')
const {request} = require('express')
const express = require('express')
const open = require('open')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const jwt = require('jsonwebtoken');
const config = {
    secret: process.env.JSON_WEB_TOKEN
}
let path = require('path');

const router = express.Router()
const bodyParser = require("body-parser");
router.use(bodyParser.json());

/**
 * @api {get} /resetVerify Email verification for chaning password.
 * @apiName getResetVerify
 * @apiGroup resetVerify
 * 
 * 
 */
router.get('/', (request, response) => {
    let firstQuery = 'UPDATE members SET verification = 2 WHERE email = $1'
    let values = [request.query.email]
    pool.query(firstQuery, values) 
        .then(result => {
            response.redirect('https://cultivate-app.nicepage.io/Home.html')
        })
        .catch(result => {
            response.status(400).send({
                message: 'other error, see detail',
                detail: error.detail
            })
        })
})

router.get('/success', (request, response) => {
    // response.sendFile(path.join(__dirname + '/verify-thanks.html'));
    // response.sendFile('https://site113379.nicepage.io/Home.html');
    async () => {
        await open('https://cultivate-app.nicepage.io/Home.html');
    }
});

module.exports = router;