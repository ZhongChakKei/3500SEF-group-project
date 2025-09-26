export async function listOrders(event) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { id: 'ORD-1001', date: '2025-09-01', customer: 'Walk-in', total: 23.75 }
    ])
  }
}
