'use client';

import { useEffect, useState } from 'react';
import { Tournament, Match, Team } from '../types/tournament';
import { TournamentDB } from '../services/db';
import { createInitialTournament } from '../data/initialData';
import { calculateGroupStandings, generateQuarterFinals, generateSemiFinals, generateFinals } from '../utils/tournament';
import { FaTrophy, FaRedo, FaArrowRight, FaCheck, FaMedal } from 'react-icons/fa';

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

function MatchInput({ match, onUpdate }: { match: Match; onUpdate: (score1: number, score2: number) => void }) {
    const isTeam1Winner = match.completed && match.winner?.id === match.team1.id;
    const isTeam2Winner = match.completed && match.winner?.id === match.team2.id;

    return (
        <div className="card shadow-sm hover:shadow-lg transition-all" style={{ fontSize: '0.85rem' }}>
            <div className="card-body p-2">
                <div className="text-center mb-2">
                    <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>
                        {match.group ? `Bảng ${match.group}` : 'Vòng loại trực tiếp'}
                    </span>
                </div>
                <div className="mb-2">
                    <div className={`d-flex align-items-center justify-content-between p-1 rounded ${isTeam1Winner ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                        <div className="flex-grow-1 me-3">
                            <TeamDisplay team={match.team1} isWinner={isTeam1Winner} compact={true} />
                        </div>
                        <div className="score-input-wrapper">
                            <input
                                type="number"
                                className="form-control form-control-sm score-input"
                                min="0"
                                value={match.score1 ?? ''}
                                onChange={(e) => {
                                    const score1 = parseInt(e.target.value) || 0;
                                    const score2 = match.score2 ?? 0;
                                    onUpdate(score1, score2);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`d-flex align-items-center justify-content-between p-1 rounded mt-1 ${isTeam2Winner ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                        <div className="flex-grow-1 me-3">
                            <TeamDisplay team={match.team2} isWinner={isTeam2Winner} compact={true} />
                        </div>
                        <div className="score-input-wrapper">
                            <input
                                type="number"
                                className="form-control form-control-sm score-input"
                                min="0"
                                value={match.score2 ?? ''}
                                onChange={(e) => {
                                    const score2 = parseInt(e.target.value) || 0;
                                    const score1 = match.score1 ?? 0;
                                    onUpdate(score1, score2);
                                }}
                            />
                        </div>
                    </div>
                </div>
                {match.completed && (
                    <div className="text-center border-top pt-1">
                        <div className="d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.8rem' }}>
                            <FaCheck className="text-success" style={{ fontSize: '0.7rem' }} />
                            <span className="text-success">
                                Thắng: <TeamDisplay team={match.winner!} isWinner={true} compact={true} />
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Thêm styles cho tournament status
function TournamentStatus({ tournament }: { tournament: Tournament }) {
    const totalMatches = tournament.groups.reduce((acc, group) => acc + group.matches.length, 0) +
        tournament.quarterFinals.length + tournament.semiFinals.length +
        (tournament.final ? 1 : 0) + (tournament.thirdPlace ? 1 : 0);

    const completedMatches = tournament.groups.reduce((acc, group) =>
        acc + group.matches.filter(m => m.completed).length, 0) +
        tournament.quarterFinals.filter(m => m.completed).length +
        tournament.semiFinals.filter(m => m.completed).length +
        (tournament.final?.completed ? 1 : 0) +
        (tournament.thirdPlace?.completed ? 1 : 0);

    const progress = Math.round((completedMatches / totalMatches) * 100);

    return (
        <div className="d-flex align-items-center gap-3">
            <div className="progress flex-grow-1" style={{ height: '10px', minWidth: '200px' }}>
                <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <span className="text-muted small">
                {completedMatches}/{totalMatches} trận đã hoàn thành
            </span>
        </div>
    );
}

// Add new TournamentBracket component
function TournamentBracket({ tournament, onUpdateMatch }: {
    tournament: Tournament;
    onUpdateMatch: (match: Match, score1: number, score2: number) => void;
}) {
    return (
        <div className="tournament-bracket card shadow-sm">
            <div className="card-header bg-white py-3">
                <div className="d-flex align-items-center">
                    <FaTrophy className="text-warning me-2" />
                    <h5 className="mb-0">Sơ đồ giải đấu</h5>
                </div>
            </div>
            <div className="card-body position-relative">
                <div className="bracket-container">
                    {/* Quarter Finals */}
                    <div className="bracket-round">
                        <div className="bracket-title">Tứ kết</div>
                        <div className="bracket-matches">
                            {tournament.quarterFinals.map((match, index) => (
                                <div key={match.id} className="bracket-match">
                                    <MatchInput match={match} onUpdate={(s1, s2) => onUpdateMatch(match, s1, s2)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Semi Finals */}
                    <div className="bracket-round">
                        <div className="bracket-title">Bán kết</div>
                        <div className="bracket-matches">
                            {tournament.semiFinals.map((match, index) => (
                                <div key={match.id} className="bracket-match">
                                    <MatchInput match={match} onUpdate={(s1, s2) => onUpdateMatch(match, s1, s2)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Finals */}
                    <div className="bracket-round">
                        <div className="bracket-title">Chung kết</div>
                        <div className="bracket-matches">
                            {tournament.final && (
                                <div className="bracket-match">
                                    <MatchInput match={tournament.final} onUpdate={(s1, s2) => onUpdateMatch(tournament.final!, s1, s2)} />
                                </div>
                            )}
                            {tournament.thirdPlace && (
                                <div className="bracket-match mt-4">
                                    <div className="text-center mb-2">
                                        <span className="badge bg-bronze">Tranh hạng 3</span>
                                    </div>
                                    <MatchInput match={tournament.thirdPlace} onUpdate={(s1, s2) => onUpdateMatch(tournament.thirdPlace!, s1, s2)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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

    // Add new function to generate random scores
    function generateRandomScore(): { score1: number; score2: number } {
        const maxScore = 21;
        let score1, score2;

        do {
            score1 = Math.floor(Math.random() * maxScore);
            score2 = Math.floor(Math.random() * maxScore);
        } while (score1 === score2); // Ensure there's always a winner

        // Make sure at least one score is 21
        if (score1 > score2) {
            score1 = 21;
        } else {
            score2 = 21;
        }

        return { score1, score2 };
    }

    // Add function to automatically fill all matches with random scores
    async function autoFillRandomScores() {
        if (!tournament) return;

        const updatedTournament = { ...tournament };

        // Fill group matches
        updatedTournament.groups = tournament.groups.map(group => ({
            ...group,
            matches: group.matches.map(match => {
                if (!match.completed) {
                    const { score1, score2 } = generateRandomScore();
                    const winner = score1 > score2 ? match.team1 : match.team2;
                    return { ...match, score1, score2, winner, completed: true };
                }
                return match;
            })
        }));

        // Generate and fill quarter finals if needed
        if (updatedTournament.quarterFinals.length === 0) {
            updatedTournament.quarterFinals = generateQuarterFinals(updatedTournament);
        }

        // Fill quarter finals
        updatedTournament.quarterFinals = updatedTournament.quarterFinals.map(match => {
            if (!match.completed) {
                const { score1, score2 } = generateRandomScore();
                const winner = score1 > score2 ? match.team1 : match.team2;
                return { ...match, score1, score2, winner, completed: true };
            }
            return match;
        });

        // Generate and fill semi finals if needed
        if (updatedTournament.quarterFinals.every(m => m.completed) && updatedTournament.semiFinals.length === 0) {
            updatedTournament.semiFinals = generateSemiFinals(updatedTournament.quarterFinals);
        }

        // Fill semi finals
        updatedTournament.semiFinals = updatedTournament.semiFinals.map(match => {
            if (!match.completed) {
                const { score1, score2 } = generateRandomScore();
                const winner = score1 > score2 ? match.team1 : match.team2;
                return { ...match, score1, score2, winner, completed: true };
            }
            return match;
        });

        // Generate and fill finals if needed
        if (updatedTournament.semiFinals.every(m => m.completed) && !updatedTournament.final) {
            const finals = generateFinals(updatedTournament.semiFinals);
            updatedTournament.final = finals.final;
            updatedTournament.thirdPlace = finals.thirdPlace;
        }

        // Fill final and third place matches
        if (updatedTournament.final && !updatedTournament.final.completed) {
            const { score1, score2 } = generateRandomScore();
            const winner = score1 > score2 ? updatedTournament.final.team1 : updatedTournament.final.team2;
            updatedTournament.final = { ...updatedTournament.final, score1, score2, winner, completed: true };
        }

        if (updatedTournament.thirdPlace && !updatedTournament.thirdPlace.completed) {
            const { score1, score2 } = generateRandomScore();
            const winner = score1 > score2 ? updatedTournament.thirdPlace.team1 : updatedTournament.thirdPlace.team2;
            updatedTournament.thirdPlace = { ...updatedTournament.thirdPlace, score1, score2, winner, completed: true };
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
            {/* Enhanced Header */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top py-2">
                <div className="container-fluid max-width-1200">
                    <span className="navbar-brand fw-bold d-flex align-items-center">
                        <FaTrophy className="me-2" style={{ fontSize: '1.2rem' }} />
                        <span style={{ fontSize: '1rem' }}>ROLEX CHAMPION</span>
                    </span>
                    <div className="d-flex gap-2 align-items-center">
                        <button
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                            onClick={autoFillRandomScores}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <FaRedo className="me-1" style={{ fontSize: '0.7rem' }} />
                            Điền điểm ngẫu nhiên
                        </button>
                        <button
                            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                            onClick={resetTournament}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <FaRedo className="me-1" style={{ fontSize: '0.7rem' }} />
                            Khởi tạo lại
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content with Enhanced Layout */}
            <div className="container-fluid max-width-1200 py-3">
                <div className="card shadow-sm mb-3">
                    <div className="card-body py-2">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h5 className="mb-0" style={{ fontSize: '1.1rem' }}>Giải Cầu Lông ROLEX CHAMPION 2024</h5>
                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Theo dõi và cập nhật kết quả trực tiếp</p>
                            </div>
                            {tournament && <TournamentStatus tournament={tournament} />}
                        </div>
                    </div>
                </div>

                {/* Add Tournament Bracket before the group stage */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <TournamentBracket tournament={tournament} onUpdateMatch={updateMatch} />
                    </div>
                </div>

                <div className="row g-3">
                    {/* Group Stage */}
                    <div className="col-12 col-xxl-6">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white py-2">
                                <div className="d-flex align-items-center">
                                    <FaTrophy className="text-warning me-2" style={{ fontSize: '0.9rem' }} />
                                    <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>Vòng Bảng</h6>
                                </div>
                            </div>
                            <div className="card-body p-2">
                                <div className="row g-2">
                                    {tournament?.groups.map(group => (
                                        <div key={group.id} className="col-12 col-xl-6">
                                            <div className={`card group-card group-${group.name.split(' ')[1]}`}>
                                                <div className="card-header bg-white py-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h6 className="mb-0" style={{ fontSize: '0.85rem' }}>{group.name}</h6>
                                                        <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>
                                                            {group.matches.filter(m => m.completed).length}/{group.matches.length} trận
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="card-body p-2">
                                                    {/* Standings Table */}
                                                    <div className="table-responsive mb-2">
                                                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                                                            <thead className="bg-light">
                                                                <tr>
                                                                    <th style={{ minWidth: '150px', fontSize: '0.75rem' }}>Đội</th>
                                                                    <th className="text-center" style={{ width: '40px', fontSize: '0.75rem' }}>Đ</th>
                                                                    <th className="text-center" style={{ width: '40px', fontSize: '0.75rem' }}>T</th>
                                                                    <th className="text-center" style={{ width: '40px', fontSize: '0.75rem' }}>B</th>
                                                                    <th className="text-center" style={{ width: '40px', fontSize: '0.75rem' }}>HS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {calculateGroupStandings(group).map((standing, index) => {
                                                                    const allMatchesCompleted = group.matches.every(m => m.completed);
                                                                    const isQualified = allMatchesCompleted && index < 2;

                                                                    return (
                                                                        <tr key={standing.team.id} className={isQualified ? 'bg-success bg-opacity-10' : ''}>
                                                                            <td>
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    {isQualified && (
                                                                                        <FaCheck className="text-success" style={{ fontSize: '0.8rem' }} />
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

                                                    {/* Matches Section */}
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h6 className="mb-0" style={{ fontSize: '0.85rem' }}>Trận đấu</h6>
                                                        <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                                            {group.matches.filter(m => m.completed).length} trận đã hoàn thành
                                                        </span>
                                                    </div>
                                                    <div className="row g-2">
                                                        {group.matches.map(match => (
                                                            <div key={match.id} className="col-12">
                                                                <div className="match-input">
                                                                    <MatchInput
                                                                        match={match}
                                                                        onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                                    />
                                                                </div>
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
                    <div className="col-12 col-xxl-6">
                        <div className="row g-3">
                            {/* Quarter Finals */}
                            <div className="col-12">
                                <div className="card knockout-stage">
                                    <div className="card-header bg-white py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <FaArrowRight className="text-primary me-2" />
                                                <h5 className="mb-0">Tứ kết</h5>
                                            </div>
                                            {tournament?.quarterFinals.length > 0 && (
                                                <span className="badge bg-primary">
                                                    {tournament.quarterFinals.filter(m => m.completed).length}/4 trận
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {tournament?.quarterFinals.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div className="text-muted mb-2">
                                                    <FaArrowRight style={{ fontSize: '2rem' }} />
                                                </div>
                                                <p className="text-muted mb-0">
                                                    Tứ kết sẽ được tạo tự động sau khi hoàn thành vòng bảng
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="row g-3">
                                                {tournament?.quarterFinals.map(match => (
                                                    <div key={match.id} className="col-12 col-md-6">
                                                        <div className="knockout-match">
                                                            <MatchInput
                                                                match={match}
                                                                onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                            />
                                                        </div>
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
                                    <div className="card-header bg-white py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <FaArrowRight className="text-warning me-2" />
                                                <h5 className="mb-0">Bán kết</h5>
                                            </div>
                                            {tournament?.semiFinals.length > 0 && (
                                                <span className="badge bg-warning">
                                                    {tournament.semiFinals.filter(m => m.completed).length}/2 trận
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {tournament?.semiFinals.map(match => (
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
                                    <div className="card-header bg-white py-3">
                                        <div className="d-flex align-items-center">
                                            <FaTrophy className="text-warning me-2" />
                                            <h5 className="mb-0">Chung kết</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-4">
                                            {tournament?.final && (
                                                <div className="col-12 col-md-6">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <FaTrophy className="text-warning me-2" />
                                                        <h6 className="mb-0">Trận chung kết</h6>
                                                    </div>
                                                    <MatchInput
                                                        match={tournament.final}
                                                        onUpdate={(score1, score2) => updateMatch(tournament.final!, score1, score2)}
                                                    />
                                                </div>
                                            )}
                                            {tournament?.thirdPlace && (
                                                <div className="col-12 col-md-6">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <FaMedal className="text-bronze me-2" />
                                                        <h6 className="mb-0">Tranh hạng 3</h6>
                                                    </div>
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

            {/* Update custom styles */}
            <style jsx global>{`
                .max-width-1200 {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .card {
                    transition: all 0.2s ease;
                    border: none;
                }
                
                .card:hover {
                    transform: translateY(-1px);
                }

                .form-control {
                    border-radius: 4px;
                    padding: 0.35rem 0.5rem;
                    font-size: 0.8rem;
                    height: 28px;
                }

                .form-control:focus {
                    box-shadow: 0 0 0 0.15rem rgba(0,123,255,0.15);
                }
                
                .text-bronze {
                    color: #CD7F32;
                }
                
                .table th {
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    background-color: #f8f9fa;
                    font-size: 0.7rem;
                    padding: 0.5rem;
                }
                
                .progress {
                    border-radius: 8px;
                    background-color: #e9ecef;
                    height: 6px;
                }
                
                .progress-bar {
                    border-radius: 8px;
                    transition: width 0.6s ease;
                }

                .badge {
                    font-weight: 500;
                    padding: 0.25em 0.6em;
                    font-size: 0.75rem !important;
                }

                .table td {
                    padding: 0.4rem 0.5rem;
                    font-size: 0.75rem;
                }

                .card-header {
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    padding: 0.75rem;
                }

                /* Group styles */
                .group-card {
                    margin-bottom: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .group-A { 
                    background-color: rgba(255, 99, 132, 0.03);
                    border-left: 3px solid rgba(255, 99, 132, 0.5);
                }
                .group-B { 
                    background-color: rgba(54, 162, 235, 0.03);
                    border-left: 3px solid rgba(54, 162, 235, 0.5);
                }
                .group-C { 
                    background-color: rgba(255, 206, 86, 0.03);
                    border-left: 3px solid rgba(255, 206, 86, 0.5);
                }
                .group-D { 
                    background-color: rgba(75, 192, 192, 0.03);
                    border-left: 3px solid rgba(75, 192, 192, 0.5);
                }

                /* Match input styles */
                .match-input {
                    background-color: white;
                    border-radius: 6px;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .match-input:hover {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Knockout stage styles */
                .knockout-stage {
                    background-color: white;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(0,0,0,0.08);
                }

                .knockout-match {
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 6px;
                    padding: 0.75rem;
                    margin-bottom: 0.75rem;
                    background-color: #fcfcfc;
                }

                /* Consistent heading sizes */
                h5 { font-size: 0.95rem !important; }
                h6 { font-size: 0.85rem !important; }

                /* Table column widths */
                .table th:not(:first-child),
                .table td:not(:first-child) {
                    width: 40px;
                    text-align: center;
                }

                .table th:first-child,
                .table td:first-child {
                    min-width: 140px;
                }

                /* Match score inputs */
                .score-input-wrapper {
                    min-width: 60px;
                    margin-left: 8px;
                }
                
                .score-input {
                    width: 60px !important;
                    text-align: center;
                    padding: 0.25rem !important;
                    font-weight: 500;
                }

                .score-input::-webkit-inner-spin-button,
                .score-input::-webkit-outer-spin-button {
                    opacity: 1;
                    height: 24px;
                }

                /* Status badges */
                .status-badge {
                    font-size: 0.7rem;
                    padding: 0.2em 0.5em;
                }

                /* Group header */
                .group-header {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 0.75rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }

                .group-header h6 {
                    margin: 0;
                    font-size: 0.8rem;
                }

                /* Tournament Bracket Styles */
                .bracket-container {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px 0;
                    overflow-x: auto;
                }

                .bracket-round {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    min-width: 300px;
                    position: relative;
                }

                .bracket-title {
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #666;
                    margin-bottom: 10px;
                }

                .bracket-matches {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    position: relative;
                }

                .bracket-match {
                    position: relative;
                }

                /* Lines connecting matches */
                .bracket-matches::before {
                    content: '';
                    position: absolute;
                    right: -20px;
                    width: 20px;
                    border-top: 2px solid #ddd;
                    top: 50%;
                }

                .bracket-round:not(:last-child) .bracket-matches::after {
                    content: '';
                    position: absolute;
                    right: -20px;
                    height: calc(50% + 15px);
                    width: 2px;
                    background: #ddd;
                    top: 25%;
                }

                .bg-bronze {
                    background-color: #CD7F32 !important;
                    color: white;
                }

                /* Make the bracket container scrollable on mobile */
                @media (max-width: 1200px) {
                    .bracket-container {
                        padding-bottom: 20px;
                    }
                    
                    .bracket-round {
                        min-width: 280px;
                    }
                }
            `}</style>
        </div>
    );
} 