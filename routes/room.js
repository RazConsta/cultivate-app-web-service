/**
 * Returns the current friends list for a given user.
 * Reference: https://github.com/TCSS450-Team7-MobileApp/team7-webservice
 */

//express is the framework we're going to use to handle requests
const { response, query } = require('express');
const express = require('express');
const { CLIENT_MULTI_RESULTS } = require('mysql/lib/protocol/constants/client');

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool;

// Define the middleware
const middleware = require('../middleware');
const jwt = require('../middleware/jwt');

const validation = require('../utilities/exports').validation;
let isStringProvided = validation.isStringProvided;
const msg_functions = require('../utilities/exports').messaging

const router = express.Router();

/**
 * @api {get} /friendsList/:memberid/:verified Display existing OR pending friends in database.
 * @apiName GetFriends
 * @apiGroup Friends
 *
 * @apiDescription Request a list of all current friends or friend requests from the server
 * with a given memberId. If no friends, should still return an empty list.
 *
 * @apiParam {Number} memberId the userId to get the friends list from.
 * @apiParam {Number} verified to return either verified or friend requests.
 *
 * @apiSuccess {Number} friendsCount the number of friends returned.
 * @apiSuccess {Object[]} friendsList the list of friends in the friends table.
 * @apiSuccess {Number} rowCount the number of rows returned
 *
 * @apiError (404: userId not found) {String} message "no memberid request sent!"
 * @apiError (400: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/friendsList/MemberID/VERIFIED
 */
router.get(
    '/:memberid',
    (request, response, next) => {
        // validate memberid of user requesting friends list
        if (request.params.memberid === undefined) {
            response.status(400).send({
                message: 'no memberid request sent!',
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        // validate that the memberid exists
        let query = `SELECT * FROM Credentials WHERE MemberID=$1`;
        let values = [request.params.memberid];

        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((error) => {
                response.status(400).send({
                    message: 'SQL Error',
                    error: error,
                });
            });
    },
    (request, response) => {
        let query = `SELECT * FROM chats INNER JOIN messages ON chats.chatid=messages.chatid WHERE messages.memberid=$1 ORDER BY primarykey DESC`;
        let values = [request.params.memberid];

        pool.query(query, values)
            .then((result) => {
                response.send({
                    userId: request.params.memberid,
                    rowCount: result.rowCount,
                    rows: result.rows,
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: 'SQL Error',
                    error: err,
                });
            });
    }
);

/**
 * @api {post} /room/:memberid/:verified Display existing OR pending friends in database.
 * @apiName GetFriends
 * @apiGroup Friends
 *
 * @apiDescription Request a list of all current friends or friend requests from the server
 * with a given memberId. If no friends, should still return an empty list.
 *
 * @apiParam {Number} memberId the userId to get the friends list from.
 * @apiParam {Number} verified to return either verified or friend requests.
 *
 * @apiSuccess {Number} friendsCount the number of friends returned.
 * @apiSuccess {Object[]} friendsList the list of friends in the friends table.
 * @apiSuccess {Number} rowCount the number of rows returned
 *
 * @apiError (404: userId not found) {String} message "no memberid request sent!"
 * @apiError (401: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/friendsList/MemberID/VERIFIED
 */
router.post("/:name?", (request, response, next) => {
    if(!isStringProvided(request.body.name)) {
        response.status(400).send({
            message: "Missing required information!"
        })
    } else {
        next()
    }
}, (request, response) => {
    let query = `insert into chats (name) values ($1) returning chatid`
    let values = [request.body.name]

    pool.query(query, values)
    .then(result => {
        response.send({
            success: true,
            chatid: result.rows[0].chatid
        })
    }).catch((err) => {
        response.status(401).send({
            message: "SQL Error!",
            error: err
        })
    })
})

module.exports = router;