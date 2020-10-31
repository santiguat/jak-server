import { Schema, model, Document } from 'mongoose';

export interface GeneralMessage extends Document {
  content: String;
  username: String;
  date: Date;
}

const GeneralMessageSchema: Schema = new Schema({
  content: { type: String, unique: true, required: true },
  type: { type: String, required: true },
  date: Date,
});

export default model<GeneralMessage>('GeneralMessage', GeneralMessageSchema);
