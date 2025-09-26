export async function listProducts(event) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { id: 1, name: 'Demo Product', price: 10.0 },
      { id: 2, name: 'Coffee Beans', price: 15.5 },
      { id: 3, name: 'Mug', price: 8.25 }
    ])
  }
}

export async function listCustomers(event) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { id: 'C001', name: 'Acme Ltd' },
      { id: 'C002', name: 'Beta Co' }
    ])
  }
}
