# ProximityTracker

## Overview

ProximityTracker is a full-stack web application built with React and Express that enables secure, real-time location sharing between users. The application features RSA encryption for location data security, real-time map visualization using HERE Maps API, and proximity-based alerts. It supports both sender and receiver modes for location tracking functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

### Database Schema
- **location_data**: Stores encrypted location information with sender ID, encrypted coordinates, public key, and timestamps
- **rsa_key_pairs**: Stores RSA public/private key pairs for each sender with unique sender IDs

## Key Components

### Security Layer
- **RSA Encryption**: Client-side encryption/decryption using JSEncrypt library
- **Key Management**: Automatic RSA key pair generation and storage per sender
- **Data Protection**: Location coordinates are encrypted before transmission and storage

### Location Services
- **Geolocation API**: Browser-based location tracking with high accuracy settings
- **Distance Calculation**: Haversine formula implementation for proximity detection
- **Real-time Updates**: Polling-based location updates every 2 seconds

### User Interface Components
- **SenderInterface**: Manages location broadcasting, key generation, and tracking status
- **ReceiverInterface**: Handles location decryption, proximity alerts, and map visualization
- **HereMap**: Interactive map component with HERE Maps API integration
- **Mode Toggle**: Seamless switching between sender and receiver modes

### Storage Layer
- **Memory Storage**: Development fallback with in-memory data storage
- **Database Storage**: PostgreSQL with Drizzle ORM for production data persistence
- **Migration System**: Drizzle Kit for database schema management

## Data Flow

1. **Sender Flow**: User generates RSA key pair → Gets current location → Encrypts coordinates → Sends to server
2. **Receiver Flow**: Polls server for encrypted data → Retrieves RSA keys → Decrypts location → Calculates distance → Updates map
3. **Real-time Updates**: Continuous polling ensures fresh location data and proximity alerts
4. **Security**: All location data is encrypted end-to-end using RSA encryption

## External Dependencies

### Maps Integration
- **HERE Maps API**: Provides interactive mapping, geocoding, and location services
- **Dynamic Loading**: HERE Maps scripts are loaded dynamically in the browser

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Consistent icon library throughout the application

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express API on same port
- **Hot Reload**: Automatic code updates for both frontend and backend
- **Environment Variables**: DATABASE_URL and HERE_API_KEY configuration

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served from Express with production optimizations

### Database Management
- **Migrations**: Drizzle Kit push command for schema updates
- **Connection**: Neon serverless PostgreSQL with connection string configuration
- **Fallback**: Memory storage for development without database setup

### Environment Configuration
- **Development**: NODE_ENV=development with tsx for TypeScript execution
- **Production**: NODE_ENV=production with compiled JavaScript execution
- **API Keys**: HERE Maps API key for map functionality
- **Database**: PostgreSQL connection string for data persistence