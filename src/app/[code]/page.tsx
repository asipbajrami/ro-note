'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Note {
  id: string;
  content: string;
  title?: string;
  timestamp: number;
}

export default function NotesPage() {
  const params = useParams();
  const code = params.code as string;
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes/${code}`);
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote,
          title: newTitle,
        }),
      });

      if (response.ok) {
        setNewNote('');
        setNewTitle('');
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${code}?id=${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    fetchNotes();
  }, [code]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      saveNote();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Notes Collection
          </h1>
          <p className="text-gray-600">
            Code: <span className="font-mono bg-white px-3 py-1 rounded-full text-indigo-600 font-semibold">{code}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Share this URL to let others access these notes
          </p>
        </div>

        {/* New Note Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">✍️ Write a New Note</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Start writing your note here... (Ctrl/Cmd + Enter to save)"
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + Enter</kbd> to save quickly
              </p>
              <button
                onClick={saveNote}
                disabled={!newNote.trim() || isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h3>
              <p className="text-gray-500">Create your first note above to get started!</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📚 Your Notes ({notes.length})
              </h2>
              {notes
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        {note.title && (
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {note.title}
                          </h3>
                        )}
                        <p className="text-sm text-gray-500">
                          {formatDate(note.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                        {note.content}
                      </pre>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 