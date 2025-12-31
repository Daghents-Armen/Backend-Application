const fs = require('node:fs').promises;
const path = require('node:path');
const body_parser = require('../utils/bodyParser');
const parse_url = require('../utils/parseUrl');
const sendResponse = require('../utils/sendResponse');

async function products(req, res){
    const {pathname, id} = parse_url(req);
    const products_path = path.resolve(__dirname, '../../data/products.json')

    if(req.method === 'GET' && pathname === '/products'){
       
        try {
        let products_arr;

            try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);      

            } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

            }

            return sendResponse(res, 200, products_arr);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'GET' && pathname.startsWith('/products/') && id){
        try {
        let products_arr;

            try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);

            } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

            }

            const index = products_arr.findIndex(prod => prod.id === id);

            if(index === -1){
                return sendResponse(res, 404, {error: 'Product not found'})
            }

            return sendResponse(res, 200, products_arr[index]);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'POST' && pathname === '/products'){
        const body = await body_parser(req);

        if(!body.title || typeof body.price !== 'number' 
        || body.price <= 0 || typeof body.inStock !== 'boolean'){
        return sendResponse(res, 400, {error: 'Something is missing...'})    
        }

        try {
        let products_arr;

            try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);

            } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

            }

            const product = {
            title: body.title,
            price: body.price,
            inStock: body.inStock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: Date.now().toString()
            }

            products_arr.push(product);

            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

            return sendResponse(res, 201, product);

        } catch(error){
        return sendResponse(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'PUT' && pathname.startsWith('/products/') && id){
        const body = await body_parser(req);

        if(!body.title || typeof body.price !== 'number' 
        || body.price <= 0 || typeof body.inStock !== 'boolean'){
        return sendResponse(res, 400, {error: 'Something is missing...'})    
        }

        try {
        let products_arr;

            try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);

            } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2))
            }

            const index = products_arr.findIndex(prod => prod.id === id);

            if(index === -1){
                return sendResponse(res, 404, {error: 'Product not found'});
            }

            products_arr[index] = {
                title: body.title,
                price: body.price,
                inStock: body.inStock,
                createdAt: products_arr[index].createdAt,
                updatedAt: new Date().toISOString(),
                id: id
            };

            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2))

            return sendResponse(res, 200, products_arr[index]);

        } catch(error){
            return sendResponse(res, 500, {error: 'Internal server error'});
        }
    } else if(req.method === 'PATCH' && pathname.startsWith('/products/') && id){
         try {
        const body = await body_parser(req);

        let products_arr;

        try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);
        } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));
        }

        const index = products_arr.findIndex(prod => prod.id === id);

        if (index === -1) {
            return sendResponse(res, 404, { error: 'Product not found' });
        }

        if (body.title !== undefined) {
            if (body.title.trim() === '' || typeof body.title !== 'string') {
                return sendResponse(res, 400, { error: 'title is empty' });
            }
            products_arr[index].title = body.title;
        }

        if (body.price !== undefined) {
            if (typeof body.price !== 'number' || body.price <= 0) {
                return sendResponse(res, 400, { error: 'invalid price' });
            }
            products_arr[index].price = body.price;
        }

        if (body.inStock !== undefined) {
            if (typeof body.inStock !== 'boolean') {
                return sendResponse(res, 400, { error: 'invalid inStock' });
            }
            products_arr[index].inStock = body.inStock;
        }

        products_arr[index].updatedAt = new Date().toISOString();

        await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

        return sendResponse(res, 200, products_arr[index]);

    } catch (error) {
        return sendResponse(res, 500, { error: 'Internal server error' });
    }
    } else if(req.method === 'DELETE' && pathname.startsWith('/products/') && id){
        try {
        let products_arr;

        try {
            const data = await fs.readFile(products_path, 'utf-8');
            products_arr = JSON.parse(data);
        } catch {
            products_arr = [];
            await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));
        }

        const index = products_arr.findIndex(prod => prod.id === id);

        if (index === -1) {
            return sendResponse(res, 404, { error: 'Product not found' });
        }

        products_arr.splice(index, 1);

        await fs.writeFile(products_path, JSON.stringify(products_arr, null, 2));

        return sendResponse(res, 204);
        
    } catch (error) {
        return sendResponse(res, 500, { error: 'Internal server error' });
    }
    } else {
        return false;
    }
}

module.exports = products;