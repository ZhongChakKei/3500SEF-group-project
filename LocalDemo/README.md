# Local Demo

A stripped-down offline demo of the inventory UI. Authentication and backend API are mocked; a small static JSON dataset is bundled.

## Features
- View product list
- View product detail JSON
- Fake login/logout (no real auth)

## Run
Install dependencies then start dev server:

```powershell
cd LocalDemo
npm install
npm run dev
```
Open the printed local URL (typically http://localhost:5173).

## Structure
- `src/state/auth.tsx` simple mock auth provider
- `src/store/products.ts` loads local JSON dataset
- `src/data/products.json` sample product records
- `src/pages/*` minimal pages

This folder is self-contained and does not modify or require the main app's environment variables.
