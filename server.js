const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const database = require('./src/models/database');

// Import routes
const collegeRoutes = require('./src/routes/colleges');
const eventRoutes = require('./src/routes/events');
const studentRoutes = require('./src/routes/students');
const reportRoutes = require('./src/routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files
// Serve React build files for production
app.use('/admin', express.static(path.join(__dirname, 'frontend/admin-portal/build')));
app.use('/student', express.static(path.join(__dirname, 'frontend/student-app/build')));

// Fallback for development - serve development files
app.use('/admin-dev', express.static(path.join(__dirname, 'frontend/admin')));
app.use('/student-dev', express.static(path.join(__dirname, 'frontend/student')));
app.use('/shared', express.static(path.join(__dirname, 'frontend/shared')));

// Default route to admin portal
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// React app routes - serve index.html for client-side routing
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/admin-portal/build', 'index.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/student-app/build', 'index.html'));
});

// API Routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);

// Legacy API routes (v1)
app.use('/api/v1/colleges', collegeRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Campus Event Management Platform API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API documentation endpoint
app.get('/api/v1', (req, res) => {
    res.json({
        message: 'Campus Event Management Platform API',
        version: '1.0.0',
        endpoints: {
            colleges: '/api/v1/colleges',
            events: '/api/v1/events',
            students: '/api/v1/students',
            reports: '/api/v1/reports'
        },
        documentation: {
            health_check: '/health',
            sample_data: '/api/v1/sample-data'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        available_routes: [
            '/api/v1/colleges',
            '/api/v1/events',
            '/api/v1/students',
            '/api/v1/reports',
            '/health'
        ]
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await database.connect();
        console.log('Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`🚀 Campus Event Management Platform API running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
            console.log(`🎓 Ready to manage campus events!`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    try {
        await database.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;
