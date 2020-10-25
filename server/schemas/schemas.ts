import  { Schema, model } from "mongoose";
import { User } from "../types/types";

const notification = model('Notification', new Schema({
  type: String,
  content: String,
}))

export const UserSchema: Schema<User> = new Schema({
    id: Number,
    username: String,
    password: String,
    friends: [Number],
    notifications: [
      { type: Schema.Types.ObjectId, ref: 'Notification'}
    ],
    since: Date,
  });


  export interface GeneralMessage  {
    content: string;
    username: string;
    date: string;
  };
  
  export interface Notification {
    type: string,
    content: string
  };