import React from 'react';
import { Team } from '../types/tournament';

// Define club colors
const CLUB_COLORS = {
    'ROLEX': 'primary',
    'TD': 'info',
    'Panda': 'warning'
} as const;

type ClubColor = typeof CLUB_COLORS[keyof typeof CLUB_COLORS];

function getClubColor(club: string): ClubColor {
    return CLUB_COLORS[club as keyof typeof CLUB_COLORS] || 'secondary';
}

interface TeamDisplayProps {
    team: Team;
    isWinner?: boolean;
    compact?: boolean;
}

export function TeamDisplay({ team, isWinner, compact = false }: TeamDisplayProps) {
    const clubColor = getClubColor(team.club);

    return (
        <div className="d-flex align-items-center gap-1">
            <span className={`badge bg-${clubColor} text-nowrap ${compact ? 'badge-sm' : ''}`}
                style={{
                    minWidth: compact ? '35px' : '40px',
                    fontSize: compact ? '0.7rem' : '0.75rem',
                    padding: compact ? '0.2rem 0.4rem' : '0.25rem 0.5rem'
                }}>
                {team.club}
            </span>
            <span className={`${isWinner ? 'text-success' : ''} text-truncate`}
                style={{
                    fontSize: compact ? '0.8rem' : '0.85rem',
                    fontWeight: 500
                }}>
                {team.name}
            </span>
        </div>
    );
} 