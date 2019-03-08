/**
 * WebSocket Router
 *
 * Early prototype stage. Put connection (socket) ID's to redis for a given dashboard and
 * pull it back for the broadcast. This is in place of using the built in "Rooms" feature of
 * socketio so that thsi can be later ported to AWS serverless.
 *
 */
const redis = require("redis");
const redisClient = redis.createClient();
const logger = require('../Helpers/logHelper').getLogger(__filename);

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
async function getDashboardConnections(dashboardID) {
    return new Promise((resolve, reject) => {
        logger.info('Calling Redis for connections registered to dashboard');

        redisClient.smembers(dashboardID, (err, redisResponse) => {
            if (err) {
                logger.error('Failing in calling redis');
                logger.error(err);

                return reject(new Error('Redis request failed'));
            }

            logger.info('Received dashboards connections from redis');
            return resolve(redisResponse);

        });
    });
}

/**
 * attachConnectionToDashboard
 *
 * Attach a connection to a dashboard
 *
 * @param connectionID
 * @param dashboardID
 * @return {Promise<*>}
 */
async function attachConnectionToDashboard(connectionID, dashboardID) {
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
}

async function detachConnectionFromDashboard(connectionID, dashboardID) {
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
}

const wsIndexRouter = function (socketIO) {

    socketIO.on('connection', function (socket) {
        console.log('a user connected');

        // uncaught promise...
        attachConnectionToDashboard(socket.id, 'dash1');

        // socketIO.emit('dash', { send: 'to all from server' });
        // socket.broadcast.to(id).emit('my message', msg);

        socket.on('updateDash', async function (payload) {
            logger.info('updateDash websocket resource called');

            const dashboardConnections = await getDashboardConnections('dash1');

            for (let connectionID of dashboardConnections) {

                if (socketIO.sockets.sockets[connectionID]){
                    socket.broadcast.to(connectionID).emit('dash', payload);

                } else {
                    // Connection is no longer open, remove this connection from the dash
                    logger.info('Attempted to send down a closed connection');
                    logger.info('Requesting removal of connection from active dashboard');

                    await detachConnectionFromDashboard(connectionID, 'dash1');

                }
            }

        });

        socket.on('registerToDashboard', async function (payload) {
            logger.info('Request received to register to a dashboard');

            try {
                await attachConnectionToDashboard(socket.id, 'dash1');

            } catch (err) {
                logger.error('Call failed to register socket to a dashboard');
                logger.error(err);

            }

        });

        socket.on('disconnect', (reason) => {
            console.log('A disconnect event was found...');
            console.error('Need some handling here...')

        });


    });


};


module.exports = wsIndexRouter;