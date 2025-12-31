async function bodyParser(req){
   return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => body += chunk);

    req.on('end', () => {
        if(!body) return resolve({});
        try {
        resolve(JSON.parse(body));
        } catch(error){
            reject(error);
        }
    })

    req.on('error', (error) => {
        reject(error);
    })
   })

}


module.exports = bodyParser;