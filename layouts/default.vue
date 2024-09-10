<script setup>

  // local page items
  const drawer = ref(0)
  drawer.value = false

  // click the home link
  const clickHome = async () => {
    window.scrollTo(0,0)
    await navigateTo('/')
  }
</script>
<template>   
  <v-app theme="light">
    <v-app-bar density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="clickHome()">Transposer</v-app-bar-title>
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
