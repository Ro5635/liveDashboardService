/**
 * Index Router
 *
 * Handles the root path of the API
 */

const express = require('express');
const router = express.Router();
const logger = require('../Helpers/logHelper').getLogger(__filename);
const apiVersion = require('../package').version;


router.get('/', function (req, res, next) {
    logger.debug('Responding to caller with API name and version');
    return res.sendResponse(200, {msg: 'Service API', version: apiVersion});

});


module.exports = router;
