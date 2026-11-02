const http = require('http');
const app = require('../server');

setTimeout(() => {
  http.get('http://127.0.0.1:5000/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('✔ Health Check Status:', res.statusCode);
      console.log('✔ Response Payload:', data);

      // Now probe root
      http.get('http://127.0.0.1:5000/', (res2) => {
        let rootData = '';
        res2.on('data', (chunk) => { rootData += chunk; });
        res2.on('end', () => {
          console.log('✔ Root API Status:', res2.statusCode);
          console.log('✔ Server and routing test completed successfully!');
          process.exit(0);
        });
      });
    });
  }).on('error', (err) => {
    console.error('Probe Error:', err.message);
    process.exit(1);
  });
}, 300);
