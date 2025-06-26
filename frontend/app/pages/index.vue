<script setup>
  const { $pwa } = useNuxtApp()

  // constants
  const SONG_CACHE_KEY = 'songcache'

  //state
  const songsList = useSongsList()
  const auth = useAuth()

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  // state
  const shuffleList = useShuffleList()

  // page items
  const search = ref('')
  if (window.location.hash) {
    search.value = decodeURIComponent(window.location.hash.replace('#', ''))
  }
  const syncing = ref(false)

  // sort by artist/song
  const sortFn = function (a, b) {
    const A = a.artist + a.song
    const B = b.artist + b.song
    if (A < B) {
      return -1
    } else if (A > B) {
      return 1
    }
    return 0
  }

  // randomise the order of an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  }

  // fetch all songs from Cloudflare
  const loadSongs = async () => {
    try {
      //  fetch the list from the API
      console.log('API', '/list', `${apiHome}/api/list`)
      syncing.value = true
      const r = await useFetch(`${apiHome}/api/list`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        }
      })
      songsList.value = r.data.value.list.map((r) => {
        return r
      })
      localStorage.setItem(SONG_CACHE_KEY, JSON.stringify(songsList.value))
      syncing.value = false
    } catch (e) {
      console.error('failed to fetch list of songs', e)
    }
    shuffleList.value = shuffleArray(JSON.parse(JSON.stringify(songsList.value)))
  }

  // whenever the searchbox changes
  const songs = computed(() => {
    let sv = search.value
    if (!sv) {
      sv = ''
    }
    const lc = sv.toLowerCase().trim()
    // update the browser # url if needed
    if (lc !== window.location.hash) {
      window.location.hash = lc
    }
    
    // if there's no filter, return the shuffle list
    if (!sv) {
      return shuffleList.value
    }

    // return the song list filtered to match the contents of the search box
    return songsList.value.filter((s) => {
      if (!s.artist || !s.song) {
        return false
      }
      if (s.artist.toLowerCase().includes(lc) || s.song.toLowerCase().includes(lc)) {
        return true
      }
      return false
    }).sort(sortFn)
  })

  // if we haven't already, load the songs
  if (shuffleList.value.length === 0) {
    // load songs from cache
    const v = localStorage.getItem(SONG_CACHE_KEY)
    if (v) {
      console.log('restoring songs from cache')
      songsList.value = JSON.parse(v)
      shuffleList.value = songsList.value
    }
    
    // in the background
    setTimeout(async () => {
      // load songs from the API
      await loadSongs()
    }, 1)

  }
</script>
<template>
  <v-alert color="warning" v-show="$pwa.needRefresh">
    <h4> New content available, click on reload button to update. </h4>
    <v-btn color="primary" @click="$pwa.updateServiceWorker()">Reload</v-btn>
  </v-alert>  
  <v-progress-linear v-if="syncing" color="yellow-darken-2" indeterminate ></v-progress-linear>
  <v-text-field clearable :label="'Search (' + songs.length + ')'" v-model="search"></v-text-field>
  <v-card v-for="song in songs" variant="text" :ripple="false">
    <v-card-title @click="navigateTo('/song/' + song.id)">{{ song.song }}</v-card-title>
    <v-card-subtitle>{{ song.artist }}</v-card-subtitle>
  </v-card>
</template>
