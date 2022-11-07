const express = require('express')
//Access the connection to Heroku Database
const pool = require('../utilities').pool
const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided
const nodemailer = require('nodemailer');
const { eventNames } = require('npm');
const router = express.Router();

const mailTransporter = nodemailer.createTransport({
    service: "hotmail",
    auth: { // TODO: read user and pass from .env file
        user: "cultivate-app@outlook.com",
        pass: "kfdsvj2354!@!!__fds"
    },
    // tls required to bypass "self signed certificate" error
    tls: {
        rejectUnauthorized: false
    }
});

const mailOptions = {
    from: "cultivate-app@outlook.com",
    to: "razvanc@uw.edu",
    subject: "Your Cultivate email verification",
    html: 'Thank you for joining Cultivate!' +  
    '<br><br>' + 
    'Press <a href=https://cultivate-app-web-service/verify/${email}> here </a>' + 
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

/* exports.mailOptions = options;
exports.mailTransporter = transporter; */

module.exports = { 
    mailOptions, mailTransporter
}