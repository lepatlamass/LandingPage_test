import { Timestamp } from 'firebase/firestore';

export interface UserPreferences {
  userId: string;
  language?: string; 
  emailNotifications: {
    promotional: boolean;
  };
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}
