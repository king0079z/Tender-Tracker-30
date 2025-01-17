export type Status = 'pending' | 'accepted' | 'rejected';
export type Stage = 1 | 2 | 3;

export interface Comment {
  id: string;
  interviewerName: string;
  text: string;
  status: 'passed' | 'failed';
  timestamp: Date;
}

export interface Candidate {
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