export const useShuffleList = () => useState<object>('shuffleList', () => [])
export const useSynced = () => useState<boolean>('synced', () => false)
