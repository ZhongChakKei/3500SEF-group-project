# 3500SEF-group-project

This repository now contains only the React (Vite) frontend.

## 🚀 Quick Start

```powershell
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## Project Structure

```
webApp/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Notes

- All backend/serverless code and docs have been removed per request.
- If you deploy to AWS Amplify, connect only the `frontend` build with the default Vite build settings.

## Deploy (Optional)

If you want to host the frontend statically (e.g., AWS Amplify or Netlify), build it first:

```powershell
cd frontend
npm run build
# output in frontend/dist
```

You can then upload the contents of `frontend/dist` to any static hosting service.
