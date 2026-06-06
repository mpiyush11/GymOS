const app = require('./src/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`GYMOS V1 Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});