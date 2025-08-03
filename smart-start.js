#!/usr/bin/env node

console.log('🚀 Vila Falo - Smart Startup Script');
console.log('===================================');

const { spawn } = require('child_process');
const http = require('http');

// Function to check if port is available
function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        
        server.listen(port, () => {
            server.close();
            resolve(true);
        });
        
        server.on('error', () => {
            resolve(false);
        });
    });
}

// Function to test URL
function testUrl(url) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

// Main startup function
async function startApp() {
    console.log('\n🔍 Pre-flight checks...');
    
    // Check if port 5000 is available
    const portAvailable = await checkPort(5000);
    if (!portAvailable) {
        console.log('⚠️  Port 5000 is busy. Trying to kill existing processes...');
        
        try {
            spawn('pkill', ['-f', 'node.*server'], { stdio: 'inherit' });
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.log('   Could not kill processes automatically');
        }
        
        const nowAvailable = await checkPort(5000);
        if (!nowAvailable) {
            console.log('❌ Port 5000 still busy. Try: pkill -f node');
            process.exit(1);
        }
    }
    
    console.log('✅ Port 5000 is available');
    
    // Start the test server first
    console.log('\n🧪 Starting test server...');
    
    const testServer = spawn('node', ['test-server.js'], {
        stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let testServerOutput = '';
    testServer.stdout.on('data', (data) => {
        testServerOutput += data.toString();
        process.stdout.write(data);
    });
    
    testServer.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test the test server
    console.log('\n🔗 Testing basic connectivity...');
    const testWorking = await testUrl('http://localhost:5000/test');
    
    if (testWorking) {
        console.log('✅ Basic server is working!');
        
        // Kill test server
        testServer.kill();
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start the full server
        console.log('\n🚀 Starting full Vila Falo server...');
        
        const fullServer = spawn('node', ['server.js'], {
            stdio: 'inherit'
        });
        
        // Handle shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down server...');
            fullServer.kill();
            process.exit(0);
        });
        
        // Wait for full server to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test full server
        const fullWorking = await testUrl('http://localhost:5000/health');
        
        if (fullWorking) {
            console.log('\n🎉 SUCCESS! Vila Falo is running!');
            console.log('🌐 Your app is available at:');
            console.log('   Client Site: http://localhost:5000');
            console.log('   Admin Panel: http://localhost:5000/admin');
            console.log('   Health Check: http://localhost:5000/health');
            console.log('\n👤 Admin Login:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('\n🛑 Press Ctrl+C to stop the server');
        } else {
            console.log('⚠️  Server started but not responding correctly');
            console.log('   Try manually: npm run dev');
        }
        
    } else {
        console.log('❌ Test server failed. Checking issues...');
        testServer.kill();
        
        // Run diagnostics
        console.log('\n🔧 Running diagnostics...');
        const diagnostics = spawn('node', ['debug-routes.js'], { stdio: 'inherit' });
        
        diagnostics.on('close', (code) => {
            if (code === 0) {
                console.log('\n💡 Try running manually:');
                console.log('   npm run debug-routes');
                console.log('   npm run dev');
            }
        });
    }
}

// Run the startup script
startApp().catch(error => {
    console.error('❌ Startup failed:', error.message);
    console.log('\n💡 Manual recovery steps:');
    console.log('   1. npm run debug-routes');
    console.log('   2. npm run test-server');
    console.log('   3. npm run dev');
    process.exit(1);
});
