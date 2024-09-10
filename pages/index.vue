<script setup>
  const db = new PouchDB('transposer')
  const remoteUrl = localStorage.getItem('remoteUrl')
  if (remoteUrl.value) {
    PouchDB.sync('transposer', remoteUrl)
  }

  // page items
  let allSongs = []
  const songs = ref(0)
  songs.value = []
  const search = ref(1)
  search.value = ''
  if (window.location.hash) {
    search.value = window.location.hash.replace('#', '')
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

  // fetch all songs from PouchDB
  const loadSongs = async () => {
    const response = await db.allDocs({ include_docs: true})
    allSongs = response.rows.map((r) => {
      return r.doc
    })
    allSongs = allSongs.sort(sortFn)
    onUpdateSearch()
  }

  // whenever the searchbox changes
  const onUpdateSearch = () => { 
    const lc = search.value.toLowerCase()
    songs.value = allSongs.filter((s) => {
      if (s.artist.toLowerCase().includes(lc) || s.song.toLowerCase().includes(lc)) {
        return true
      }
      return false
    })
    window.location.hash = lc
  }
  await loadSongs()
  
</script>
<template>  
  <v-text-field :label="'Search (' + songs.length + ')'" v-model="search" @update:modelValue="onUpdateSearch"></v-text-field>
  <v-card v-for="song in songs" variant="text" :href="'/song/' + song._id" :ripple="false">
    <v-card-title>{{ song.song }}</v-card-title>
    <v-card-subtitle>{{ song.artist }}</v-card-subtitle>
  </v-card>
</template>
