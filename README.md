# home-fin-front

Frontend application for personal finance management (interface, expense/income visualization and reports).

## Main features
- Dashboard with balance summary and trends
- Create/edit transactions (income and expenses)
- Filters by period, category and account
- Basic reports and charts
- Integration with backend API (REST endpoints)

## Technologies
- React 
- TypeScript / JavaScript
- Bundler: Vite / Webpack
- CSS: Tailwind

## Requirements
- Node.js >= 16
- npm >= 8 or Yarn
- Access to the application backend ([API Repo](https://github.com/DiegoFeijo13/home-fin-api))

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/DiegoFeijo13/home-fin-front.git
    cd home-fin-front
    ```
2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## Environment variables
Create a `.env` in the project root with the minimum keys:
```
VITE_API_BASE_URL=https://api.example.com
```

## Useful scripts
- Start development server:
  ```bash
  npm run dev
  ```
- Production build:
  ```bash
  npm run build  
  ```
- Serve build locally:
  ```bash
  npm run preview  
  ```