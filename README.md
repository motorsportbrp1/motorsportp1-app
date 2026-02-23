# 🏎️ MotorSport P1

Welcome to **MotorSport P1**, an advanced Formula 1 Data Analytics Dashboard designed to provide session analysis, driver comparisons, live timing, and telemetry visualization.

## 🚀 Overview

MotorSport P1 aims to be the ultimate companion for F1 enthusiasts and analysts, offering deep dives into race data, telemetry comparisons between drivers, and real-time updates during live sessions.

Currently, the project is in **Phase 1**, focusing on establishing a robust, modern, and responsive Frontend architecture.

## 🛠️ Tech Stack

### Frontend (Phase 1 - Active)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Data Visualization**: [Apache ECharts](https://echarts.apache.org/) via `echarts-for-react`
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend (Phase 2 - Upcoming)
- **Framework**: Python FastAPI
- **Data Processing**: FastF1 library
- **Caching**: Redis
- **Database**: Supabase PostgreSQL

### Real-Time Infrastructure (Phase 3 - Upcoming)
- **WebSockets** for Live Timing
- **Redis Pub/Sub** for event streaming

## 📂 Project Structure

```text
motorsportp1/
├── frontend/             # Next.js Application (Active)
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React Components (Layouts & Pages)
│   │   ├── lib/          # Utilities and helpers
│   │   └── types/        # TypeScript type definitions
│   └── package.json      # Frontend dependencies
├── backend/              # Python FastAPI services (Planned)
└── infra/                # Docker configurations, deployment scripts (Planned)
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Running the Frontend Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🎨 Features & Pages

- **Home (`/`)**: Overview Dashboard.
- **Race Weekend (`/race`)**: Detailed weekend summary, schedule, and results.
- **Session Analyzer (`/session`)**: Deep dive into practice, qualifying, or race sessions.
- **Driver Comparison (`/compare`)**: Head-to-head telemetry and lap time comparisons.
- **Live Timing (`/live`)**: Real-time race monitoring interface.
- **Seasons (`/seasons`)**: Historical data and championship standings.
- **Settings (`/settings`)**: User preferences and theme customization.

## 📄 License

This project is proprietary.
