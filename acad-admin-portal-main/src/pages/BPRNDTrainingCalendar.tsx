import React from 'react';
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import trainingCalendarPdf from '../Training cal.pdf';

const BPRNDTrainingCalendar: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0b2e63]">Training Calendar</h1>
        </div>

        <Card className="bg-white border border-[#0b2e63]/20 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-black">Calendar PDF</CardTitle>
            <a href={trainingCalendarPdf} download className="inline-flex">
              <Button variant="outline" className="text-[#0b2e63] border-[#0b2e63]/30 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </a>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: '75vh' }}>
              <object
                data={trainingCalendarPdf}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <iframe
                  title="Training Calendar"
                  src={trainingCalendarPdf}
                  className="w-full h-full"
                />
              </object>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDTrainingCalendar;


