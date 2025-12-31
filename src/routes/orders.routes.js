const fs = require('node:fs').promises;
const path = require('node:path');
const sendResponse = require('../utils/sendResponse');
const body_parser = require('../utils/bodyParser');
const parse_url = require('../utils/parseUrl');

async function orders(req, res){
    const {pathname, id} = parse_url(req);
    const orders_path = path.resolve(__dirname, '../../data/orders.json');

    if(req.method === 'GET' && pathname === '/orders'){
        try {
        let orders_arr;

            try {
            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
            orders_arr = [];
            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));
            }
        
            return sendResponse(res, 200, orders_arr);
            
        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'GET' && pathname.startsWith('/orders/') && id){
        try {
            let orders_arr;

            try {
            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
            orders_arr = [];
            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));
        }

        const index = orders_arr.findIndex(order => order.id === id);

        if(index === -1){
            return sendResponse(res, 404, {error: 'Order not found'});
        }

        return sendResponse(res, 200, orders_arr[index]);

        } catch(error){
            return sendResponse(res, 500, {error: 'internal server error'})
        }

    } else if(req.method === 'POST' && pathname === '/orders'){
        const body = await body_parser(req);

        if(!body.title || typeof body.amount !== 'number'
        || body.amount <= 0 || !['pending', 'completed', 'cancelled'].includes(body.status))
        return sendResponse(res, 400, {error: 'Something is missing...'});

        try {
        let orders_arr;

            try {
            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
            orders_arr = [];
            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));
            }

            const order = {
                title: body.title,
                amount: body.amount,
                status: body.status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                id: Date.now().toString()
            }

            orders_arr.push(order);

            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));

            return sendResponse(res, 201, order);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'PUT' && pathname.startsWith('/orders/') && id){
        const body = await body_parser(req);

        if(!body.title || typeof body.amount !== 'number' || body.amount <= 0 
        || !['pending', 'cancelled', 'completed'].includes(body.status)){
            return sendResponse(res, 400, {error: 'Something is missing...'});
        }

        try {
            let orders_arr;

            try {
            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
            orders_arr = [];
            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));

            }

            const index = orders_arr.findIndex(order => order.id === id);

            if(index === -1){
                return sendResponse(res, 404, {error: 'Order not found'});
            }

            orders_arr[index] = {
                title: body.title,
                amount: body.amount,
                status: body.status,
                createdAt: orders_arr[index].createdAt,
                updatedAt: new Date().toISOString(),
                id: id
            }

            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));

            return sendResponse(res, 200, orders_arr[index]);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'PATCH' && pathname.startsWith('/orders/') && id){
        const body = await body_parser(req);

        try {
            let orders_arr;

            try {
            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
            orders_arr = [];
            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));
            }

            const index = orders_arr.findIndex(order => order.id === id);

            if(index === -1){
                return sendResponse(res, 404, {error: 'Order not found'});
            }


            if (body.status !== undefined) {
                if (!['pending', 'completed', 'cancelled'].includes(body.status)) {
                return sendResponse(res, 400, {error: 'Invalid status'});
            }
                orders_arr[index].status = body.status;
            }

            if(body.title !== undefined){ 
                if(body.title.trim() === ''){
                    return sendResponse(res, 400, {error: 'Title is empty'});
                }
                orders_arr[index].title = body.title;
            }

            if(body.amount !== undefined) {
                if(typeof body.amount !== 'number' || body.amount <= 0){
                    return sendResponse(res, 400, {error: 'Invalid amount'});
                }

                orders_arr[index].amount = body.amount
            };

            orders_arr[index].updatedAt = new Date().toISOString();

            await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));

            return sendResponse(res, 200, orders_arr[index]);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'DELETE' && pathname.startsWith('/orders/') && id){
        try {

            let orders_arr;
            try{

            const data = await fs.readFile(orders_path, 'utf-8');
            orders_arr = JSON.parse(data);

            } catch {
                orders_arr = [];
                await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));
            }

        const index = orders_arr.findIndex(order => order.id === id);

        if(index === -1){
            return sendResponse(res, 404, {error: 'Order not found'});
        }

        orders_arr.splice(index, 1);

        await fs.writeFile(orders_path, JSON.stringify(orders_arr, null, 2));

        return sendResponse(res, 204);

        } catch(error){
            return sendResponse(res, 500, {error: 'Intetrnal server error'});
        }

}  else {
        return false;
    }
}

module.exports = orders;