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

router.get('/:random',
    (request, response, next) => {
        // validate memberid of user requesting friends list
        if (!isStringProvided(request.params.random)) {
            response.status(401).send({
                message: 'no tablename request sent!',
            });
        } else {
            next();
        }
    }
    , (request, response) => {
        let query = `select * from chosen where not memberid=$1`;
        let values = [request.params.random];

        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    message: "success",
                    rows: result.rows,
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: 'SQL query not apply',
                    error: err,
                });
            });
    }
);

router.post(
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
    (request, response) => {
        let query = `insert into chosen(memberid, firstname, chatid, message) values($1, $2, 0, 'Hi! you are invited to a chat room!')`;
        let values = [request.params.memberid, request.body.firstname];

        pool.query(query, values)
            .then(
                response.status(200).send({
                    message: "success",
                })
            )
            .catch((err) => {
                response.status(400).send({
                    message: 'SQL Error',
                    error: err,
                });
            });
    }
);

router.delete(
    '/delete/:nickname',
    (request, response, next) => {
        if (request.params.nickname === undefined) {
            response.status(400).send({
                message: 'no memberid request sent!',
            });
        } else {
            next();
        }
    },
    (request, response) => {
        let query = `DELETE FROM chosen WHERE firstname=$1`;
        let values = [request.params.nickname];

        pool.query(query, values)
            .then((result) => {
                response.status(200)
                    .send({
                        message: "success"
                    })
            })
            .catch((err) => {
                console.log('error deleting: ' + err);
                response.status(400).send({
                    message: 'Error deleting user from chosen table'
                });
            });
    });





module.exports = router;