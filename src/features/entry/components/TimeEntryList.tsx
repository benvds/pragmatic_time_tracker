import { useEffect, useState } from 'react';
import type { TimeEntry } from '@/features/entry/types';
import { TimeEntryCard } from './TimeEntryCard';

const STORAGE_KEY = "time-tracker-data";

export const TimeEntryList = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const entriesArray = Array.isArray(parsed) ? parsed : [];
        // Sort by date (newest first)
        entriesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(entriesArray);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();

    // Listen for storage changes (when entries are saved)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadEntries();
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleEntryUpdate = () => {
      loadEntries();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('timeEntryUpdated', handleEntryUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('timeEntryUpdated', handleEntryUpdate);
    };
  }, []);

  const handleDelete = (id: string) => {
    try {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('timeEntryUpdated'));
    } catch (error) {
      console.error('Failed to delete time entry:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading time entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h3>No Time Entries Yet</h3>
        <p>Your saved time entries will appear here. Start by adding your first entry above!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Recent Time Entries ({entries.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.map(entry => (
          <TimeEntryCard
            key={entry.id}
            entry={entry}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
