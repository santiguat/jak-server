import { Schema, model, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  friends?: [User['_id']];
  notifications?: [];
  since: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  friends: [Number],
  notifications: [],
  since: Date,
});

export default model<User>('User', UserSchema);
