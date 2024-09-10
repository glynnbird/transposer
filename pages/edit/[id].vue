<script setup>
  const db = new PouchDB('transposer')
  const route = useRoute()
  const song = ref(0)
  const id = route.params.id
  song.value = await db.get(id)
  
</script>
<template>
  <h3>Edit {{ song.song }} - {{ song.artist }}</h3>
  
</template>
