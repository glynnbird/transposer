export const useShuffleList = () => useState<object>('shuffleList', () => [])
export const useSynced = () => useState<boolean>('synced', () => false)
export const useSyncing = () => useState<boolean>('syncing', () => false)
