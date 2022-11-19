//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../../utilities/exports').pool

const validation = require('../../utilities/exports').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../../utilities/exports').generateHash
const generateSalt = require('../../utilities/exports').generateSalt

const nodemailer = require('nodemailer')
const sendEmail = require('../../utilities/exports').sendEmail

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
// 1) Use email to find memberid
// 2) Check old password
// 3) Update new password
router.post('/', (request, response, next) => {
    const email = request.body.email;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(oldPassword) 
        && isStringProvided(newPassword)
        && isStringProvided(email)) {
        




        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = 'UPDATE members SET verification = 1 WHERE verification = 2 AND email = $1'
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                //stash the memberid into the request object to be used in the next function
                // request.memberid = q_res.rows[0].memberid
                //next()
                if (result.rowCount == 0) {
                    response.status(400).send({
                        message: "Verify your email before submitting the new password",
                        detail: error.detail
                    })
                    return;
                }
                let idQuery = 'SELECT memberid FROM members WHERE email= $1'
                pool.query(idQuery, values)
                    .then(result => {
                        request.memberid = result.rows[0].memberid;
                        next()
                    })
                    .catch((error) => {
                        response.status(400).send({
                            message: "Error in memberid SELECT",
                            detail: error.detail
                        })
                    })
            })
    } 
    // DELETE CREDENTIALS ROW AND ADD A NEW ROW
}, (request, response) => {
        let salt = generateSalt(32)
        let salted_hash = generateHash(request.body.newPassword, salt)

        let deleteQuery = "DELETE FROM credentials WHERE memberid=$1";
        let deleteQueryValues = [request.memberid]
        pool.query(deleteQuery, deleteQueryValues)
            .then(result => {
            })
            .catch((error) => {
                response.status(400).send({
                    message: "error line 61",
                    detail: error.detail
                })
            });

        let insertQuery = "INSERT INTO CREDENTIALS(MemberId, SaltedHash, Salt) VALUES ($1, $2, $3)"
        let insertValues = [request.memberid, salted_hash, salt]
        pool.query(insertQuery, insertValues)
            .then(result => {
                // successfully changed password
                response.status(201).send({
                    success: true,
                    email: request.body.email
                })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "error line 73",
                    detail: error.detail
                })
            });
});

module.exports = router