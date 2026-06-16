import mongoose, { Schema, Document } from 'mongoose';

export interface ICalculation extends Document {
  calcType: string;
  inputParameters: Record<string, any>;
  resultOutput: Record<string, any>;
  timestamp: Date;
  anonymousSessionId: string;
}

const CalculationSchema: Schema = new Schema({
  calcType: { type: String, required: true, index: true },
  inputParameters: { type: Schema.Types.Mixed, required: true },
  resultOutput: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  anonymousSessionId: { type: String, required: true, index: true },
});

export default mongoose.models.Calculation || mongoose.model<ICalculation>('Calculation', CalculationSchema);
