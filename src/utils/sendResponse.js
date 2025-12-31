function sendResponse(res, status, json){
    if(status === 204){
        res.writeHead(204);
        res.end();
        return true;
    }
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(json));
    return true;
}

module.exports = sendResponse;