//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const nodemailer = require('nodemailer')
const sendEmail = require('../utilities').sendEmail

const router = express.Router()

router.post('/', (request, response, next) => {
    const email = request.body.email
    const password = request.body.password
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(email) 
        && isStringProvided(password)) {
        
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = 'UPDATE members SET verification = 1 WHERE email = $1'
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                //stash the memberid into the request object to be used in the next function
                // request.memberid = q_res.rows[0].memberid
                //next()
                let idQuery = 'SELECT memberid FROM members WHERE email= $1'
                let idQueryValue = [email]
                pool.query(idQuery, idQueryValue)
                    .then(result => {
                        request.memberid = result.rows[0];
                        next()
                    })
                    .catch((error) => {
                        response.status(400).send({
                            message: "Error in memberid SELECT",
                            detail: error.detail
                        })
                    })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Error in first UPDATE",
                    detail: error.detail
                })
            })
    } 
}, (request, response) => {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = generateSalt(32)
        let salted_hash = generateHash(request.body.password, salt)

        //let theQuery = "INSERT INTO CREDENTIALS(MemberId, SaltedHash, Salt) VALUES ($1, $2, $3)"
        let theQuery = "UPDATE credentials SET saltedhash = $2 WHERE memberid = $1";
        let values = [request.memberid, salted_hash, salt]
        pool.query(theQuery, values)
            .then(result => {
                //We successfully added the user!
                response.status(201).send({
                    success: true,
                    email: request.body.email
                })
                let secondQuery = "UPDATE credentials SET salt = $3 WHERE memberid = $1";
                pool.query(secondQuery, values)
                    .then(result => {
                        //We successfully added the user!
                        response.status(201).send({
                        success: true,
                        email: request.body.email
                        })
                    .catch(result => {
                        response.status(400).send({
                            message: 'Error line 75',
                            detail: error.detail
                        })
                    })
                })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Error line 66",
                    detail: error.detail
                })
            })
})

module.exports = router