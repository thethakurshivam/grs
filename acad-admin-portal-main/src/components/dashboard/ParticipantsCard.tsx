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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Loading...
            </div>
            <p className="text-sm text-muted-foreground">
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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Error
            </div>
            <p className="text-sm text-muted-foreground">
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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Participants Trained
          </CardTitle>
          <div className="p-2 rounded-full bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {count.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Total students/professionals
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Participants Trained ({count})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participants found
              </div>
            ) : (
              participants.map((participant) => (
                <Card key={participant._id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{participant.fullName}</h3>
                          <p className="text-sm text-muted-foreground">Enrollment: {participant.enrollmentNumber}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                          <Award className="h-3 w-3" />
                          {participant.rank}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">SR No:</span>
                          <span>{participant.srNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Batch:</span>
                          <span>{participant.batchNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Gender:</span>
                          <span>{participant.gender}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">DOB:</span>
                          <span>{formatDate(participant.dateOfBirth)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Mobile:</span>
                          <span>{participant.mobileNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>{participant.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Birth Place:</span>
                          <span>{participant.birthPlace}, {participant.birthState}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Aadhar:</span>
                          <span>{participant.aadharNo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">RRU Serial:</span>
                          <span>{participant.serialNumberRRU}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium text-sm">Address:</span>
                            <p className="text-sm text-muted-foreground mt-1">{participant.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      {participant.alternateNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Alternate:</span>
                          <span>{participant.alternateNumber}</span>
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