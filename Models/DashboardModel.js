/**
 * Dashboard Model
 *
 */

const logger = require('../Helpers/logHelper').getLogger(__filename);
const redis = require("redis");
const redisClient = redis.createClient();


/**
 * Redis Error Handler
 *
 */
redisClient.on("error", function (err) {
    logger.error('Redis request failed');
    logger.error(err);

});

/**
 * getDashboardConnections
 *
 * Get all the connections associated with the passed dashboard
 *
 * @param dashboardID
 * @return {Promise<*>}
 */
exports.getDashboardConnections = async function (dashboardID) {
    return new Promise((resolve, reject) => {
        logger.info('Calling Redis for connections registered to dashboard');

        redisClient.smembers(dashboardID, (err, redisResponse) => {
            if (err) {
                logger.error('Failing in calling redis');
                logger.error(err);

                return reject(new Error('Redis request failed'));
            }

            logger.info(`Received ${redisResponse.length} dashboards connections from redis`);
            return resolve(redisResponse);

        });
    });
};

/**
 * attachConnectionToDashboard
 *
 * Attach a connection to a dashboard
 *
 * @param connectionID
 * @param dashboardID
 * @return {Promise<*>}
 */
exports.attachConnectionToDashboard = async function (connectionID, dashboardID) {
    return new Promise((resolve, reject) => {
        logger.info('Calling Redis to add new Connection to dashboard');

        redisClient.sadd(dashboardID, connectionID, (err, redisResponse) => {
            if (err) {
                logger.error('Failed to put new connectionID to a dashboard in Redis');

                return reject(new Error('Error putting new Connection to dashboard'));
            }

            logger.info('Completed put of new connection to dashboard');
            return resolve();

        });
    });
};

/**
 * detachConnectionFromDashboard
 *
 * Removes a connection from a dashboard with the passed dashboardID
 *
 * @param connectionID      string
 * @param dashboardID       string
 * @return {Promise<*>}
 */
exports.detachConnectionFromDashboard = async function (connectionID, dashboardID) {
    return new Promise((resolve, reject) => {
        logger.info('requesting connection removal from supplied dashboard');

        redisClient.srem(dashboardID, connectionID, (err, redisResponse) => {
            if (err) {
                logger.error('Error in calling redis to SPOP a connection from the dashboard');
                logger.error(err);

                return reject(new Error('Failed to remove connection from dashboard'));
            }

            logger.info('Successfully removed connectionID from dashboard');

            return resolve();

        })
    });
};


/**
 * userHasDashboardAccess
 *
 * Returns boolean dictating a user has access to a dashboard
 * if a trustedJWT Payload is not supplied then a check against the
 * user database will be performed.
 *
 * @param userID                string
 * @param dashboardID           string
 * @param truestedJWTPayload optional  jwt payload object
 * @returns hasAccess           boolean
 */
exports.userHasDashboardAccess = function (userID, dashboardID, truestedJWTPayload = {}) {
    console.error('userHasDashboardAccess CHECK NOT IMPLEMENTED YET!');
    return true;

};


module.exports = exports;