import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ShareableQuote from '@/models/ShareableQuote';

// Server-side fallback dictionary map for sharing when MongoDB is disconnected
const inMemoryShareDb = new Map<string, { calcType: string; inputParameters: any }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcType, inputParameters } = body;

    if (!calcType || !inputParameters) {
      return NextResponse.json({ success: false, error: 'Missing calcType or inputParameters' }, { status: 400 });
    }

    // Generate unique 6-character short ID
    const shortId = Math.random().toString(36).substring(2, 8).toLowerCase();

    const db = await dbConnect();

    if (db) {
      // Save to MongoDB
      await ShareableQuote.create({
        id: shortId,
        calcType,
        inputParameters,
      });
    } else {
      // Fallback: Save to memory
      inMemoryShareDb.set(shortId, { calcType, inputParameters });
      console.log(`Saved share link in-memory fallback. ID: ${shortId}`);
    }

    return NextResponse.json({ success: true, id: shortId });
  } catch (error: any) {
    console.error('Error creating shareable link:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id query parameter' }, { status: 400 });
    }

    const db = await dbConnect();
    let quote = null;

    if (db) {
      // Fetch from MongoDB
      quote = await ShareableQuote.findOne({ id }).lean();
    } else {
      // Fetch from in-memory map
      const memoryQuote = inMemoryShareDb.get(id);
      if (memoryQuote) {
        quote = {
          id,
          calcType: memoryQuote.calcType,
          inputParameters: memoryQuote.inputParameters,
        };
      }
    }

    if (!quote) {
      return NextResponse.json({ success: false, error: 'Link configuration not found or expired.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Error fetching shareable link:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
