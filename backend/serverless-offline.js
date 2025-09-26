// Minimal offline server that mimics AWS Lambda API Gateway endpoints using Node's http
import http from 'http'

const port = 7071 // matches frontend .env.example

const routes = {
  '/api/catalog/products': () => ({
    status: 200,
    json: [
      { id: 1, name: 'Demo Product', price: 10.0 },
      { id: 2, name: 'Coffee Beans', price: 15.5 },
      { id: 3, name: 'Mug', price: 8.25 }
    ]
  }),
  '/api/customers': () => ({
    status: 200,
    json: [ { id: 'C001', name: 'Acme Ltd' }, { id: 'C002', name: 'Beta Co' } ]
  }),
  '/api/sales/orders': () => ({
    status: 200,
    json: [ { id: 'ORD-1001', date: '2025-09-01', customer: 'Walk-in', total: 23.75 } ]
  })
}

const server = http.createServer((req, res) => {
  const { url, method } = req
  const match = routes[url]
  if (match && method === 'GET') {
    const result = match()
    res.writeHead(result.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(result.json))
  } else if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ message: 'Not Found' }))
  }
})

server.listen(port, () => console.log(`Offline Lambda API running at http://localhost:${port}/api`))
