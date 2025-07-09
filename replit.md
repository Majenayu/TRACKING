# TrackSmart - Universal Logistics Visibility Platform

## Overview

TrackSmart is a comprehensive logistics visibility platform that addresses the fragmented tracking challenges faced by small businesses and consumers across India. Built as an open-source, API-first solution following BECKN protocol standards, it provides unified tracking across multiple carriers and transport modes with real-time visibility, predictive delivery estimates, and seamless integration capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Application structure: Single HTML file with embedded JavaScript, no separate CSS files or complex folder structures.
Focus on BECKN protocol compliance and Indian logistics ecosystem.

## System Architecture

### Frontend Architecture
- **Framework**: Single HTML file with embedded JavaScript
- **UI Library**: Tailwind CSS via CDN for styling
- **Encryption**: JSEncrypt library via CDN for RSA encryption
- **Maps**: HERE Maps API via CDN for map visualization
- **State Management**: Vanilla JavaScript with global variables
- **No Build Process**: Direct HTML file serving

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: JavaScript with ES modules
- **Database**: In-memory storage using Maps
- **API Pattern**: RESTful API with JSON responses
- **Static Serving**: Express serves the HTML file directly

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