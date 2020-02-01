module.exports = {
    PORT: process.env.PORT || 8000,
    CLIENT_ORIGIN: 'https://plan-it.now.sh',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/planit',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    // API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"
};