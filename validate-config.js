// Add this to the beginning of server.js to validate configuration on startup
async function validateServerConfiguration() {
    console.log('🔍 VALIDATING SERVER CONFIGURATION');
    console.log('=====================================\n');
    
    let configErrors = [];
    let configWarnings = [];
    
    // Check critical environment variables
    const criticalEnvVars = {
        'MONGODB_URI': process.env.MONGODB_URI,
        'JWT_SECRET': process.env.JWT_SECRET,
        'EMAIL_USER': process.env.EMAIL_USER,
        'ADMIN_EMAIL': process.env.ADMIN_EMAIL
    };
    
    const emailPassword = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    
    console.log('📋 Environment Variables:');
    for (const [key, value] of Object.entries(criticalEnvVars)) {
        if (!value) {
            configErrors.push(`Missing critical environment variable: ${key}`);
            console.log(`❌ ${key}: Missing`);
        } else {
            console.log(`✅ ${key}: Set`);
        }
    }
    
    if (!emailPassword) {
        configErrors.push('Missing EMAIL_PASS or GMAIL_APP_PASSWORD');
        console.log('❌ EMAIL_PASS/GMAIL_APP_PASSWORD: Missing');
    } else {
        console.log('✅ EMAIL_PASS/GMAIL_APP_PASSWORD: Set');
    }
    
    // Check if email password is still the placeholder
    if (emailPassword === 'your-gmail-app-password-here') {
        configErrors.push('EMAIL_PASS is still set to placeholder value');
        console.log('❌ EMAIL_PASS contains placeholder value');
    }
    
    console.log('');
    
    // Test database connection
    console.log('💾 Database Connection:');
    try {
        await require('mongoose').connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ MongoDB connection successful');
    } catch (dbError) {
        configErrors.push(`Database connection failed: ${dbError.message}`);
        console.log('❌ MongoDB connection failed:', dbError.message);
    }
    
    console.log('');
    
    // Test email service
    console.log('📧 Email Service:');
    try {
        const emailService = require('./services/emailService');
        // Give email service time to initialize
        setTimeout(async () => {
            try {
                const emailTest = await emailService.testEmailConfig();
                if (emailTest) {
                    console.log('✅ Email service configuration valid');
                } else {
                    configWarnings.push('Email service configuration may have issues');
                    console.log('⚠️ Email service configuration needs attention');
                }
            } catch (emailError) {
                configWarnings.push(`Email service test failed: ${emailError.message}`);
                console.log('⚠️ Email service test failed:', emailError.message);
            }
        }, 2000);
    } catch (error) {
        configErrors.push(`Email service initialization failed: ${error.message}`);
        console.log('❌ Email service initialization failed:', error.message);
    }
    
    console.log('');
    
    // Check file structure
    console.log('📁 File Structure:');
    const requiredFiles = [
        './models/Booking.js',
        './services/emailService.js',
        './chatbot/chatbotService.js',
        './chatbot/chatbotRoutes.js',
        './routes/bookingRoutes.js'
    ];
    
    for (const file of requiredFiles) {
        try {
            require.resolve(file);
            console.log(`✅ ${file}: Found`);
        } catch (error) {
            configErrors.push(`Missing required file: ${file}`);
            console.log(`❌ ${file}: Missing`);
        }
    }
    
    console.log('');
    
    // Display results
    console.log('📊 CONFIGURATION SUMMARY:');
    console.log('==========================');
    
    if (configErrors.length === 0) {
        console.log('✅ All critical configurations are valid!');
    } else {
        console.log(`❌ Found ${configErrors.length} critical configuration error(s):`);
        configErrors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }
    
    if (configWarnings.length > 0) {
        console.log(`⚠️ Found ${configWarnings.length} warning(s):`);
        configWarnings.forEach((warning, index) => {
            console.log(`   ${index + 1}. ${warning}`);
        });
    }
    
    console.log('');
    
    if (configErrors.length > 0) {
        console.log('🚨 CRITICAL ERRORS DETECTED - Server may not function properly!');
        console.log('Please fix the above errors before proceeding.\n');
    } else {
        console.log('🎉 Configuration validation completed successfully!');
        console.log('Server is ready to handle bookings and send emails.\n');
    }
    
    return {
        hasErrors: configErrors.length > 0,
        hasWarnings: configWarnings.length > 0,
        errors: configErrors,
        warnings: configWarnings
    };
}

module.exports = validateServerConfiguration;
