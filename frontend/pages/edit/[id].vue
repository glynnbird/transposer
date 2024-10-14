<script setup>
  const route = useRoute()
  const auth = useAuth()
  const song = ref(0)
  const id = route.params.id

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  try {
    //  fetch the list from the API
    console.log('API', '/get', `${apiHome}/api/get`)
    const r = await useFetch(`${apiHome}/api/get`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      },
      body: JSON.stringify({ id })
    })
    song.value = r.data.value.doc
  } catch (e) {
    console.error('failed to fetch list of songs', e)
  }

  const save = async () => {
    try {
      //  fetch the list from the API
      console.log('API', '/add', `${apiHome}/api/add`)
      const r = await useFetch(`${apiHome}/api/add`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify(song.value)
      })
    } catch (e) {
      console.error('failed to fetch list of songs', e)
    }
    await navigateTo(`/song/${song.value.id}`)
  }

  const deleteSong = async () => {
    // not implemented yet
    //await db.remove(song.value._id, song.value._rev)
    await navigateTo('/')
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
  <v-btn :disabled="!song.artist || !song.song" color="success" @click="save">Edit Tab</v-btn>
  <br /><br />

  <v-btn color="error" @click="deleteSong">Delete</v-btn>
</template>
