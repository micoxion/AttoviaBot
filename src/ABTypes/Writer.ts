export type Writer = {
    userId: string,
    username: string,
    streak: number,
    longestStreak: number,
    wordCount: number,
    lastTimeWrote: Date | null
}