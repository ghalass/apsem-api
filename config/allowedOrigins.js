// allowedOrigins.js
require('dotenv').config();

const allowedOrigins = [
    'http://localhost:4000',      // Local API
    'http://localhost:5173',      // Local React dev server
    'https://app1.ghalass.com',   // Production frontend
    'https://api1.ghalass.com',   // Add your API domain if needed for web access
    "*",
    "http://localhost:3000",
    'https://apsem-v3-client.ghalass.com',
];

module.exports = allowedOrigins;
