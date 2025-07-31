import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Calendar, Phone, Mail, MapPin, User, Hash, Award } from "lucide-react";
import { useParticipants } from "@/hooks/useParticipants";

const ParticipantsCard = () => {
  const { participants, count, loading, error } = useParticipants();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Loading...
            </div>
            <p className="text-sm text-black">
              Fetching participants data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Error
            </div>
            <p className="text-sm text-black">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              {count.toLocaleString()}
            </div>
            <p className="text-sm text-black">
              Total students/professionals
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Users className="h-5 w-5 text-indigo-600" />
              Participants Trained ({count})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-black">
                No participants found
              </div>
            ) : (
              participants.map((participant) => (
                <Card key={participant._id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-black">{participant.fullName}</h3>
                          <p className="text-sm text-black">Enrollment: {participant.enrollmentNumber}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                          <Award className="h-3 w-3" />
                          {participant.rank}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">SR No:</span>
                          <span className="text-black">{participant.srNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Batch:</span>
                          <span className="text-black">{participant.batchNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Gender:</span>
                          <span className="text-black">{participant.gender}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">DOB:</span>
                          <span className="text-black">{formatDate(participant.dateOfBirth)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Mobile:</span>
                          <span className="text-black">{participant.mobileNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Email:</span>
                          <span className="text-black">{participant.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Birth Place:</span>
                          <span className="text-black">{participant.birthPlace}, {participant.birthState}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Aadhar:</span>
                          <span className="text-black">{participant.aadharNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">RRU Serial:</span>
                          <span className="text-black">{participant.serialNumberRRU}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium text-sm text-black">Address:</span>
                            <p className="text-sm text-black mt-1">{participant.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      {participant.alternateNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-black">Alternate:</span>
                          <span className="text-black">{participant.alternateNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ParticipantsCard; 