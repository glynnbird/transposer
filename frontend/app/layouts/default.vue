<script setup>
  // state
  const { shuffleList } = useSongsList()
  const { isLoggedIn } = useAuth()

  let pick = 0

  // local page items
  const drawer = ref(false)

  // click the home link
  const clickHome = async () => {
    window.scrollTo(0,0)
    await navigateTo('/')
  }

  const shuffle = async () => {
    const id = shuffleList.value[pick].id
    pick++
    pick = pick % shuffleList.value.length
    await navigateTo(`/song/${id}`)
  }
</script>
<template>   
  <v-app theme="light">
    <v-app-bar density="compact" color="#9C27B0">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="clickHome()" style="user-select:none;">Transposer</v-app-bar-title>
      <template v-slot:append v-if="shuffleList.length > 0">
        <v-btn icon="mdi-shuffle" @click="shuffle"></v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left">
      <v-list>
        <v-list-item v-if="isLoggedIn()" prepend-icon="mdi-home" title="Home" @click="clickHome()"></v-list-item>
        <v-list-item v-if="isLoggedIn()" prepend-icon="mdi-plus" title="Add" @click="navigateTo('/add')"></v-list-item>
        <v-list-item v-if="isLoggedIn()" prepend-icon="mdi-logout" title="Logout" @click="navigateTo('/logout')"></v-list-item>
        <v-list-item v-if="!isLoggedIn()" prepend-icon="mdi-login" title="Login" @click="navigateTo('/login')"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
