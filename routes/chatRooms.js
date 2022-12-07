//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const middleware = require("../middleware")

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

/**
 * @api {get} /chats Request to get all chats the user is in and the email of the owner
 * @apiName GetChats
 * @apiGroup Chats
 *
 * @apiHeader {String} memberid memberid of the user
 *
 * @apiSuccess (Success 200) {JSONObject[]} success true when retrieving all chats for user
 *
 * @apiError (400: Unknown user) {String} message "unknown email address"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 *
 * @apiUse JSONError
 */
 router.get(
    "/get-chats",
    middleware.checkToken,
    (request, response, next) => {
        console.log(request.decoded.memberid);
        if (isNaN(request.decoded.memberid)) {
            response.status(400).send({
                message: "Missing memberid",
            });
        } else {
            next();
        }
    },
    (request, response) => {
        let query =
            "SELECT CHATS.NAME, CHATS.CHATID, MEMBERS.EMAIL AS OWNER FROM CHATMEMBERS INNER JOIN CHATS ON CHATMEMBERS.CHATID = CHATS.CHATID INNER JOIN MEMBERS ON MEMBERS.MEMBERID = CHATS.OWNER WHERE CHATMEMBERS.MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.send(result.rows);
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    }
);

module.exports = router