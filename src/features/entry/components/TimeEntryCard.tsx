import type { TimeEntry } from '@/features/entry/types';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours for accurate comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const TimeEntryCard = ({ entry, onDelete }: TimeEntryCardProps) => {
  const handleDelete = () => {
    if (window.confirm(`Delete time entry for ${formatDate(entry.date)}?`)) {
      onDelete(entry.id);
    }
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  };

  const durationStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2563eb',
  };

  const projectStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#333',
    marginBottom: '8px',
    lineHeight: '1.4',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#999',
  };

  const deleteButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={headerStyle}>
        <span style={dateStyle}>{formatDate(entry.date)}</span>
        <span style={durationStyle}>{formatDuration(entry.duration)}</span>
      </div>

      <div style={projectStyle}>Project: {entry.project}</div>
      <div style={descriptionStyle}>{entry.description}</div>

      <div style={footerStyle}>
        <span style={timestampStyle}>
          Created {new Date(entry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <button
          style={deleteButtonStyle}
          onClick={handleDelete}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
