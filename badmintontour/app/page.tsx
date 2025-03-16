'use client';

import { useEffect, useState } from 'react';
import { Tournament, Match, Team } from '../types/tournament';
import { TournamentDB } from '../services/db';
import { createInitialTournament } from '../data/initialData';
import { calculateGroupStandings, generateQuarterFinals, generateSemiFinals, generateFinals } from '../utils/tournament';
import TournamentBracket from '../components/TournamentBracket';
import { Card, Input, Button, Table, Layout, Typography, Space, Badge, Spin, Alert, InputNumber, Tag, Row, Col } from 'antd';
import { TrophyOutlined, ReloadOutlined, RightOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const db = new TournamentDB();

function MatchInput({ match, onUpdate }: { match: Match; onUpdate: (score1: number, score2: number) => void }) {
    const isTeam1Winner = match.completed && match.winner?.id === match.team1.id;
    const isTeam2Winner = match.completed && match.winner?.id === match.team2.id;

    return (
        <Card
            className="hover:shadow-lg transition-shadow duration-300"
            size="small"
            variant="outlined"
            style={{ width: '100%', maxWidth: '300px' }}
        >
            <div className="space-y-4">
                <div className="text-center">
                    <Tag color="purple">{match.group ? `Bảng ${match.group}` : 'Vòng loại trực tiếp'}</Tag>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge status={isTeam1Winner ? "success" : "default"} />
                            <div className="min-w-0 flex-1">
                                <Space size={4}>
                                    <Tag color="blue">{match.team1.club}</Tag>
                                    <Text strong className="block text-base">{match.team1.name}</Text>
                                </Space>
                            </div>
                        </div>
                        <InputNumber
                            min={0}
                            size="small"
                            value={match.score1 ?? undefined}
                            onChange={(value) => {
                                const score1 = value || 0;
                                const score2 = match.score2 ?? 0;
                                onUpdate(score1, score2);
                            }}
                            className="w-16"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge status={isTeam2Winner ? "success" : "default"} />
                            <div className="min-w-0 flex-1">
                                <Space size={4}>
                                    <Tag color="blue">{match.team2.club}</Tag>
                                    <Text strong className="block text-base">{match.team2.name}</Text>
                                </Space>
                            </div>
                        </div>
                        <InputNumber
                            min={0}
                            size="small"
                            value={match.score2 ?? undefined}
                            onChange={(value) => {
                                const score2 = value || 0;
                                const score1 = match.score1 ?? 0;
                                onUpdate(score1, score2);
                            }}
                            className="w-16"
                        />
                    </div>
                </div>
                {match.completed && (
                    <div className="pt-2 border-t text-center">
                        <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text type="success">
                                Người thắng: <Space size={4}>
                                    <Tag color="green">{match.winner?.club}</Tag>
                                    <Text strong>{match.winner?.name}</Text>
                                </Space>
                            </Text>
                        </Space>
                    </div>
                )}
            </div>
        </Card>
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
            await db.resetTournament();
            const initial = createInitialTournament();
            await db.saveTournament(initial);
            setTournament(initial);
        } catch (error) {
            console.error('Error resetting tournament:', error);
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

    function generateQuarterFinalsHandler() {
        if (!tournament) return;
        const quarterFinals = generateQuarterFinals(tournament);
        const updatedTournament = { ...tournament, quarterFinals };
        db.saveTournament(updatedTournament);
        setTournament(updatedTournament);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert
                    message="Error"
                    description="Error loading tournament"
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    const columns = [
        {
            title: 'Đội',
            dataIndex: 'team',
            key: 'team',
            render: (team: Team, record: any, index: number) => (
                <Space>
                    {index < 2 && <Badge status="success" />}
                    <Space size={4}>
                        <Tag color="blue">{team.club}</Tag>
                        <Text strong>{team.name}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            key: 'points',
            align: 'center' as const,
            render: (points: number) => <Text strong>{points}</Text>,
        },
        {
            title: 'Thắng',
            dataIndex: 'matchesWon',
            key: 'matchesWon',
            align: 'center' as const,
            render: (won: number) => <Text type="success">{won}</Text>,
        },
        {
            title: 'Thua',
            dataIndex: 'matchesLost',
            key: 'matchesLost',
            align: 'center' as const,
            render: (lost: number) => <Text type="danger">{lost}</Text>,
        },
        {
            title: 'Hiệu số',
            dataIndex: 'scoreDifference',
            key: 'scoreDifference',
            align: 'center' as const,
        },
    ];

    return (
        <Layout className="min-h-screen">
            <Header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 flex justify-between items-center h-full">
                    <div className="flex items-center">
                        <Title level={3} style={{ margin: 0 }}>ROLEX CHAMPION</Title>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            danger
                            icon={<ReloadOutlined />}
                            onClick={resetTournament}
                        >
                            reset
                        </Button>
                        <Button
                            type="text"
                            onClick={() => {
                                const testMatch = tournament.groups[0].matches[0];
                                updateMatch(testMatch, 21, 19);
                            }}
                        >
                            auto test
                        </Button>
                    </div>
                </div>
            </Header>

            <Content className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Group Stage */}
                    <div className="lg:col-span-2">
                        <Title level={4}>Vòng Bảng</Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tournament.groups.map(group => (
                                <Card
                                    key={group.id}
                                    title={group.name}
                                    className="hover:shadow-lg transition-shadow duration-300"
                                    size="small"
                                >
                                    <Space direction="vertical" className="w-full" size="small">
                                        <Table
                                            columns={columns}
                                            dataSource={calculateGroupStandings(group).map(s => ({
                                                ...s,
                                                key: s.team.id,
                                                team: s.team,
                                            }))}
                                            pagination={false}
                                            size="small"
                                        />

                                        <Title level={5}>Trận đấu</Title>
                                        <Row gutter={16}>
                                            {group.matches.map(match => (
                                                <Col key={match.id} span={8}>
                                                    <MatchInput
                                                        match={match}
                                                        onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Space>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quarter Finals */}
                    <div>
                        <Card
                            title={
                                <div className="flex justify-between items-center">
                                    <Title level={4} style={{ margin: 0 }}>Tứ kết</Title>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<RightOutlined />}
                                        onClick={generateQuarterFinalsHandler}
                                        disabled={tournament.quarterFinals.length > 0}
                                    >
                                        Tạo trận
                                    </Button>
                                </div>
                            }
                            className="hover:shadow-lg transition-shadow duration-300"
                            size="small"
                        >
                            <div className="space-y-4">
                                {[0, 2].map(startIdx => (
                                    <Row key={startIdx} gutter={16}>
                                        {tournament.quarterFinals.slice(startIdx, startIdx + 2).map(match => (
                                            <Col key={match.id} span={12}>
                                                <MatchInput
                                                    match={match}
                                                    onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Semi Finals */}
                    <div>
                        <Card
                            title={<Title level={4}>Bán kết</Title>}
                            className="hover:shadow-lg transition-shadow duration-300"
                            size="small"
                        >
                            <Row gutter={16}>
                                {tournament.semiFinals.map(match => (
                                    <Col key={match.id} span={12}>
                                        <MatchInput
                                            match={match}
                                            onUpdate={(score1, score2) => updateMatch(match, score1, score2)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </div>

                    {/* Finals */}
                    <div>
                        <Card
                            title={<Title level={4}>Chung kết</Title>}
                            className="hover:shadow-lg transition-shadow duration-300"
                            size="small"
                        >
                            <Row gutter={16}>
                                {tournament.final && (
                                    <Col span={12}>
                                        <Title level={5}>Trận chung kết</Title>
                                        <MatchInput
                                            match={tournament.final}
                                            onUpdate={(score1, score2) => updateMatch(tournament.final!, score1, score2)}
                                        />
                                    </Col>
                                )}
                                {tournament.thirdPlace && (
                                    <Col span={12}>
                                        <Title level={5}>Tranh hạng 3</Title>
                                        <MatchInput
                                            match={tournament.thirdPlace}
                                            onUpdate={(score1, score2) => updateMatch(tournament.thirdPlace!, score1, score2)}
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    </div>
                </div>
            </Content>
        </Layout>
    );
} 