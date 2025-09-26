# 3500SEF-group-project

Demo POS web app scaffold using React (Vite) frontend and a simple offline Lambda-like backend for local development. Later you can replace the backend with real AWS Lambda + API Gateway.

## Structure

- `frontend/` — React app with routes aligned to the provided topology
- `backend/` — Node.js offline server mimicking Lambda endpoints at `http://localhost:7071/api`

## Quick start (Windows PowerShell)

1. Frontend
	- Copy `.env.example` to `.env` and adjust `VITE_API_BASE` if needed.
	- Install and run:

```powershell
cd "g:\HKMU\yr3\Software Engineering 3500SEF\webApp\frontend"; npm i; npm run dev
```

2. Backend (offline for demo)

```powershell
cd "g:\HKMU\yr3\Software Engineering 3500SEF\webApp\backend"; npm i; npm start
```

Open the app at http://localhost:5173

## Next steps

- Swap offline server with AWS Lambda + API Gateway (SAM or Serverless Framework)
- Add authentication (e.g., Cognito) and persistence (DynamoDB)
- Flesh out modules: stock, transfers, loyalty, export, etc.
