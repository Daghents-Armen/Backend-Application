const fs = require('node:fs').promises;
const path = require('node:path');
const parse_url = require('../utils/parseUrl');
const send_response = require('../utils/sendResponse');
const bodyParser = require('../utils/bodyParser');

async function users(req, res){
    const {pathname, id} = parse_url(req);
    const user_path = path.resolve(__dirname, '../../data/users.json');
        
    if(req.method === 'GET' && pathname === '/users'){
        try {
        let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
            users_arr = [];
            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));
        }

        return send_response(res, 200, users_arr);

        } catch(error){
            return send_response(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'GET' && pathname.startsWith('/users/') && id){
        try {
            let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
            users_arr = [];
            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            }

            const index = users_arr.findIndex(user => user.id === id);

            if(index === -1){
                return send_response(res, 404, {error: 'User not found'});
            }

            return send_response(res, 200, users_arr[index]);

        } catch(error){
            return send_response(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'POST' && pathname === '/users'){
        const body = await bodyParser(req); 

        if(!body.name || !body.role || !body.email){
            return send_response(res, 400, {error: 'Something is missing...'});
        }

        try {
            let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
            users_arr = [];
            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            }

            const user = {
                name: body.name,
                email: body.email,
                role: body.role,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            users_arr.push(user);

            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            return send_response(res, 201, user)
        } catch(error){
            return send_response(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'PUT' && pathname.startsWith('/users/') && id){
        const body = await bodyParser(req);

        if(!body.name || !body.role || !body.email){
            return send_response(res, 404, {error: 'Something is missing...'});
        }

        try {
            let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
                users_arr = [];
                await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));
            }

            const email_check = users_arr.some(user => user.email === body.email && user.id !== id);
            
            if(email_check){
               return send_response(res, 400, {error: 'Email already exists'}); 
            }

            const index = users_arr.findIndex(user => user.id === id);

            if(index === -1){
                return send_response(res, 400, {error: 'User not found'});
            }

            users_arr[index] = {
                name: body.name,
                email: body.email,
                role: body.role,
                id: id,
                createdAt: users_arr[index].createdAt,
                updatedAt: new Date().toISOString()
            }

            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            return send_response(res, 200, users_arr[index]);

        } catch(error) {
            return send_response(res, 500, {error: 'internal server error'});
        }

    } else if(req.method === 'DELETE' && pathname.startsWith('/users/') && id){
        try {
            let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
            users_arr = [];
            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));    
            
            }

            const index = users_arr.findIndex(user => user.id === id);

            if(index === -1){
                return send_response(res, 400, {error: 'User not found'});
            }

            users_arr.splice(index, 1);

            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            return send_response(res, 204);

        } catch(error){
            return send_response(res, 500, {error: 'Internal server error'});
        }

    } else if(req.method === 'PATCH' && pathname.startsWith('/users/') && id){
        const body = await bodyParser(req);

        try {
            let users_arr;

            try {
            const data = await fs.readFile(user_path, 'utf-8');
            users_arr = JSON.parse(data);

            } catch {
                users_arr = [];
                await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            }

            const index = users_arr.findIndex(user => user.id === id);

            if(index === -1){
                return send_response(res, 400, {error: 'User not found'});
            }

            if(body.name !== undefined){
                if(body.name.trim() !== ''){
                    users_arr[index].name = body.name;
                }
            }

            if(body.role !== undefined){
                users_arr[index].role = body.role;
            }

            if(body.email !== undefined){
                const email_check = users_arr.some(user => user.email === body.email && user.id !== id);

                if(email_check){
                    return send_response(res, 400, {error: 'Email already exists'});
                }

                users_arr[index].email = body.email;

            }

            await fs.writeFile(user_path, JSON.stringify(users_arr, null, 2));

            return send_response(res, 200, users_arr[index]);

        } catch(error){
            return send_response(res, 500, {error: 'Internal server error'});
        }
    } else {
        return false;
    }
}

module.exports = users;