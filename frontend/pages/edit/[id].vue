<script setup>
  const db = new PouchDB('transposer')
  const route = useRoute()
  const song = ref(0)
  const id = route.params.id
  song.value = await db.get(id)

  const save = async () => {
    await db.put(song.value)
    await navigateTo(`/song/${song.value._id}`)
  }

  const deleteSong = async () => {
    await db.remove(song.value._id, song.value._rev)
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
