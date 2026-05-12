# Location Tracker

A full-stack application for tracking and managing location data with group functionality and real-time updates.

## Project Overview

Location Tracker is a comprehensive solution for managing user locations with support for groups, subscriptions, and historical data. The application consists of a Node.js backend API and a React Native mobile application.

## Features

- **User Authentication**: Secure login and registration system
- **Location Tracking**: Real-time GPS location tracking and history
- **Group Management**: Create and manage groups of users
- **Map View**: Visual representation of locations on an interactive map
- **Dashboard**: Comprehensive dashboard for viewing tracked data
- **Subscription Management**: Flexible subscription plans and management
- **History Tracking**: Complete history of location movements

## Project Structure

```
Location-Tracker/
├── backend/                 # Node.js Express backend API
│   ├── models/             # Database models
│   │   ├── Group.js        # Group model
│   │   ├── Location.js     # Location model
│   │   └── User.js         # User model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── group.js        # Group management endpoints
│   │   ├── location.js     # Location tracking endpoints
│   │   └── subscription.js # Subscription endpoints
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
└── mobile/                 # React Native mobile app
    ├── screens/            # Screen components
    │   ├── AuthScreen.js        # Login/Registration
    │   ├── DashboardScreen.js   # Main dashboard
    │   ├── GroupScreen.js       # Group management
    │   ├── HistoryScreen.js     # Location history
    │   ├── MapScreen.js         # Map view
    │   └── SubscriptionScreen.js # Subscription management
    ├── context/            # React Context
    │   └── AuthContext.js  # Authentication context
    ├── assets/             # Static assets
    ├── App.js              # Main app component
    ├── index.js            # Entry point
    ├── app.json            # App configuration
    ├── babel.config.js     # Babel configuration
    └── package.json        # Mobile app dependencies
```

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for API development
- **MongoDB**: NoSQL database (implied by models)

### Mobile
- **React Native**: Cross-platform mobile development
- **React Navigation**: Navigation library
- **Context API**: State management

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env` file):
   ```
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Expo CLI (if not already installed):
   ```bash
   npm install -g expo-cli
   ```

4. Start the app:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Groups
- `GET /api/group` - Get all groups
- `POST /api/group` - Create a new group
- `GET /api/group/:id` - Get group details
- `PUT /api/group/:id` - Update group
- `DELETE /api/group/:id` - Delete group

### Locations
- `GET /api/location` - Get location history
- `POST /api/location` - Add new location
- `GET /api/location/:id` - Get location details

### Subscriptions
- `GET /api/subscription` - Get subscription info
- `POST /api/subscription` - Create subscription
- `PUT /api/subscription/:id` - Update subscription

## Usage

1. Launch the mobile app
2. Register or login with your credentials
3. Grant location permissions
4. View your location on the map
5. Create or join groups
6. View location history and analytics
7. Manage your subscription

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email haroonmust123@gmail.com or open an issue on GitHub.

## Acknowledgments

- React Native community
- Express.js team
- All contributors to this project
