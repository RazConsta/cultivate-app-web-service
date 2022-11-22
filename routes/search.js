/**
 * Returns the current profile of a given user.
 * routes: GET /:email? to search an unfriended user by Email address
 * routes: GET /:nickname? to display a friend by Nickname.
 * Reference: https://github.com/TCSS450-Team7-MobileApp/team7-webservice
 */

//express is the framework we're going to use to handle requests
const express = require('express');

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool;

const validation = require('../utilities/exports').validation;
let isStringProvided = validation.isStringProvided;

const jwt = require('../middleware/jwt')

const router = express.Router();


/**
 * @api {get} searched?  search for user with searched details 
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiDescription Search for user by nickname, first name, last name: Query to return a user's first, last, and nick name by email.
 *
 * @apiParam {String} searched the searched detail.
 *
 * @apiSuccess {Object} the profile returned.
 * @apiSuccess {Number} rowCount the number of users found if > 1 it exists and if 0 it doesn't;
 *
 * @apiError (404: userId not found) {String} message "userId not found"
 * @apiError (400: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/search/SEARCHED
 */
 router.get(
    '/:searched',
    jwt.checkToken,
    (request, response) => {
        // Search for User
        let query = `SELECT DISTINCT firstname, lastname, nickname, memberid as id, email 
        FROM members FULL JOIN Contacts ON members.memberid = Contacts.memberid_A 
        WHERE nickname ILIKE $1 AND members.memberiD != $2`
        let values = [request.params.searched+'%', request.decoded.memberid];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount==0) {
                    response.status(200).send({
                        message: 'No results found!'
                    })
                } else {
                    response.status(200).send({
                        rows: result.rows,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                response.status(400).send({
                    result: 'ERROR',
                    error: err,
                });
            });
    }
);


/**
 * @api {get} email/email:?  search for an existing user by email address.
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiDescription Search for user by email: Query to return a user's first, last, and nick name by email.
 *
 * @apiParam {String} email the email to retrieve the profile from.
 *
 * @apiSuccess {Object} the profile returned.
 * @apiSuccess {Number} rowCount the number of users found (should always be 1 for found, 0 for does not exist);
 *
 * @apiError (404: userId not found) {String} message "userId not found"
 * @apiError (400: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/search/email/EMAIL
 */
router.get(
    '/emai/:email?',
    (request, response, next) => {
        // validate userId of user requesting friends list
        if (request.params.email === undefined) {
            response.status(400).send({
                message: 'no email request sent!',
            });
        } else {
            next();
        }
    },
    (request, response) => {
        // Search for User by Email
        let query = `SELECT firstname, lastname, nickname, memberid, email FROM members WHERE email=$1`;
        let values = [request.params.email];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount==0) {
                    response.status(200).send({
                        message: 'No results found!'
                    })
                } else {
                    response.status(200).send({
                        rows: result.rows,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                response.status(400).send({
                    result: 'ERROR',
                    error: err,
                });
            });
    }
);

/**
 * @api {get} /nickname/nickname:?  search for an existing user by nickname.
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiDescription Search for user by nickname: Query to return a user's first, last, and email by nickname.
 *
 * @apiParam {String} nickname the nickname to retrieve the profile from.
 *
 * @apiSuccess {Object} the profile returned.
 * @apiSuccess {Number} rowCount the number of users found (should always be 1 for found, 0 for does not exist);
 *
 * @apiError (404: userId not found) {String} message "userId not found"
 * @apiError (400: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/search/nickname/NICKNAME
 */
 router.get(
    '/nickname/:nickname?',
    (request, response, next) => {
        // validate userId of user requesting friends list
        if (request.params.nickname === undefined) {
            response.status(400).send({
                message: 'no nickname request sent!',
            });
        } else {
            next();
        }
    },
    (request, response) => {
        // Search for User by Nickname
        let query = `SELECT firstname, lastname, nickname, email, memberid FROM members WHERE nickname=$1`;
        let values = [request.params.nickname];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount==0) {
                    response.status(200).send({
                        message: 'No results found!'
                    })
                } else {
                    response.status(200).send({
                        rows: result.rows,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                response.status(400).send({
                    result: 'ERROR',
                    error: err,
                });
            });
    }
);

/**
 * @api {get} /name/nickname:?  search for an existing user by nickname.
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiDescription Search for user by nickname: Query to return a user's first, last, and email by nickname.
 *
 * @apiParam {String} nickname the nickname to retrieve the profile from.
 *
 * @apiSuccess {Object} the profile returned.
 * @apiSuccess {Number} rowCount the number of users found (should always be 1 for found, 0 for does not exist);
 *
 * @apiError (404: userId not found) {String} message "userId not found"
 * @apiError (400: SQL Error) {String} the reported SQL error details
 *
 * Call this query with BASE_URL/search/name/first/last
 */
 router.get(
    '/:first/:last',
    (request, response, next) => {
        // validate userId of user requesting friends list
        if (request.params.first === undefined || request.params.last === undefined) {
            response.status(400).send({
                message: 'missing a name request!',
            });
        } else {
            next();
        }
    },
    (request, response) => {
        // Search for User by First and Last
        let query = `SELECT email, nickname, lastname, firstname, memberid FROM members WHERE firstname=$1 OR lastname=$2`;
        let values = [request.params.first, request.params.last];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount==0) {
                    response.status(200).send({
                        message: 'No results found!'
                    })
                } else {
                    response.status(200).send({
                        rows: result.rows,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                response.status(400).send({
                    result: 'ERROR',
                    error: err,
                });
            });
    }
);

module.exports = router;
