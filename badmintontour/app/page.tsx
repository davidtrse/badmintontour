'use client';

import { useEffect, useState } from 'react';
import { Tournament, Match, Team } from '../types/tournament';
import { TournamentDB } from '../services/db';
import { createInitialTournament } from '../data/initialData';
import { calculateGroupStandings, generateQuarterFinals, generateSemiFinals, generateFinals } from '../utils/tournament';
import { FaTrophy, FaRedo, FaArrowRight, FaCheck } from 'react-icons/fa';

const db = new TournamentDB();

// Định nghĩa màu sắc cho từng câu lạc bộ
const CLUB_COLORS = {
    'ROLEX': 'primary',
    'TD': 'info',
    'Panda': 'warning'
} as const;

type ClubColor = typeof CLUB_COLORS[keyof typeof CLUB_COLORS];

function getClubColor(club: string): ClubColor {
    return CLUB_COLORS[club as keyof typeof CLUB_COLORS] || 'secondary';
}

function TeamDisplay({ team, isWinner = false, compact = false }: { team: Team; isWinner?: boolean; compact?: boolean }) {
    const clubColor = getClubColor(team.club);

    return (
        <div className="d-flex align-items-center gap-2">
            <span className={`badge bg-${clubColor} text-nowrap ${compact ? 'badge-sm' : ''}`} style={{ minWidth: compact ? '40px' : '50px' }}>{team.club}</span>
            <span className={`fw-bold ${isWinner ? 'text-success' : ''} text-truncate`}>{team.name}</span>
        </div>
    );
}

