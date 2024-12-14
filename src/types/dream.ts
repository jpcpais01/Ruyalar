export interface DreamEntryType {
  id: string;
  title: string;
  content: string;
  date: Date;
  lucidityLevel: number;
  moodLevel: number;
  emotions: string[];
  clarity: number;
  analysis?: {
    messages: {
      text: string;
      isUser: boolean;
      timestamp: Date;
    }[];
    lastUpdated: Date;
  };
  messages: {
    text: string;
    isUser: boolean;
    timestamp: Date;
  }[];
  text: string;
  isUser: boolean;
  timestamp: Date;
  lastUpdated: Date;
  showInJournal: boolean;
}
