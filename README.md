# 🛡️ Sentinel

> **Advanced Urban Safety & Emergency Response Platform**
> 
> *Empowering tourists and citizens with real-time safety tools, AI-powered risk analysis, and seamless connectivity to authorities.*

---

## 📖 Overview

**Sentinel** is a comprehensive safety application designed to bridge the gap between civilians and emergency services. Whether you are a tourist navigating a new city or a local resident, Sentinel provides the tools you need to stay safe. 

Featuring a dual-interface system (Tourist/User View & Authority Dashboard), it integrates real-time geolocation, AI-driven risk assessment, and instant emergency protocols.

## ✨ Key Features

### 🚨 For Users & Tourists
- **SOS Panic Button**: One-tap emergency alert system that notifies contacts and authorities with live location.
- **AI Risk Scanner**: Powered by **Google GenAI**, analyze locations for potential safety hazards in real-time.
- **Live Safety Map**: Interactive maps highlighting safe zones, medical facilities, and police stations using **Leaflet**.
- **Digital ID**: Secure, QR-code based identification for quick verification by officials.
- **Emergency Contacts**: Easily manage and notify trusted contacts during critical situations.

### 👮 For Authorities
- **Command Dashboard**: Real-time view of active distress signals and officer locations.
- **Incident Tracking**: Manage and resolve safety incidents efficiently.
- **Resource Allocation**: Visualize officer distribution and jurisdiction coverage.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Modern CSS, Lucide React Icons
- **Maps**: Leaflet, React-Leaflet
- **Data Visualization**: Recharts, D3.js
- **AI Integration**: Google Generative AI SDK

### Backend (Server)
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **Communications**: Twilio API (SMS Alerts)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Cluster
- Twilio Account (for SMS features)
- Google Gemini API Key

### Installation

Clone the repository:
```bash
git clone https://github.com/yourusername/sentinel.git
cd sentinel
```

#### 1. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

Start the server:
```bash
npm start
```

#### 2. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Start the development server:
```bash
npm run dev
```

## 📸 Usage

1.  **Register/Login**: Create an account as a "Tourist" or "Authority".
2.  **Dashboard**: 
    -   **Tourists** see the map, SOS button, and risk scanner.
    -   **Authorities** see the monitoring dashboard.
3.  **Emergency**: Press the red **SOS** button to trigger alerts.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

---

*Built with ❤️ for safety.*
