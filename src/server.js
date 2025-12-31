require('dotenv').config();
const http = require('node:http');
const orders = require('./routes/orders.routes');
const products = require('./routes/products.routes');
const users = require('./routes/users.routes');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    Promise.resolve(users(req, res))
    .then(resolved => resolved || products(req, res))
    .then(resolved => resolved || orders(req, res))
    .then(resolved => {
        if(!resolved){
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
    })
    .catch(() => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Internal server error' }));
    });
});

server.listen(PORT, () => {
    console.log('server is running...');
}); 