<script setup>
  const db = new PouchDB('transposer')
  const synced = useSynced()
  const syncing = useSyncing()
  const songsList = useSongsList()

  // only sync on first load
  if (!synced.value) {
    const remoteUrl = localStorage.getItem('remoteUrl')
    if (remoteUrl) {
      syncing.value = true
      PouchDB.sync('transposer', remoteUrl).on('change', function (info) {
        // handle change
        console.log('SYNC change', info)
      }).on('denied', function (err) {
        // a document failed to replicate (e.g. due to permissions)
        console.log('SYNC denied', err)
      }).on('complete', function (info) {
        // handle complete
        console.log('SYNC complete', info)
        // set flag so that we only sync once per load
        synced.value = true
        syncing.value = false
      }).on('error', function (err) {
        // handle error
        console.log('SYNC error', err)
      })
    }
  }

  // state
  const shuffleList = useShuffleList()

  // page items
  const songs = ref(0)
  songs.value = []
  const search = ref(1)
  search.value = ''
  if (window.location.hash) {
    search.value = decodeURIComponent(window.location.hash.replace('#', ''))
  }

  // sort by artist
  const sortFn = function (a, b) {
    if (a.artist < b.artist) {
      return -1
    } else if (a.artist > b.artist) {
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

  // fetch all songs from PouchDB
  const loadSongs = async () => {
    const songIds = []
    const response = await db.allDocs({ include_docs: true})
    songsList.value = response.rows.map((r) => {
      songIds.push(r.doc._id)
      return r.doc
    })
    shuffleList.value = shuffleArray(songIds)
    onUpdateSearch()
  }

  // whenever the searchbox changes
  const onUpdateSearch = () => {
    if (!search.value) {
      search.value = ''
    }
    const lc = search.value.toLowerCase()
    songs.value = songsList.value.filter((s) => {
      if (s.artist.toLowerCase().includes(lc) || s.song.toLowerCase().includes(lc)) {
        return true
      }
      return false
    }).sort(sortFn)
    window.location.hash = lc
  }

  // if we haven't already, load the songs
  if (shuffleList.value.length === 0) {
    console.log('Loading songs from PouchDB')
    await loadSongs()
  } else {
    onUpdateSearch()
  }
</script>
<template>  
  <v-text-field clearable @click:clear="onUpdateSearch" :label="'Search (' + songs.length + ')'" v-model="search" @update:modelValue="onUpdateSearch"></v-text-field>
  <v-card v-for="song in songs" variant="text" :ripple="false">
    <v-card-title @click="navigateTo('/song/' + song._id)">{{ song.song }}</v-card-title>
    <v-card-subtitle>{{ song.artist }}</v-card-subtitle>
  </v-card>
</template>
