import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { suggestion } = body;

        if (!suggestion || typeof suggestion !== 'string') {
            return NextResponse.json({ error: 'Suggestion is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('brijanya');
        const collection = db.collection('suggestions');

        await collection.insertOne({
            suggestion,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Suggestion saved successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Failed to save suggestion:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
