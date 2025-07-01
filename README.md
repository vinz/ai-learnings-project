# NewsSummary Project

## Overview
Welcome to the NewsSummary project! This is a modern web application designed to keep you informed by providing concise and accurate summaries of news articles. Powered by Artificial Intelligence (AI) and Azure OpenAI services, it ensures you get the most important information quickly and efficiently.

## Project Structure
```
backend/
    index.js
    package.json
frontend/
    package.json
    public/
        index.html
    src/
        App.js
        index.js
```

### Frontend
The frontend is built using React, making it fast, responsive, and user-friendly. You can find it in the `frontend/` directory. It uses `react-scripts` to simplify development and building processes.

### Backend
The backend, located in the `backend/` directory, is the brain of the application. It connects to Azure OpenAI services to analyze and summarize news articles using advanced AI models, ensuring the summaries are both accurate and insightful.

## Installation
Getting started is easy! Just follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd NewsSummary
   ```

2. Install the required dependencies for both the frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

## Usage

### Running the Frontend
To launch the frontend and start exploring:
```bash
cd frontend
npm start
```

### Running the Backend
To power up the backend and enable AI-driven summaries:
```bash
cd backend
node index.js
```

The backend will seamlessly connect to Azure OpenAI services to process news articles and generate summaries.

## Build
When you're ready to deploy, create a production-ready build of the frontend:
```bash
cd frontend
npm run build
```

## Contributing
We love contributions! If you have ideas or improvements, feel free to fork the repository and submit a pull request. Let's make this project even better together.

## License
This project is open-source and available under the MIT License. Enjoy using it and feel free to share!
