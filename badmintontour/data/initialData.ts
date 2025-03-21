import { Team, Group, Tournament, Match } from '../types/tournament';

export const initialTeams = {
    'A': [
        { id: 'A1', name: 'Hoàng-Thủy', club: 'TD', players: ['Hoàng', 'Thủy'] },
        { id: 'A2', name: 'Tùng-Vân', club: 'TD', players: ['Tùng', 'Vân'] },
        { id: 'A3', name: 'Thành-chị Bình', club: 'ROLEX', players: ['Thành', 'chị Bình'] },
        { id: 'A4', name: 'Ngọc Hiếu-Thanh', club: 'ACE', players: ['Ngọc Hiếu', 'Thanh'] }
    ],
    'B': [
        { id: 'B1', name: 'a. Thắng-Linh Đan', club: 'ROLEX', players: ['a. Thắng', 'Linh Đan'] },
        { id: 'B2', name: 'Tiến-Hải', club: 'TD', players: ['Tiến', 'Hải'] },
        { id: 'B3', name: 'a Hồng-bạn a Hồng', club: 'ROLEX', players: ['a Hồng', 'bạn a Hồng'] },
        { id: 'B4', name: 'Thương (Ty)-Linh', club: 'ROLEX', players: ['Thương (Ty)', 'Linh'] }
    ],
    'C': [
        { id: 'C1', name: 'Minh-Lan', club: 'ROLEX', players: ['Minh', 'Lan'] },
        { id: 'C2', name: 'a Hoàng Anh-Tuyết', club: 'ROLEX', players: ['a Hoàng Anh', 'Tuyết'] },
        { id: 'C3', name: 'Quang-Bảo Trân', club: 'ROLEX', players: ['Quang', 'Bảo Trân'] },
        { id: 'C4', name: 'Khánh - Hiếu Lê', club: 'ROLEX', players: ['Khánh', 'Hiếu Lê'] }
    ],
    'D': [
        { id: 'D1', name: 'Hiếu-Trúc', club: 'TD', players: ['Hiếu', 'Trúc'] },
        { id: 'D2', name: 'Hiệp-chị Hòa', club: 'ROLEX', players: ['Hiệp', 'chị Hòa'] },
        { id: 'D3', name: 'Hoàng Hiếu-Diễm', club: 'ROLEX', players: ['Hoàng Hiếu', 'Diễm'] },
        { id: 'D4', name: 'Tuyên-Ngân', club: 'PANDA', players: ['Tuyên', 'Ngân'] }
    ]
};

export function generateGroupMatches(teams: Team[], groupId: string): Match[] {
    const matches: Match[] = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                id: `${groupId}-${i}-${j}`,
                team1: teams[i],
                team2: teams[j],
                group: groupId,
                round: 'group' as const,
                completed: false,
            });
        }
    }
    return matches;
}

export function createInitialTournament(): Tournament {
    const groups: Group[] = Object.entries(initialTeams).map(([groupId, teams]) => ({
        id: groupId,
        name: `Bảng ${groupId}`,
        teams,
        matches: generateGroupMatches(teams, groupId),
    }));

    return {
        groups,
        quarterFinals: [],
        semiFinals: [],
        final: null,
        thirdPlace: null,
    };
}