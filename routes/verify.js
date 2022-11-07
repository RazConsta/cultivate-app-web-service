const {response} = require('express')
const {request} = require('express')
const express = require('express')

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
 * @api {get} /verify Email verification.
 * @apiName getVerify
 * @apiGroup verify
 * 
 * ADD MORE
 */
router.get('/', (request, response) => {
    let firstQuery = 'SELECT * FROM members WHERE email = $1 AND verification = 0'
    let values = [request.query.email]
    pool.query(firstQuery, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: 'User not found',
                    detail: error.detail
                })
                return
            }
            let secondQuery = 'UPDATE members SET verification = 1 WHERE email = $1'
            pool.query(secondQuery, values) 
                .then(result => {
                    response.redirect('https://cultivate-app-web-service.herokuapp.com/verify/success')
                })
                .catch(result => {
                    response.status(400).send({
                        message: 'other error, see detail',
                        detail: error.detail
                    })
                })
        })
        .catch((error) => {
            response.status(400).send({
                message: "Email already verified"
            })
        })
})

router.get('/success', (request, response) => {
    response.sendFile(path.join(__dirname + '/verify-thanks.html'));
});

module.exports = router;