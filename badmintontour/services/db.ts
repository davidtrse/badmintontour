import { Tournament, Team, Match } from '../types/tournament';

const DB_NAME = 'badmintonTournament';
const DB_VERSION = 1;
const STORE_NAME = 'tournament';

export class TournamentDB {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        if (this.db) return; // Already initialized

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                    console.log('Object store created');
                }
            };
        });
    }

    async saveTournament(tournament: Tournament): Promise<void> {
        try {
            if (!this.db) await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(tournament, 'currentTournament');

                request.onerror = () => {
                    console.error('Error saving tournament:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    console.log('Tournament saved successfully');
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error in saveTournament:', error);
            throw error;
        }
    }

    async getTournament(): Promise<Tournament | null> {
        try {
            if (!this.db) await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get('currentTournament');

                request.onerror = () => {
                    console.error('Error getting tournament:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    console.log('Tournament retrieved successfully');
                    resolve(request.result);
                };
            });
        } catch (error) {
            console.error('Error in getTournament:', error);
            throw error;
        }
    }

    async resetTournament(): Promise<void> {
        try {
            if (!this.db) await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // Clear all data from the store
                const clearRequest = store.clear();

                clearRequest.onerror = () => {
                    console.error('Error clearing tournament data:', clearRequest.error);
                    reject(clearRequest.error);
                };

                clearRequest.onsuccess = () => {
                    console.log('Tournament data cleared successfully');
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error in resetTournament:', error);
            throw error;
        }
    }
} 