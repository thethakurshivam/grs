# POC Portal Dashboard

A modern, responsive Proof of Concept (POC) portal built with React, TypeScript, and Tailwind CSS. This portal provides a comprehensive dashboard for managing students, courses, MOUs (Memorandum of Understanding), and requests.

## 🚀 Features

### 📊 Dashboard Overview
- **4 Main Cards**: Students, Courses, MOUs, and Requests
- **Real-time Statistics**: Live counts and metrics
- **Recent Activity Feed**: Latest updates and notifications
- **Quick Stats**: Growth rate, active sessions, and system status

### 👥 Students Management
- **Student Directory**: Complete list of registered students
- **Search & Filter**: Find students by name, email, or status
- **Student Profiles**: Detailed information with avatars
- **Status Tracking**: Active/Inactive student status

### 📚 Courses Management
- **Course Catalog**: Visual course cards with images
- **Course Details**: Instructor, duration, students, ratings
- **Status Management**: Active, Upcoming, Completed courses
- **Search & Filter**: Find courses by title, instructor, or category

### 📋 MOUs Management
- **Partnership Agreements**: Complete MOU tracking
- **Status Monitoring**: Active, Pending, Expired statuses
- **Strategic Areas**: Detailed partnership information
- **Validity Tracking**: Automatic expiration date monitoring

### 📝 Requests Management
- **Approval Workflow**: Pending, Approved, Rejected requests
- **Priority Levels**: High, Medium, Low priority classification
- **Request Types**: Various request categories
- **Action Buttons**: Approve/Reject functionality

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poc-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Authentication

The portal includes a simple authentication system:
- **Demo Credentials**: admin@example.com / password123
- **Local Storage**: Token-based authentication
- **Session Management**: Automatic login state persistence

## 📱 Responsive Design

The portal is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI Components

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Design System
- **Cards**: Clean, modern card layouts
- **Buttons**: Consistent button styling
- **Forms**: User-friendly form elements
- **Navigation**: Intuitive navigation patterns

## 📊 Data Structure

### Students
```typescript
interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  course: string;
  avatar: string;
}
```

### Courses
```typescript
interface Course {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  status: 'active' | 'upcoming' | 'completed';
  category: string;
  startDate: string;
  image: string;
}
```

### MOUs
```typescript
interface MOU {
  id: number;
  title: string;
  organization: string;
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  status: 'active' | 'pending' | 'expired';
  type: string;
  description: string;
}
```

### Requests
```typescript
interface Request {
  id: number;
  title: string;
  requester: string;
  email: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}
```

## 🔧 Customization

### Adding New Features
1. Create new components in `src/components/`
2. Add routes in `src/App.tsx`
3. Update navigation and dashboard cards

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for theme customization
- Use Tailwind utility classes for component styling

### Data Management
- Replace mock data with real API calls
- Implement proper state management (Redux, Zustand, etc.)
- Add data persistence and caching

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] User role management
- [ ] File upload functionality
- [ ] Email integration
- [ ] Mobile app development
- [ ] API integration
- [ ] Database connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for educational and demonstration purposes.

---

**Note**: This is a POC (Proof of Concept) application. For production use, additional security measures, proper authentication, and backend integration should be implemented.
