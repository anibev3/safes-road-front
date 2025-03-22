export interface HistoryItem {
    id: string;
    timestamp: number;
    name: string;
    startLocation: string;
    endLocation: string;
    isFavorite: boolean;
}

export interface TripSummaryProps {
    routeId: string;
    onClose: () => void;
    tripStats: {
        avgSpeed: number;
        maxSpeed: number;
        risksAvoided: number;
        startTime: Date | null;
        endTime?: Date;
        pauseTime: number;
    };
}
