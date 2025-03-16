import { Tournament, Match } from '../types/tournament';
import { Card, Typography, Badge, Tag, Space, Divider } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface TournamentBracketProps {
    tournament: Tournament;
}

function MatchBox({ match }: { match: Match }) {
    if (!match) return null;

    const isTeam1Winner = match.completed && match.winner?.id === match.team1.id;
    const isTeam2Winner = match.completed && match.winner?.id === match.team2.id;

    return (
        <Card
            size="small"
            className="w-80 hover:shadow-lg transition-shadow duration-300"
            styles={{ body: { padding: '12px' } }}
        >
            <div className="space-y-3">
                <div className="text-center mb-2">
                    <Tag color="purple">{match.group ? `Bảng ${match.group}` : 'Vòng loại trực tiếp'}</Tag>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge status={isTeam1Winner ? "success" : "default"} />
                            <Space size={4}>
                                <Tag color="blue">{match.team1.club}</Tag>
                                <Text strong className="block text-base truncate">{match.team1.name}</Text>
                            </Space>
                        </div>
                        <Text strong className="text-lg ml-2">{match.score1 ?? '-'}</Text>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge status={isTeam2Winner ? "success" : "default"} />
                            <Space size={4}>
                                <Tag color="blue">{match.team2.club}</Tag>
                                <Text strong className="block text-base truncate">{match.team2.name}</Text>
                            </Space>
                        </div>
                        <Text strong className="text-lg ml-2">{match.score2 ?? '-'}</Text>
                    </div>
                </div>
                {match.completed && (
                    <div className="pt-2 border-t text-center">
                        <Space>
                            <TrophyOutlined style={{ color: '#52c41a' }} />
                            <Space size={4}>
                                <Tag color="green">{match.winner?.club}</Tag>
                                <Text type="success" strong>{match.winner?.name}</Text>
                            </Space>
                        </Space>
                    </div>
                )}
            </div>
        </Card>
    );
}

export default function TournamentBracket({ tournament }: TournamentBracketProps) {
    return (
        <div className="tournament-bracket relative min-h-[800px] overflow-x-auto">
            <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                <svg className="w-full h-full">
                    {/* Quarter Finals to Semi Finals */}
                    {tournament.quarterFinals.map((_, index) => {
                        if (index % 2 === 0) {
                            const y1 = 120 + index * 200;
                            const y2 = 220 + Math.floor(index / 2) * 400;
                            return (
                                <g key={`q-${index}`}>
                                    <path
                                        d={`M 320 ${y1} L 380 ${y1} Q 400 ${y1} 400 ${y1 + 20} 
                           L 400 ${y2 - 20} Q 400 ${y2} 420 ${y2} L 480 ${y2}`}
                                        className="match-line"
                                    />
                                </g>
                            );
                        }
                        return null;
                    })}

                    {/* Semi Finals to Final */}
                    {tournament.semiFinals.map((_, index) => {
                        if (index % 2 === 0) {
                            const y1 = 220 + index * 400;
                            return (
                                <g key={`s-${index}`}>
                                    <path
                                        d={`M 800 ${y1} L 860 ${y1} Q 880 ${y1} 880 ${y1 + 20}
                           L 880 ${420 - 20} Q 880 ${420} 900 ${420} L 960 ${420}`}
                                        className="match-line"
                                    />
                                </g>
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>

            <div className="relative grid grid-cols-4 gap-x-16" style={{ zIndex: 1 }}>
                {/* Quarter Finals */}
                <div className="space-y-24 py-8">
                    <Title level={5} className="text-center mb-8">Tứ kết</Title>
                    {tournament.quarterFinals.map((match, index) => (
                        <div key={match.id} className="flex justify-center">
                            <MatchBox match={match} />
                        </div>
                    ))}
                </div>

                {/* Semi Finals */}
                <div className="space-y-48 py-32">
                    <Title level={5} className="text-center mb-8">Bán kết</Title>
                    {tournament.semiFinals.map((match, index) => (
                        <div key={match.id} className="flex justify-center">
                            <MatchBox match={match} />
                        </div>
                    ))}
                </div>

                {/* Finals */}
                <div className="col-span-2 py-48">
                    <div className="space-y-24">
                        {tournament.final && (
                            <div>
                                <Title level={5} className="text-center mb-8">Chung kết</Title>
                                <div className="flex justify-center">
                                    <MatchBox match={tournament.final} />
                                </div>
                            </div>
                        )}
                        {tournament.thirdPlace && (
                            <div>
                                <Title level={5} className="text-center mb-8">Tranh hạng 3</Title>
                                <div className="flex justify-center">
                                    <MatchBox match={tournament.thirdPlace} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 