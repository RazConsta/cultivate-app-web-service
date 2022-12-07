/**
 * Returns the current friends list for a given user.
 * Reference: https://github.com/TCSS450-Team7-MobileApp/team7-webservice
 */

//express is the framework we're going to use to handle requests
const { response } = require('express');
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
 * NOTE: THIS QUERY DOES NOT REQUIRE AUTHORIZATION
 *
 * @api {put} /friendsList/delete/:memberid? Remove a friend from friend's list
 * @apiName deleteFriends
 * @apiGroup Friends
 *
 * @apiParam {String} MemberA the memberid of the Member requesting deletion
 * @apiParam {String} MemberB the memberid of the user being deleted from MemberA's friendsList
 *
 * @apiDescription a query to delete a friend from friendsList
 *
 * @apiSuccess (200) {String} decoded jwt
 *
 *  @apiError (404: memberid not found) {String} message "memberid not found"
 *
 * NOTE: To use this query, the URL should be BASE_URL/friendsList/delete/:memberida?/:memberidb?
 * where :memberid? is the current user. The app should pass in the body the memberid of the user to be removed.
 */
router.delete(
    '/delete/:chatid',
    middleware.checkToken,
    (request, response, next) => {
        let query = `delete from chats where chatid=$1`;
        let values = [request.params.chatid];

        pool.query(query, values)
        .then((result) => {
                next()
        })
        .catch((err) => {
            console.log('error deleting: ' + err);
                response.status(400).send({
                    message: 'Error deleting chat room from chatid'
            });
        });
    },
    (request, response) => {
        let query = `delete from messages where chatid=$1`;
        let values = [request.params.chatid];

        pool.query(query, values)
        .then((result) => {
            response.status(200)
            .send({
                message: jwt.decoded
            })
        })
        .catch((err) => {
            console.log('error deleting: ' + err);
                response.status(400).send({
                    message: 'Error deleting chat room from chatid'
            });
        });
    });

module.exports = router;