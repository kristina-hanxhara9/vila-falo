const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Production-ready connection options
        const options = {
            // Basic connection options
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
            // Connection pool settings
            maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            
            // Timeout settings
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 10000, // 10 seconds
            
            // Heartbeat settings
            heartbeatFrequencyMS: 10000,
            
            // Buffer settings
            bufferMaxEntries: 0,
            bufferCommands: false,
            
            // Retry settings
            retryWrites: true,
            retryReads: true,
            
            // Read preference
            readPreference: 'primary',
            
            // Application name for monitoring
            appName: 'vila-falo-resort'
        };

        // Enhanced connection with error handling
        console.log('🔄 Connecting to MongoDB...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`✅ MongoDB Connected Successfully`);
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`🗄️  Database: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState}`);
        
        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB connected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('📴 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

        return conn;
        
    } catch (error) {
        console.error('❌ Database connection failed:', {
            message: error.message,
            code: error.code,
            codeName: error.codeName,
            timestamp: new Date().toISOString()
        });
        
        // In production, we want to retry rather than crash immediately
        if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Production mode: Will retry connection...');
            throw error; // Let the calling function handle retries
        } else {
            console.log('💥 Development mode: Exiting on database failure');
            process.exit(1);
        }
    }
};

// Helper function to check connection status
const checkConnection = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
    };
    
    return {
        state: state,
        status: states[state] || 'unknown',
        isConnected: state === 1,
        host: mongoose.connection.host,
        name: mongoose.connection.name
    };
};

// Function to safely close connection
const closeConnection = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('📴 MongoDB connection closed safely');
        }
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
        throw error;
    }
};

module.exports = {
    connectDB,
    checkConnection,
    closeConnection
};