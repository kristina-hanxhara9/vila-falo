// Request logging and body debugging middleware
const requestLogger = (req, res, next) => {
    // Log every request for debugging
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📥 ${req.method} ${req.url}`);
    console.log(`${'='.repeat(80)}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Body Type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log(`${'='.repeat(80)}\n`);
    next();
};

module.exports = requestLogger;
