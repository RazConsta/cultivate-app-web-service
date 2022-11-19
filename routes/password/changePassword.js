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
        pool.query('SELECT memberid FROM members WHERE email= $1', [email])
            .then(result => {
                request.memberid = result.rows[0].memberid;
                // Check old password
                const checkQuery = `SELECT saltedhash, salt, Credentials.memberid FROM Credentials
                      INNER JOIN Members ON
                      Credentials.memberid=Members.memberid 
                      WHERE Members.email=$1`
                pool.query(checkQuery, [email])
                    .then(result => {
                        //Retrieve the salt used to create the salted-hash provided from the DB
                        let salt = result.rows[0].salt
            
                        //Retrieve the salted-hash password provided from the DB
                        let storedSaltedHash = result.rows[0].saltedhash 

                        //Generate a hash based on the stored salt and the provided password
                        let providedSaltedHash = generateHash(oldPassword, salt)

                        if (storedSaltedHash === providedSaltedHash) {
                            next();
                        } 
                    })
                    .catch((error) => {
                        response.status(400).send({
                            message: "Error in old password check",
                            detail: error.detail
                        })
                    })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Error in memberid SELECT",
                    detail: error.detail
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
                    message: "error @ new pass insert",
                    detail: error.detail
                })
            });
});

module.exports = router