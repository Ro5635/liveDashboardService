/**
 * Index Router
 *
 * Handles the root path of the API
 */

const express = require('express');
const router = express.Router();
const logger = require('../Helpers/LogHelper').getLogger(__filename);
const apiVersion = require('../package').version;


router.get('/', function (req, res, next) {
    logger.debug('Responding to caller with API name and version');
    return res.sendResponse(200, {msg: 'Service API', version: apiVersion});

});

router.post('/:roomName', function (req, res, next) {
    const roomName = req.params.roomName;
    const message = req.body.message;

    logger.debug(`roomName called as ${roomName} and message: ${message}`);

    req.socketio;

    return res.sendResponse(200, {msg: 'RoomRequest Hit'});

});

module.exports = router;
