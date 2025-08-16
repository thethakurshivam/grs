import React from 'react';
import { StudentDashboardLayout } from './StudentDashboardLayout';

const BPRNDStudentProfile: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Profile</h1>
          <p className="text-lg text-black mt-2">View and manage your BPR&D student profile</p>
        </div>
        
        <div className="bg-white border border-[#0b2e63]/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-[#0b2e63] mb-4">Profile Information</h2>
          <p className="text-gray-600">BPR&D student profile functionality coming soon...</p>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDStudentProfile;
