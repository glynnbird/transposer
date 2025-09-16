const SONG_CACHE_KEY = 'songcache'

export default function () {

  const songsList = useState('songsList', () => [])
  const shuffleList = useState('shuffleList', () => [])
  const stick = useState('stick', () => { return false })
  const shufflePick = useState('shufflePick', () => 0)
  const { auth } = useAuth()
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  }

  // load a song from cache or API
  async function loadSongFromAPI(id) {
    const r = await $fetch(`${apiHome}/api/get`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      },
      body: JSON.stringify({ id })
    })
    localStorage.setItem(id, JSON.stringify(r.doc))
    return r.doc
  }

  // load a song from cache, and/or API
  async function loadSong(id) {
    let song = {}
    const v = localStorage.getItem(id)
    let reload = false
    if (v) {
      try {
        song = JSON.parse(v)
        // locate the song in the songsList
        let found = false
        for (let i = 0; i < songsList.value.length; i++) {
          const s = songsList.value[i]
          if (s.id === id) {
            // if our cached hash is different from the songsList
            // we need to reload it from Cloudflare KV
            if (song.hash !== s.hash) {
              reload = true
            }
            found = true
            break
          }
        }
        if (!found) {
          reload = true
        }
      } catch {
        // oops
        reload = true
      }
    } else {
      reload = true
    }

    if (reload) {
      //  fetch the list from the API
      song = await loadSongFromAPI(id)
    }
    return song
  }

  // find an id in an array
  const locateIndex = (id, arr) => {
    let i
    for (i in arr) {
      if (id === arr[i].id) {
        return i
      }
    }
    return -1
  }

  // add a new song
  async function addSong(song) {
    let id
    try {
      //  fetch the list from the API
      console.log('API', '/add', `${apiHome}/api/add`)
      console.log('Saving song', song)
      const r = await $fetch(`${apiHome}/api/add`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify(song)
      })
      console.log('response', r)

      // if this is an edit
      if (song.id) {
        console.log('editing our copy of the song')
        let i
        i = locateIndex(song.id, songsList.value)
        if (i !== -1) {
          songsList.value[i] = song
        }
        i = locateIndex(song.id, shuffleList.value)
        if (i !== -1) {
          shuffleList.value[i] = song
        }
        id = song.id
      } else {
        console.log('adding song to the lists')
        id = r.id
        song.id = id
        songsList.value.push(song)
        shuffleList.value.push(song)
      }
    } catch (e) {
      console.error('failed to edit song', e)
    }
    console.log('returning', id)
    return id
  }

  // delete a song
  async function deleteSong(song) {
    try {
      //  fetch the list from the API
      console.log('API', '/del', `${apiHome}/api/del`)
      const r = await $fetch(`${apiHome}/api/del`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify(song)
      })
      console.log('Response', r)
      localStorage.removeItem(song.id)


      let i
      i = locateIndex(song.id, songsList.value)
      if (i !== -1) {
        songsList.value.splice(i, 1)
      }
      i = locateIndex(song.id, shuffleList.value)
      if (i !== -1) {
        shuffleList.value.splice(i, 1)
      }
    } catch (e) {
      console.error('failed to delete song', e)
    }
  }

  // load songs from the API
  async function loadSongListFromAPI() {
    try {
      //  fetch the list from the API
      console.log('API', '/list', `${apiHome}/api/list`)
      const r = await $fetch(`${apiHome}/api/list`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        }
      })
      songsList.value.concat(r.list)
      localStorage.setItem(SONG_CACHE_KEY, JSON.stringify(r.list))
    } catch (e) {
      console.error('failed to fetch list of songs', e)
    }
  }

  // load the data from the cache & the API, but only the first time this is invoked
  if (stick.value === false && songsList.value.length === 0) {

    // load existing progs from localStorage
    console.log('loading from cache')
    const cache = localStorage.getItem(SONG_CACHE_KEY)
    if (cache) {
      songsList.value = JSON.parse(cache)
    }

    // then later get fresh data from the API
    setTimeout(async () => {
      console.log('loading from API')
      await loadSongListFromAPI()
      shuffleList.value = shuffleArray(JSON.parse(JSON.stringify(songsList.value)))
      stick.value = true
    }, 1)
  }

  function incShufflePick() {
    shufflePick.value = ++shufflePick.value % shuffleList.value.length
  }

  return { songsList, shuffleList, loadSong, addSong, deleteSong, shufflePick, incShufflePick }
}
