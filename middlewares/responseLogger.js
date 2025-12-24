const logger = require('../utils/logger');

/**
 * Middleware to intercept responses and log based on content
 */
const responseLogger = (req, res, next) => {
    const originalJson = res.json;
    const originalSend = res.send;

    function handleLog(body, statusCode) {
        try {
            // Parse body if it's a string and looks like JSON
            let parsedBody = body;
            if (typeof body === 'string') {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    // not json, ignore
                }
            }

            // Check for 'result: false' or 'success: false' pattern
            if (
                (parsedBody && parsedBody.result === false) ||
                (parsedBody && parsedBody.success === false)
            ) {
                logger.warn(
                    `[${req.method}] ${req.originalUrl} - Response: ${JSON.stringify(
                        parsedBody
                    )} - Status: ${statusCode}`
                );
            }

            // Log 5xx errors
            if (statusCode >= 500) {
                logger.error(
                    `[${req.method}] ${req.originalUrl} - Server Error - Status: ${statusCode} - Body: ${JSON.stringify(
                        parsedBody
                    )}`
                );
            }
        } catch (err) {
            console.error('Logging middleware error:', err);
        }
    }

    res.json = function (body) {
        handleLog(body, res.statusCode);
        return originalJson.call(this, body);
    };

    res.send = function (body) {
        handleLog(body, res.statusCode);
        return originalSend.call(this, body);
    };

    next();
};

module.exports = responseLogger;
