import mongoose, { Schema, Document } from 'mongoose';

export interface IShareableQuote extends Document {
  id: string;
  calcType: string;
  inputParameters: Record<string, any>;
  timestamp: Date;
}

const ShareableQuoteSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  calcType: { type: String, required: true },
  inputParameters: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.ShareableQuote || mongoose.model<IShareableQuote>('ShareableQuote', ShareableQuoteSchema);
