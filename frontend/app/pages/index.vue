<script setup>
  const { $pwa } = useNuxtApp()


  //state
  const { songsList, shuffleList, shufflePick } = useSongsList()

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
      return songsList.value.sort(sortFn)
    }

    // return the song list filtered to match the contents of the search box
    if (songsList) {
      return songsList.value.filter((s) => {
        if (!s.artist || !s.song) {
          return false
        }
        if (s.artist.toLowerCase().includes(lc) || s.song.toLowerCase().includes(lc)) {
          return true
        }
        return false
      }).sort(sortFn)
    } else {
      return []
    }
  })

</script>
<template>
  <v-alert color="warning" v-show="$pwa.needRefresh">
    <h4> New content available, click on reload button to update. </h4>
    <v-btn color="primary" @click="$pwa.updateServiceWorker()">Reload</v-btn>
  </v-alert>  
  <v-progress-linear v-if="syncing" color="yellow-darken-2" indeterminate ></v-progress-linear>

  <v-row>
    <v-col>
      <v-text-field clearable :label="'Search (' + songs.length + ')'" v-model="search"></v-text-field>
      <v-card v-for="song in songs" variant="text" :ripple="false" :key="song.id">
        <v-card-title @click="navigateTo('/song/' + song.id)">{{ song.song }}</v-card-title>
        <v-card-subtitle>{{ song.artist }}</v-card-subtitle>
      </v-card>
    </v-col>
    <v-col>
      <v-sheet color="green-lighten-3" style="padding:10px">
        <v-card v-for="song in shuffleList.slice(shufflePick)" variant="text" color="grey-darken-2" :ripple="false" :key="`shuffle${song.id}`">
          <v-card-title @click="navigateTo('/song/' + song.id)">{{ song.song }}</v-card-title>
          <v-card-subtitle>{{ song.artist }}</v-card-subtitle>
        </v-card>
      </v-sheet>
    </v-col>
  </v-row>
</template>
