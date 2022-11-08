//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const validation = require('../utilities/exports').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities/exports').generateHash
const generateSalt = require('../utilities/exports').generateSalt

const nodemailer = require('nodemailer')
const sendEmail = require('../utilities/exports').sendEmail

const router = express.Router()

router.get('/', (request, response) => {
    const email = request.body.email
    
    
    if(isStringProvided(email)) {
        
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = "SELECT * FROM members WHERE email=$1 AND verification=1"
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                response.status(201).send({
                    success: true,
                    email: request.body.email
                })
                //stash the memberid into the request object to be used in the next function
                const transporter = nodemailer.createTransport({
                    service: "hotmail",
                    auth: { // TODO: read user and pass from .env file
                        user: process.env.EMAIL, 
                        pass: process.env.PASSWORD
                    },
                    // tls required to bypass "self signed certificate" error
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                
                const options = {
                    from: "cultivate-app@outlook.com",
                    to: request.body.email,
                    subject: "Your Cultivate email verification",
                    html: 'Thank you for joining Cultivate!' +  
                    '<br><br>' + 
                    `Press <a href=https://cultivate-app-web-service.herokuapp.com/verifyReset?email=${request.body.email}>here</a>` + 
                    ' to verify your email.' +
                    '<br><br>' +
                    'Best regards,' + 
                    '<br>' +
                    'The Cultivate Team'
                }
                
                transporter.sendMail(options, function(err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Sent: " + info.response);
                })
            })
            .catch((error) => {
                
            })
    }
})

module.exports = router