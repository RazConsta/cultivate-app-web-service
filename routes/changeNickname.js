//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const validation = require('../../utilities/exports').validation
let isStringProvided = validation.isStringProvided

const router = express.Router()

/**
 * @api {post} /resetPassword Request to change the password
 * @apiName PostResetPassword
 * @apiGroup ResetPassword
 * 
 * @apiHeader {String} authorization "username:password" uses Basic Auth 
 * 
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} message "Authentication successful!""
 * @apiSuccess {String} token JSON Web Token
 * 
 */ 
router.post('/', (request, response) => {
    const email = request.body.email;
    const newNickname = request.body.newNickname;
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(email)
       && isStringProvided(newNickname)) {
        pool.query('UPDATE members SET nickname = $1 WHERE email= $2', [newNickname, email])
            .then(result => {
                
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Error in nickname UPDATE",
                    detail: error.detail
                })
            })
    } 
})

module.exports = router