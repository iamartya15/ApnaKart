import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 2000 },  // Ramp-up to 2,000 users
    { duration: '5m', target: 10000 }, // Peak load: scale up to 10,000 VUs
    { duration: '3m', target: 10000 }, // Hold load at 10,000 VUs
    { duration: '2m', target: 0 },     // Cool down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  // 1. Browse / Search products
  const searchRes = http.get(`${BASE_URL}/search?q=iPhone`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 2. Compare products
  const compareRes = http.get(`${BASE_URL}/compare?p1=amazon-iphone15&p2=flipkart-iphone15`);
  check(compareRes, {
    'compare status is 200': (r) => r.status === 200,
  });
  sleep(2);

  // 3. System Liveness
  const livenessRes = http.get(`${BASE_URL}/liveness`);
  check(livenessRes, {
    'liveness status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
