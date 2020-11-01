import { Schema, model, Document } from 'mongoose'
import { User } from './user.model'

export interface Notification extends Document {
  type: NotificationType
  sender: User['_id']
  receiver: User['_id']
  message: String
  read_by: {
    readerId: User['_id']
    reader_at: Date
  }
  creation_date: { type: Date; default: Date }
}

const NotificationSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'UserSchema' },
  receiver: [{ type: Schema.Types.ObjectId, ref: 'UserSchema' }],
  message: String,
  read_by: [
    {
      readerId: { type: Schema.Types.ObjectId, ref: 'UserSchema' },
      read_at: { type: Date, default: Date.now },
    },
  ],
  created_at: { type: Date, default: Date.now },
})

export const NotificationModel = model<Notification>(
  'Notification',
  NotificationSchema
)
