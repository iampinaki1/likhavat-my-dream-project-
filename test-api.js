const http = require('http');

const data = JSON.stringify({
    email: 'test@test.com',
    newpassword: 'newpass'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/profile/password/reset',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let responseData = '';

    res.on('data', d => {
        responseData += d;
    });

    res.on('end', () => {
        console.log('Response:', responseData);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
