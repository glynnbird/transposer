<script setup>
  const route = useRoute()
  const { addSong, loadSong, deleteSong } = useSongsList()
  const song = ref({})
  const id = route.params.id

  // load the song
  song.value = await loadSong(id)

  // save the edited song
  const save = async () => {
    const id = await addSong(song.value)
    await navigateTo(`/song/${id}`)
  }

  const del = async () => {
    await deleteSong(song.value)
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
  <v-btn color="error" @click="del">Delete</v-btn>
</template>