function MatchInput({ match, onUpdate }: { match: Match; onUpdate: (score1: number, score2: number) => void }) {
    const isTeam1Winner = match.completed && match.winner?.id === match.team1.id;
    const isTeam2Winner = match.completed && match.winner?.id === match.team2.id;

    return (
        <div className="card shadow-sm hover:shadow-lg transition-all">
            <div className="card-body p-3">
                <div className="text-center mb-2">
                    <span className="badge bg-primary">{match.group ? `Bảng ${match.group}` : 'Vòng loại trực tiếp'}</span>
                </div>
                <div className="mb-3">
                    <div className={`d-flex align-items-center justify-content-between p-2 rounded ${isTeam1Winner ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                        <div className="flex-grow-1 me-2">
                            <TeamDisplay team={match.team1} isWinner={isTeam1Winner} />
                        </div>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            value={match.score1 ?? ''}
                            onChange={(e) => {
                                const score1 = parseInt(e.target.value) || 0;
                                const score2 = match.score2 ?? 0;
                                onUpdate(score1, score2);
                            }}
                            style={{ width: '45px', padding: '0.25rem' }}
                        />
                    </div>
                    <div className={`d-flex align-items-center justify-content-between p-2 rounded mt-2 ${isTeam2Winner ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                        <div className="flex-grow-1 me-2">
                            <TeamDisplay team={match.team2} isWinner={isTeam2Winner} />
                        </div>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            value={match.score2 ?? ''}
                            onChange={(e) => {
                                const score2 = parseInt(e.target.value) || 0;
                                const score1 = match.score1 ?? 0;
                                onUpdate(score1, score2);
                            }}
                            style={{ width: '45px', padding: '0.25rem' }}
                        />
                    </div>
                </div>
                {match.completed && (
                    <div className="text-center border-top pt-2">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <FaCheck className="text-success" />
                            <span className="text-success">
                                Người thắng: <TeamDisplay team={match.winner!} isWinner={true} />
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TournamentPage() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTournament();
    }, []);

    async function loadTournament() {
        try {
            setLoading(true);
            const savedTournament = await db.getTournament();
            if (savedTournament) {
                setTournament(savedTournament);
            } else {
                const initial = createInitialTournament();
                await db.saveTournament(initial);
                setTournament(initial);
            }
        } catch (error) {
            console.error('Error loading tournament:', error);
        } finally {
            setLoading(false);
        }
    }

    async function resetTournament() {
        try {
            setLoading(true);
            // Reset tournament in database
            await db.resetTournament();
            // Create new initial tournament
            const initial = createInitialTournament();
            // Save new tournament
            await db.saveTournament(initial);
            // Update state
            setTournament(initial);
            // Show success message using alert
            window.alert('Giải đấu đã được khởi tạo lại thành công!');
        } catch (error) {
            console.error('Error resetting tournament:', error);
            window.alert('Có lỗi xảy ra khi khởi tạo lại giải đấu!');
        } finally {
            setLoading(false);
        }
    }

    async function updateMatch(match: Match, score1: number, score2: number) {
        if (!tournament) return;

        const winner = score1 > score2 ? match.team1 : match.team2;
        const updatedMatch = { ...match, score1, score2, winner, completed: true };

        const updatedTournament = { ...tournament };

        // Update match in the appropriate round
        if (match.round === 'group') {
            updatedTournament.groups = tournament.groups.map(group => {
                if (group.id === match.group) {
                    return {
                        ...group,
                        matches: group.matches.map(m => m.id === match.id ? updatedMatch : m)
                    };
                }
                return group;
            });

            // Check if all group matches are completed to generate quarter finals
            const allGroupMatchesCompleted = updatedTournament.groups.every(group =>
                group.matches.every(m => m.completed)
            );

            if (allGroupMatchesCompleted && updatedTournament.quarterFinals.length === 0) {
                updatedTournament.quarterFinals = generateQuarterFinals(updatedTournament);
            }
        } else if (match.round === 'quarter') {
            updatedTournament.quarterFinals = tournament.quarterFinals.map(m =>
                m.id === match.id ? updatedMatch : m
            );

            // Generate semi-finals if all quarter-finals are complete
            if (updatedTournament.quarterFinals.every(m => m.completed)) {
                updatedTournament.semiFinals = generateSemiFinals(updatedTournament.quarterFinals);
            }
        } else if (match.round === 'semi') {
            updatedTournament.semiFinals = tournament.semiFinals.map(m =>
                m.id === match.id ? updatedMatch : m
            );

            // Generate finals if all semi-finals are complete
            if (updatedTournament.semiFinals.every(m => m.completed)) {
                const finals = generateFinals(updatedTournament.semiFinals);
                updatedTournament.final = finals.final;
                updatedTournament.thirdPlace = finals.thirdPlace;
            }
        } else if (match.round === 'final') {
            updatedTournament.final = updatedMatch;
        } else if (match.round === 'third') {
            updatedTournament.thirdPlace = updatedMatch;
        }

        await db.saveTournament(updatedTournament);
        setTournament(updatedTournament);
    }

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="alert alert-danger" role="alert">
                    Error loading tournament
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
                <div className="container-fluid max-width-1440">
                    <span className="navbar-brand fw-bold">
                        <FaTrophy className="me-2" />
                        ROLEX CHAMPION
                    </span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-danger btn-sm" onClick={resetTournament}>
                            <FaRedo className="me-1" /> Reset
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container-fluid max-width-1440 py-4">
                <div className="row g-4">
                    {/* Group Stage */}
                    <div className="col-12 col-xxl-7">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Vòng Bảng</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    {/* Group Stage */}
                                    {tournament.groups.map(group => (
                                        <div key={group.id} className="col-12 col-xl-6">
                                            <div className="card h-100">
                                                <div className="card-header bg-white">
                                                    <h6 className="mb-0">{group.name}</h6>
                                                </div>
                                                <div className="card-body">
                                                    {/* Standings Table */}
                                                    <div className="table-responsive mb-4">
                                                        <table className="table table-sm table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ minWidth: '180px' }}>Đội</th>
                                                                    <th className="text-center" style={{ width: '50px' }}>Đ</th>
                                                                    <th className="text-center" style={{ width: '50px' }}>T</th>
                                                                    <th className="text-center" style={{ width: '50px' }}>B</th>
                                                                    <th className="text-center" style={{ width: '50px' }}>HS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {calculateGroupStandings(group).map((standing, index) => {
                                                                    const allMatchesCompleted = group.matches.every(m => m.completed);
                                                                    const isQualified = allMatchesCompleted && index < 2;

                                                                    return (
                                                                        <tr key={standing.team.id}>
                                                                            <td>
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    {isQualified && (
                                                                                        <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                                                    )}
                                                                                    <TeamDisplay team={standing.team} compact={true} />
                                                                                </div>
                                                                            </td>
                                                                            <td className="text-center fw-bold">{standing.points}</td>
                                                                            <td className="text-center text-success">{standing.matchesWon}</td>
                                                                            <td className="text-center text-danger">{standing.matchesLost}</td>
                                                                            <td className="text-center">{standing.scoreDifference}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <h6 className="mb-3">Trận đấu</h6>
                                                    <div className="row g-3">
                                                        {group.matches.map(match => (
                                                            <div key={match.id} className="col-12">
                                                                <MatchInput
                                                                    match={match}
                                                                    onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Knockout Stages */}
                    <div className="col-12 col-xxl-5">
                        <div className="row g-4">
                            {/* Quarter Finals */}
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Tứ kết</h5>
                                    </div>
                                    <div className="card-body">
                                        {tournament.quarterFinals.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                Tứ kết sẽ được tạo tự động sau khi hoàn thành vòng bảng
                                            </div>
                                        ) : (
                                            <div className="row g-3">
                                                {tournament.quarterFinals.map(match => (
                                                    <div key={match.id} className="col-12 col-md-6">
                                                        <MatchInput
                                                            match={match}
                                                            onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Semi Finals */}
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Bán kết</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {tournament.semiFinals.map(match => (
                                                <div key={match.id} className="col-12 col-md-6">
                                                    <MatchInput
                                                        match={match}
                                                        onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Finals */}
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Chung kết</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {tournament.final && (
                                                <div className="col-12 col-md-6">
                                                    <h6 className="mb-3">Trận chung kết</h6>
                                                    <MatchInput
                                                        match={tournament.final}
                                                        onUpdate={(score1, score2) => updateMatch(tournament.final!, score1, score2)}
                                                    />
                                                </div>
                                            )}
                                            {tournament.thirdPlace && (
                                                <div className="col-12 col-md-6">
                                                    <h6 className="mb-3">Tranh hạng 3</h6>
                                                    <MatchInput
                                                        match={tournament.thirdPlace}
                                                        onUpdate={(score1, score2) => updateMatch(tournament.thirdPlace!, score1, score2)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 