export const useShuffleList = () => useState<object>('shuffleList', () => [])
export const useSongsList = () => useState<object>('songsList', () => [])
export const useAuth = () => useState<object>('auth', () => { return { authenticated: false } })
