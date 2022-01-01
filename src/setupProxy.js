const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(
        createProxyMiddleware('/nuggets', {
            target: 'http://localhost:8080',
            changeOrigin: true,
            logLevel: "debug",
            headers: {
                Connection: "keep-alive"
            }
        })
    );
}