/**
 * Master configuration file
 *
 * Parameters in defaultConfig can be overridden in the environment specific declarations
 */

const env = process.env.NODE_ENV;

const defaultConfig = {
    AWS_API_CONFIG: {region: "local", endpoint: 'http://localhost:8000'}
};

const dev = {
    JWTSigningKey: process.env.JWTSigningKey

};

const test = {};

const prod = {
    JWTSigningKey: process.env.JWTSigningKey
};

const config = {
    dev,
    test,
    prod
};

const currentConfig = Object.assign(defaultConfig, config[env]);

module.exports = currentConfig;