<script setup>
  // state
  const shuffleList = useShuffleList()
  const syncing = useSyncing()
  let pick = 0

  // local page items
  const drawer = ref(0)
  drawer.value = false

  // click the home link
  const clickHome = async () => {
    window.scrollTo(0,0)
    await navigateTo('/')
  }

  const shuffle = async () => {
    const id = shuffleList.value[pick]
    pick++
    pick = pick % shuffleList.value.length
    await navigateTo(`/song/${shuffleList.value[pick]}`)
  }
</script>
<template>   
  <v-app theme="light">
    <v-app-bar density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="clickHome()">Transposer</v-app-bar-title>
      <template v-slot:append v-if="shuffleList.length > 0">
        <v-progress-circular color="primary" indeterminate v-if="syncing" :size="22"></v-progress-circular>
        <v-btn icon="mdi-shuffle" @click="shuffle"></v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left">
      <v-list>
        <v-list-item prepend-icon="mdi-home" title="Home" @click="clickHome()"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Settings" @click="navigateTo('/settings')"></v-list-item>
        <v-list-item prepend-icon="mdi-plus" title="Add" @click="navigateTo('/add')"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
