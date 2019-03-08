/**
 * WebSocket Router
 *
 * Early prototype stage. Put connection (socket) ID's to redis for a given dashboard and
 * pull it back for the broadcast. This is in place of using the built in "Rooms" feature of
 * socketio so that thsi can be later ported to AWS serverless.
 *
 */

const logger = require('../Helpers/logHelper').getLogger(__filename);
const config = require('../config');
const DashboardModel = require('../Models/DashboardModel');

const socketioJWT = require('socketio-jwt');


const wsIndexRouter = function (socketIO) {


    // Ensure that there is reasonable content to the JWT signing key
    if (!config.JWTSigningKey || config.JWTSigningKey.length < 5) {
        logger.error('Minimal JWTSigningKey requirements not met');
        logger.error('This is a fatal error');
        logger.error('Aborting');
        process.exit(1);

    }

    socketIO.sockets
        .on('connection', socketioJWT.authorize({
            secret: config.JWTSigningKey,
            timeout: 15000 // 15 seconds to send the authentication message
        })).on('authenticated', async function (socket) {
        const trustedPayload = socket.decoded_token;
        logger.info(`Socket successfully authenticated, userID: ${trustedPayload.userID}`);


        // socketIO.emit('dash', { send: 'to all from server' });
        // socket.broadcast.to(id).emit('my message', msg);

        socket.on('updateDash', async function (payload) {
            logger.info('updateDash websocket resource called');

            // Put the latest config to the database
            // TODO: Persist the dashboard structure outside of redis...


            // Update all of the subscribed connections

            const dashboardConnections = await DashboardModel.getDashboardConnections(payload.dashboardID);

            for (let connectionID of dashboardConnections) {

                if (socketIO.sockets.sockets[connectionID]) {
                    socket.broadcast.to(connectionID).emit('dash', payload);

                } else {
                    // Connection is no longer open, remove this connection from the dash
                    logger.info('Attempted to send down a closed connection');
                    logger.info('Requesting removal of connection from active dashboard');

                    await DashboardModel.detachConnectionFromDashboard(connectionID, 'dash1');

                }
            }

        });

        socket.on('getDash', async function (payload) {
            logger.info('getDash websocket resource called');

            // const dashboardConnections = await getDashboardConnections('dash1');
            //
            // for (let connectionID of dashboardConnections) {
            //
            //     if (socketIO.sockets.sockets[connectionID]) {
            //         socket.broadcast.to(connectionID).emit('dash', !!);
            //
            //     } else {
            //         // Connection is no longer open, remove this connection from the dash
            //         logger.info('Attempted to send down a closed connection');
            //         logger.info('Requesting removal of connection from active dashboard');
            //
            //         await detachConnectionFromDashboard(connectionID, 'dash1');
            //
            //     }
            // }

            // TODO: Implement getDash path
            logger.error('Called getDash path not implemented');

        });


        socket.on('registerToDashboard', async function (payload) {
            logger.info('Request received to register to a dashboard');

            // Basic Validation
            if (!payload.dashboardID) {
                logger.error('No dashboardID supplied, cannot register to dashboard');
                logger.error('Dropping invalid request');

            } else {

                logger.info(`userID: ${trustedPayload.userID} has requested to be registered to dashboardID: ${payload.dashboardID}`);

                if (DashboardModel.userHasDashboardAccess(trustedPayload.userID, payload.dashboardID, trustedPayload)) {
                    try {
                        await DashboardModel.attachConnectionToDashboard(socket.id, payload.dashboardID);
                        logger.info('Attached connection to dashboard successfully');


                    } catch (err) {
                        logger.error('Call failed to register socket to a dashboard');
                        logger.error(err);

                    }

                } else {
                    logger.error(`userID: ${trustedPayload.userID} does not have rights to access the requested dashboard`);
                    logger.error(`Dropping request to unauthorised resource`);


                }
            }
        });

        socket.on('disconnect', (reason) => {
            logger.info('A connection disconnected');
            logger.info(`Disconnect reason: ${reason}`);

        });


    });
};


module.exports = wsIndexRouter;