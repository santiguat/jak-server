import { Request } from 'express';
import { Document } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  friends?: [User['_id']];
  notifications?: [];
  since: Date;
}

export interface Notification extends Document {
  type: string;
  content: string;
}

export interface FriendUserModel {
  requestedUser: User;
  currentUser: User;
}

export interface FriendNameModel {
  currentUser: User;
  friendName: string;
}

export interface NotificationType {
  type: string;
}

export interface RequestBody<T> extends Request {
  body: T;
}
