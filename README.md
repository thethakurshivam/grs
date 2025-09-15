# BPR&D Training Management System

A comprehensive training management system for the Bureau of Police Research and Development (BPR&D) with multi-tier architecture including admin portal, POC portal, and student management.

## 🏗️ Architecture

### Frontend Applications
- **Academic Admin Portal** (`acad-admin-portal-main/`) - React + TypeScript + Vite + Tailwind CSS + ShadCN UI
- **POC Portal** (`poc-portal/`) - React + TypeScript + Vite + Tailwind CSS

### Backend APIs
- **Admin API** (Port 3002) - General admin operations and authentication
- **BPR&D POC API** (Port 3003) - POC-specific operations and approvals  
- **BPR&D Student API** (Port 3004) - Student-facing operations and authentication

## 🎯 Core Features

### BPR&D Training System
- **13 Umbrella Fields**: Cyber Security, Cyber Law, Forensics Psychology, Traffic Management, Border Management, Disaster Risk Reduction, Gender Sensitization, Behavioral Sciences, etc.
- **Credit System**: Dynamic credit tracking across all umbrella fields
- **Certification Levels**: Certificate (20 credits), Diploma (30 credits), PG Diploma (40 credits)

### Key Workflows
1. **Student Registration** → **Course Completion** → **Credit Earning**
2. **Certification Claims** → **POC Approval** → **Admin Approval** → **Certificate Generation**
3. **Course History Tracking** → **Credit Redemption** → **Audit Trail**

### QR Code Verification
- **QR Code Generation**: Automatic QR code generation on certificates
- **Verification System**: Scan QR code to verify certificate authenticity
- **Public Verification**: Anyone can verify certificates using the QR code

## 🚀 Quick Start

### Prerequisites
- Node.js (>=14.0.0)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grs-2
   ```

2. **Install dependencies for each application**
   ```bash
   # Backend APIs
   cd sitaics_project-main
   npm install
   
   # Admin Portal
   cd ../acad-admin-portal-main
   npm install
   
   # POC Portal
   cd ../poc-portal
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd sitaics_project-main
   cp env.example .env.admin
   cp env.example .env.poc
   cp env.example .env.api4
   # Edit the environment files with your configuration
   ```

4. **Start all services**
   ```bash
   # Start all APIs
   cd sitaics_project-main
   ./start-all-apis.sh
   
   # Start Admin Portal (in new terminal)
   cd acad-admin-portal-main
   npm run dev
   
   # Start POC Portal (in new terminal)
   cd poc-portal
   npm run dev
   ```

## 📊 Database Schema

### Main Collections
- `credit_calculations`: Student profiles and credit data
- `coursehistories`: Training course records with PDF attachments
- `bprnd_certification_claims`: Certification requests with dual approval
- `bprnd_certificates`: Issued certificates with custom IDs and QR codes
- `certificate_course_mappings`: Course-to-certificate relationships
- `pendingcredits`: Pending credit approvals
- `umbrellas`: Training field definitions

## 🔧 API Endpoints

### Admin API (Port 3002)
- `POST /api/login` - Admin login
- `GET /api/bprnd/claims` - BPRND claims
- `POST /api/bprnd/claims/:id/approve` - Approve claims

### BPR&D POC API (Port 3003)
- `POST /api/poc/login` - POC login
- `GET /api/bprnd/pending-credits` - Pending credits
- `POST /api/bprnd/pending-credits/:id/accept` - Accept credits

### BPR&D Student API (Port 3004)
- `POST /api/bprnd/student/login` - Student login
- `GET /health` - Health check
- `GET /verify/certificate/:id` - Certificate verification via QR code
- `GET /student/certificate/:id/pdf` - Download certificate PDF

## 🎨 Features

- **Dynamic Credit Calculation**: Real-time credit tracking
- **PDF Certificate Generation**: Automated certificate creation with QR codes
- **Course History Tracking**: Complete audit trail
- **Bulk Import**: CSV/Excel data import capabilities
- **Multi-role Authentication**: Admin, POC, and Student portals
- **Responsive Design**: Mobile-friendly interfaces
- **QR Code Verification**: Anti-fraud certificate verification system

## 🛠️ Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ShadCN UI components
- React Router for navigation
- TanStack Query for data fetching
- Chart.js for analytics

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- PDFKit for certificate generation
- QRCode for certificate verification
- CORS enabled for cross-origin requests

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for BPR&D Training Management**
