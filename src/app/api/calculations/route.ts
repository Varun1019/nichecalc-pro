import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calculation from '@/models/Calculation';

// Server-side in-memory cache fallback when MongoDB is disconnected or MONGODB_URI is undefined
interface InMemoryLog {
  calcType: string;
  inputParameters: any;
  resultOutput: any;
  timestamp: Date;
  anonymousSessionId: string;
}

const inMemoryDb: InMemoryLog[] = [];
const MAX_FALLBACK_ENTRIES = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcType, inputParameters, resultOutput, anonymousSessionId } = body;

    if (!calcType || !inputParameters || !resultOutput || !anonymousSessionId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const db = await dbConnect();

    const logEntry = {
      calcType,
      inputParameters,
      resultOutput,
      timestamp: new Date(),
      anonymousSessionId,
    };

    if (db) {
      // Save to MongoDB
      const savedDoc = await Calculation.create(logEntry);
      return NextResponse.json({ success: true, data: savedDoc });
    } else {
      // Fallback: Save to server-side memory
      inMemoryDb.unshift(logEntry);
      if (inMemoryDb.length > MAX_FALLBACK_ENTRIES) {
        inMemoryDb.pop();
      }
      return NextResponse.json({ success: true, source: 'in-memory-fallback', data: logEntry });
    }
  } catch (error: any) {
    console.error('Error logging calculation:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const calcType = searchParams.get('calcType');
    const anonymousSessionId = searchParams.get('anonymousSessionId');

    if (!calcType || !anonymousSessionId) {
      return NextResponse.json({ success: false, error: 'Missing calcType or anonymousSessionId' }, { status: 400 });
    }

    const db = await dbConnect();

    if (db) {
      // Fetch from MongoDB
      const results = await Calculation.find({ calcType, anonymousSessionId })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();
      return NextResponse.json({ success: true, data: results });
    } else {
      // Fetch from in-memory fallback
      const results = inMemoryDb
        .filter((entry) => entry.calcType === calcType && entry.anonymousSessionId === anonymousSessionId)
        .slice(0, 5);
      return NextResponse.json({ success: true, source: 'in-memory-fallback', data: results });
    }
  } catch (error: any) {
    console.error('Error fetching calculation history:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
