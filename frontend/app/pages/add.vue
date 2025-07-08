<script setup>
  const { addSong } = useSongsList()
  
  const song = ref({
    song: '',
    artist: '',
    tab: ''
  })

  const save = async () => {
    const id = await addSong(song.value)
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
