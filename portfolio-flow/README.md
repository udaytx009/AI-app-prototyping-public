# Portfolio app

This project consists of a FastAPI backend server and a React + TypeScript frontend application

## Stack

- React+Typescript frontend with `yarn` as package manager.
- Python FastAPI server with `uv` as package manager.

## Quickstart

1. Install dependencies:

```bash
make
```

2. Start the backend and frontend servers in separate terminals:

```bash
make run-backend
make run-frontend
```

## Gotchas

The backend server runs on port 8000 and the frontend development server runs on port 5173. The frontend Vite server proxies API requests to the backend on port 8000.

Visit <http://localhost:5173> to view the application.

## Look & Feel

<img width="1318" height="614" alt="image" src="https://github.com/user-attachments/assets/6043c1d2-9deb-4962-aacc-e11a5bcc1aa6" />

<img width="812" height="573" alt="image" src="https://github.com/user-attachments/assets/9b1a874e-4066-4ae1-8386-79627f334128" />

<img width="1299" height="581" alt="image" src="https://github.com/user-attachments/assets/ec00bf6f-4a1a-46f1-83ae-8312349b0606" />
