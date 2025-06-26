<script setup>
  const auth = useAuth()
  const songsList = useSongsList()
  const song = ref({
    song: '',
    artist: '',
    tab: ''
  })

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  const save = async () => {
    let id
    try {
      //  fetch the list from the API
      console.log('API', '/add', `${apiHome}/api/add`)
      console.log('Saving song', song.value)
      const r = await $fetch(`${apiHome}/api/add`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify(song.value)
      })
      id = r.id
      song.value.id = id
      songsList.value.push(song.value)
    } catch (e) {
      console.error('failed to edit song', e)
    }
    await navigateTo(`/song/${id}`)
  }
  
</script>
<style setup>
textarea {
  font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace !important;
  font-size: 12px !important;
  height: 500px
}
</style>
<template>
  <h3>Edit</h3>
  <v-text-field label="Song name" v-model="song.song"></v-text-field>
  <v-text-field label="Artist" v-model="song.artist"></v-text-field>
  <v-textarea label="Tab" v-model="song.tab"></v-textarea>
  <v-btn :disabled="!song.artist || !song.song" color="success" @click="save">Save</v-btn>
</template>
