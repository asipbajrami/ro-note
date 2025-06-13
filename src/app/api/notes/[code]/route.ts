import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for notes - organized by code
const notesStorage: Map<string, Array<{ id: string; content: string; timestamp: number; title?: string }>> = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const notes = notesStorage.get(code) || [];
  
  return NextResponse.json({ notes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { content, title } = await request.json();
  
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  
  const existingNotes = notesStorage.get(code) || [];
  const newNote = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    content,
    title: title || '',
    timestamp: Date.now()
  };
  
  const updatedNotes = [...existingNotes, newNote];
  notesStorage.set(code, updatedNotes);
  
  return NextResponse.json({ note: newNote });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('id');
  
  if (!noteId) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }
  
  const existingNotes = notesStorage.get(code) || [];
  const updatedNotes = existingNotes.filter(note => note.id !== noteId);
  notesStorage.set(code, updatedNotes);
  
  return NextResponse.json({ success: true });
} 