/**
 * ResponseMiddleware
 *
 * Places sendResponse function on the Express res object, this adds additional logging
 */
const logger = require('../Helpers/logHelper').getLogger(__filename);

/**
 * sendResponseFactory
 *
 * Creates a sendResponse function that uses the passed express res object
 *
 * @param res                   Express res object
 * @return {Function}           sendResponse Function
 */
function sendResponseFactory(res) {

    return (statusCode, payload) => {
        logger.debug('Sending HTTP response');
        logger.debug(`StatusCode: ${statusCode}`);


        if (payload) {
            logger.debug(`Payload: ${JSON.stringify(payload)}`);
            return res.status(statusCode).send(payload);
        }

        return res.status(statusCode).send(payload);
    }
}


exports.addSendResponseToRes = (req, res, next) => {
    res.sendResponse = sendResponseFactory(res);

    next();
};

module.exports = exports;