import React, { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Status = 'pending' | 'accepted' | 'rejected';
type Stage = 1 | 2 | 3;

interface Comment {
  id: string;
  interviewerName: string;
  text: string;
  status: 'passed' | 'failed';
  timestamp: Date;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  stage: Stage;
  status: Status;
  cv?: string;
  comments: Comment[];
  interviewDate?: Date;
  meetingLocation?: string;
  meetingLink?: string;
  suggestedJobTitle?: string;
  interviewers: string[];
}

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState({ 
    name: '', 
    email: '', 
    jobTitle: '' 
  });
  const [newComment, setNewComment] = useState({
    interviewerName: '',
    text: '',
    status: 'passed' as 'passed' | 'failed'
  });

  const getStageStats = (stage: Stage) => {
    const stageData = candidates.filter(c => c.stage === stage);
    return {
      total: stageData.length,
      accepted: stageData.filter(c => c.status === 'accepted').length,
      rejected: stageData.filter(c => c.status === 'rejected').length,
      pending: stageData.filter(c => c.status === 'pending').length,
    };
  };

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.email && newCandidate.jobTitle) {
      setCandidates([...candidates, {
        id: Math.random().toString(36).substr(2, 9),
        ...newCandidate,
        stage: 1,
        status: 'pending',
        comments: [],
      }]);
      setNewCandidate({ name: '', email: '', jobTitle: '' });
    }
  };

  const handleStatusChange = (id: string, status: Status) => {
    setCandidates(candidates.map(c => {
      if (c.id === id) {
        return { ...c, status };
      }
      return c;
    }));
  };

  const handleMoveToNextStage = (id: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === id && c.stage < 3) {
        // Create a new candidate in the next stage while keeping the current one as accepted
        const newCandidate = {
          ...c,
          id: Math.random().toString(36).substr(2, 9), // Generate new ID for the next stage
          stage: (c.stage + 1) as Stage,
          status: 'pending'
        };
        
        // Update the current candidate to accepted status
        const updatedCandidates = candidates.map(candidate => 
          candidate.id === id ? { ...candidate, status: 'accepted' } : candidate
        );
        
        // Add the new candidate to the next stage
        setTimeout(() => {
          setCandidates(prev => [...prev, newCandidate]);
        }, 500);
        
        return { ...c, status: 'accepted' };
      }
      return c;
    }));
  };

  const handleAddComment = (id: string) => {
    if (newComment.interviewerName && newComment.text) {
      setCandidates(candidates.map(c => {
        if (c.id === id) {
          return {
            ...c,
            comments: [...c.comments, {
              id: Math.random().toString(36).substr(2, 9),
              ...newComment,
              timestamp: new Date()
            }]
          };
        }
        return c;
      }));
      setNewComment({
        interviewerName: '',
        text: '',
        status: 'passed'
      });
    }
  };

  const handleSetInterviewDate = (id: string, date: string) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, interviewDate: new Date(date) } : c
    ));
  };

  const getTimeUntilInterview = (date?: Date) => {
    if (!date) return 'Not scheduled';
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days remaining` : 'Interview passed';
  };

  return (
    <>
      <Head>
        <title>Interview Tracking System</title>
        <meta name="description" content="Interview tracking system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto p-4">
          <ConnectionStatus />
        </div>
        <main className="flex-1 container mx-auto p-4 space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((stage) => {
              const stats = getStageStats(stage as Stage);
              const stageNames = {
                1: "Initial Interview",
                2: "Technical Assessment",
                3: "Final Interview"
              };
              return (
                <Card key={stage} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">Stage {stage}</span>
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">
                      {stageNames[stage as keyof typeof stageNames]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Total Candidates</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Accepted</p>
                          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Rejected</p>
                          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ 
                              width: `${stats.total ? (stats.accepted / stats.total) * 100 : 0}%`,
                              transition: 'width 0.5s ease-in-out'
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Success Rate: {stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add New Candidate */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-6">Add New Candidate</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Job Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentJob">Current Job Title</Label>
                    <Input
                      id="currentJob"
                      value={newCandidate.jobTitle}
                      onChange={(e) => setNewCandidate({ ...newCandidate, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suggestedPosition">Suggested Position</Label>
                    <Input
                      id="suggestedPosition"
                      placeholder="Enter suggested position"
                      onChange={(e) => setNewCandidate({ 
                        ...newCandidate, 
                        suggestedJobTitle: e.target.value 
                      })}
                    />
                  </div>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interview Date and Time</Label>
                    <Input
                      type="datetime-local"
                      onChange={(e) => setNewCandidate({ 
                        ...newCandidate, 
                        interviewDate: new Date(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Location</Label>
                    <Input
                      placeholder="Enter meeting location"
                      onChange={(e) => setNewCandidate({ 
                        ...newCandidate, 
                        meetingLocation: e.target.value 
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meeting Link</Label>
                  <Input
                    placeholder="Enter virtual meeting link"
                    onChange={(e) => setNewCandidate({ 
                      ...newCandidate, 
                      meetingLink: e.target.value 
                    })}
                  />
                </div>

                <DialogFooter>
                  <Button onClick={handleAddCandidate}>Add Candidate</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Candidates List */}
          <Tabs defaultValue="1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">Stage 1</TabsTrigger>
              <TabsTrigger value="2">Stage 2</TabsTrigger>
              <TabsTrigger value="3">Stage 3</TabsTrigger>
            </TabsList>

            {[1, 2, 3].map((stage) => (
              <TabsContent key={stage} value={stage.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle>Stage {stage} Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Interview Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates
                          .filter((candidate) => candidate.stage === stage)
                          .map((candidate) => (
                            <TableRow key={candidate.id}>
                              <TableCell>{candidate.name}</TableCell>
                              <TableCell>{candidate.jobTitle}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    candidate.status === 'accepted'
                                      ? 'default'
                                      : candidate.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {candidate.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getTimeUntilInterview(candidate.interviewDate)}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {/* Schedule Interview Button */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Schedule
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Schedule Interview</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label>Interview Date and Time</Label>
                                          <Input
                                            type="datetime-local"
                                            onChange={(e) => handleSetInterviewDate(candidate.id, e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {/* Add Comment Button */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Comment
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Add Interview Feedback</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label>Your Name</Label>
                                          <Input
                                            value={newComment.interviewerName}
                                            onChange={(e) => setNewComment({
                                              ...newComment,
                                              interviewerName: e.target.value
                                            })}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Status</Label>
                                          <Select
                                            onValueChange={(value) => setNewComment({
                                              ...newComment,
                                              status: value as 'passed' | 'failed'
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="passed">Passed</SelectItem>
                                              <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Comment</Label>
                                          <Textarea
                                            value={newComment.text}
                                            onChange={(e) => setNewComment({
                                              ...newComment,
                                              text: e.target.value
                                            })}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button onClick={() => handleAddComment(candidate.id)}>
                                          Add Comment
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  {/* Final Decision Button */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Final Decision
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Final Decision - {candidate.name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Status</Label>
                                          <div className="flex space-x-2 mt-2">
                                            <Button
                                              size="sm"
                                              variant={candidate.status === 'accepted' ? 'default' : 'outline'}
                                              onClick={() => handleStatusChange(candidate.id, 'accepted')}
                                            >
                                              Accept
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={candidate.status === 'rejected' ? 'destructive' : 'outline'}
                                              onClick={() => handleStatusChange(candidate.id, 'rejected')}
                                            >
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                        {candidate.stage < 3 && (
                                          <div>
                                            <Button
                                              onClick={() => handleMoveToNextStage(candidate.id)}
                                              className="w-full"
                                            >
                                              Move to Stage {candidate.stage + 1}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {/* Details Button */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                      <DialogHeader>
                                        <DialogTitle>Interview Details - {candidate.name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-6">
                                        {/* Meeting Information */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Interview Date and Time</Label>
                                            <p className="mt-1">
                                              {candidate.interviewDate 
                                                ? new Date(candidate.interviewDate).toLocaleString() 
                                                : 'Not scheduled'}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Location</Label>
                                            <p className="mt-1">{candidate.meetingLocation || 'Not specified'}</p>
                                          </div>
                                        </div>

                                        <div>
                                          <Label>Meeting Link</Label>
                                          <p className="mt-1">
                                            {candidate.meetingLink ? (
                                              <a href={candidate.meetingLink} target="_blank" rel="noopener noreferrer" 
                                                 className="text-primary hover:underline">
                                                {candidate.meetingLink}
                                              </a>
                                            ) : (
                                              'No virtual meeting link'
                                            )}
                                          </p>
                                        </div>

                                        {/* Interviewers */}
                                        <div>
                                          <Label>Interviewers</Label>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {(candidate.interviewers || []).map((interviewer, index) => (
                                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                                {interviewer}
                                                <button
                                                  className="ml-2 text-muted-foreground hover:text-foreground"
                                                  onClick={() => {
                                                    const updatedCandidates = candidates.map(c => {
                                                      if (c.id === candidate.id) {
                                                        const newInterviewers = [...c.interviewers];
                                                        newInterviewers.splice(index, 1);
                                                        return { ...c, interviewers: newInterviewers };
                                                      }
                                                      return c;
                                                    });
                                                    setCandidates(updatedCandidates);
                                                  }}
                                                >
                                                  ×
                                                </button>
                                              </Badge>
                                            ))}
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                  + Add Interviewer
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                <DialogHeader>
                                                  <DialogTitle>Add Interviewer</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                  <div className="space-y-2">
                                                    <Label>Interviewer Name</Label>
                                                    <Input
                                                      placeholder="Enter interviewer name"
                                                      onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                          const input = e.target as HTMLInputElement;
                                                          const updatedCandidates = candidates.map(c => {
                                                            if (c.id === candidate.id) {
                                                              return {
                                                                ...c,
                                                                interviewers: [...(c.interviewers || []), input.value]
                                                              };
                                                            }
                                                            return c;
                                                          });
                                                          setCandidates(updatedCandidates);
                                                          input.value = '';
                                                        }
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          </div>
                                        </div>

                                        {/* CV Upload */}
                                        <div>
                                          <Label>CV Upload</Label>
                                          <Input type="file" className="mt-2" accept=".pdf,.doc,.docx" />
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </>
  );
}