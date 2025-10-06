## Dataset Fetch Lambda

Read-only Lambda (Function URL friendly) that serves dataset JSON stored in S3.

### Environment Variables
| Variable | Description |
|----------|-------------|
| `BUCKET_NAME` | S3 bucket where dataset files live |
| `PRODUCTS_KEY` | (default `products.json`) |
| `VARIANTS_KEY` | (default `variants.json`) |
| `INVENTORY_KEY` | (default `inventory.json`) |
| `LOCATIONS_KEY` | (default `locations.json`) |
| `DATA_CACHE_TTL_SECONDS` | Cache lifetime for in-memory copy (default 60) |

### Expected File Formats
Each file is JSON array matching the frontend types:

`products.json`:
```json
[{ "product_id": "P-001", "title": "iPhone 15", "brand": "Apple", "category": "phone" }]
```

`variants.json`:
```json
[{ "variant_id": "V-001", "product_id": "P-001", "sku": "IPH15-BLK-128", "color": "Black", "storage_gb": 128, "price_HKD": 7999 }]
```

`inventory.json`:
```json
[{ "variantId": "V-001", "locationId": "STO-CWB", "onHand": 10, "reserved": 2, "available": 8, "updatedAt": "2025-10-01T10:00:00Z" }]
```

`locations.json` (optional):
```json
[{ "locationId": "STO-CWB", "name": "Causeway Bay Store" }]
```

### Deploy Steps (Console Quick Path)
1. Create Lambda (Node.js 18.x).  
2. Enable **Function URL** (Auth = NONE) — or use API Gateway if you need auth.
3. Upload code:
   - Create a zip containing `index.mjs` and `package.json` and `node_modules` (after `npm install`).
4. Set environment variables (at least `BUCKET_NAME`).
5. Add an IAM policy allowing `s3:GetObject` on bucket objects.
6. Test with event:
```json
{
  "requestContext": { "http": { "method": "GET" } },
  "rawPath": "/products"
}
```

### IAM Policy Snippet
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

### Notes
* This is **read-only**. `POST /reserve` and `POST /orders` return 501 until you implement logic against DynamoDB.
* Add a refresh path by calling `/health` and forcing reload by clearing the process or adding a `?reload=1` you wire up.
* For larger datasets consider compressing (e.g., `.json.gz`) and expanding here.

### Local Test
```bash
cd lambda
npm install
BUCKET_NAME=your-bucket LOCAL_TEST=1 node index.mjs
```
