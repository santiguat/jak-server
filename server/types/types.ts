import { Document } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  friends?: [User['_id']];
  notifications?: [];
  since: Date;
}

export interface GeneralMessage {
  content: string;
  username: string;
  date: string;
}

export interface Notification extends Document {
  type: string;
  content: string;
}
