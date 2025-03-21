import React, { useState } from 'react';
import { Modal, Input, Button, Space } from 'antd';
import { Team } from '../types/tournament';
import { TeamDisplay } from './TeamDisplay';

interface ScoreInputModalProps {
    match: {
        team1: Team;
        team2: Team;
        score1?: number;
        score2?: number;
    };
    visible: boolean;
    onCancel: () => void;
    onOk: (score1: number, score2: number) => void;
}

export default function ScoreInputModal({ match, visible, onCancel, onOk }: ScoreInputModalProps) {
    const [score1, setScore1] = useState<string>(match.score1?.toString() ?? '');
    const [score2, setScore2] = useState<string>(match.score2?.toString() ?? '');

    const handleOk = () => {
        const numScore1 = parseInt(score1) || 0;
        const numScore2 = parseInt(score2) || 0;
        onOk(numScore1, numScore2);
        onCancel();
    };

    return (
        <Modal
            title="Nhập tỷ số trận đấu"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="ok" type="primary" onClick={handleOk}>
                    Xác nhận
                </Button>
            ]}
        >
            <div className="space-y-4">
                <div className="flex items-center">
                    <div className="team-name-container">
                        <TeamDisplay team={match.team1} compact={true} />
                    </div>
                    <div className="score-input-container">
                        <Input
                            type="number"
                            min={0}
                            value={score1}
                            onChange={(e) => setScore1(e.target.value)}
                            className="score-input"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="team-name-container">
                        <TeamDisplay team={match.team2} compact={true} />
                    </div>
                    <div className="score-input-container">
                        <Input
                            type="number"
                            min={0}
                            value={score2}
                            onChange={(e) => setScore2(e.target.value)}
                            className="score-input"
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .space-y-4 > div {
                    padding: 0.5rem 0;
                }

                .team-name-container {
                    width: 200px;
                    margin-right: 1rem;
                }

                .score-input-container {
                    width: 200px;
                }

                .score-input {
                    text-align: center;
                }

                :global(.ant-input) {
                    height: 40px;
                    padding: 0 12px;
                    font-size: 1.1rem;
                    font-weight: 500;
                }

                :global(.ant-input::-webkit-inner-spin-button),
                :global(.ant-input::-webkit-outer-spin-button) {
                    opacity: 1;
                    height: 40px;
                    width: 24px;
                }

                :global(.ant-input::-webkit-inner-spin-button) {
                    right: 4px;
                }

                :global(.ant-input::-webkit-outer-spin-button) {
                    left: 4px;
                }
            `}</style>
        </Modal>
    );
} 