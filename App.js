// This file tells Expo where to find the app
// It redirects to the frontend directory

// Set environment variable for Expo to find the app
process.env.EXPO_ROUTER_APP_ROOT = './frontend/app';

// Import the frontend app
module.exports = require('./frontend/app/_layout');
