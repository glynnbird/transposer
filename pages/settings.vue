<script setup>
  const remoteUrl = ref(0)
  remoteUrl.value = ''

  // fetch last known remoteUrl from localStorage
  const savedUrl = localStorage.getItem('remoteUrl')
  if (savedUrl) {
    remoteUrl.value = savedUrl
  }

  // save new remoteUrl
  const saveRemoteUrl = async () => {
    localStorage.setItem('remoteUrl', remoteUrl.value)
    navigateTo('/')
  }

</script>
<template>
  <h2>Settings</h2>
  <v-form>
    <v-text-field v-model="remoteUrl" label="Remote Url" required></v-text-field>
    <v-btn :disabled="!remoteUrl" color="success" @click="saveRemoteUrl">Submit</v-btn>
  </v-form>
</template>
