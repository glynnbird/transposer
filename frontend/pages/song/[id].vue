<script setup>
  const route = useRoute()
  const auth = useAuth()
  const song = ref(0)
  song.value = {}
  const transpose = ref(1)
  transpose.value = 6
  const transposedTab = ref(2)
  transposedTab.value = ''
  const transpositionAvailable = ref(3)
  transpositionAvailable.value = false

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  // transposition constants
  const TAB_LINE_REGEXP = new RegExp('^[ABCDEFGmbmajsusdim#976542/ ]+$')
  const CHORD_REGEXP = new RegExp('([ABCDEFGmbmajsusdim#76542]+)', 'g')
  const NOTE_REGEXP = new RegExp('^([ABCDEFG][#♭b]?)')
  const notesSharp = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
  const notesFlat = ['A', 'B♭', 'B', 'C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭']
  const notesFlatAlt = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab']

  // single-pass replace
  const multiReplace = (str, replacements) => {
    let j
    for (j in replacements) {
      str = str.replace(replacements[j][0], '__TOK' + j + '__')
    }
    for (j in replacements) {
      str = str.replace('__TOK' + j + '__', replacements[j][1])
    }
    return str
  }

  // transform note i by delta, with correct wrapping
  const transform = (i, delta) => {
    if (typeof delta === 'string') {
      delta = parseInt(delta)
    }
    i = i + delta
    if (i < 0) {
      i += 12
    }
    return i % 12
  }

  // transpose function
  const calculateTransposition = (tab, transpose) => {
    return tab.split('\n').map((l) => {
      // if this line only contains chords and spaces (not just spaces)
      if (l.match(TAB_LINE_REGEXP) && l.trim().length !== 0) {
        // find the chords on this line
        const matches = l.match(CHORD_REGEXP)
        const replacements = []
        for (var i in matches) {
          const m = matches[i]
          const note = m.match(NOTE_REGEXP)
          if (note) {
            const n1 = note[0]
            let n2 = n1
            const i1 = notesSharp.indexOf(n1)
            const i2 = notesFlat.indexOf(n1)
            const i3 = notesFlatAlt.indexOf(n1)
            if (i1 > -1) {
              n2 = notesSharp[transform(i1, transpose)]
            } else if (i2 > -1) {
              n2 = notesFlat[transform(i2, transpose)]
            } else if (i3 > -1) {
              n2 = notesFlatAlt[transform(i3, transpose)]
            }
            const n = m.replace(n1, n2)
            replacements.push([m, '<b>' + n + '</b>'])
          }
        }

        // do the replacements in one pass
        if (replacements.length > 0) {
          return multiReplace(l, replacements)
        }
      }
      return l
    }).join('\n')
  }

  const transposeChanged = () => {
    const dummy = calculateTransposition(song.value.tab, transpose.value - 6)
    // if the the transposition is different from the original then
    // there must be chords in the tab, so we need to show the
    // transposition slider
    if (dummy !== song.value.tab) {
      transpositionAvailable.value = true
    }
    transposedTab.value = dummy
  }

  const edit = async () => {
    await navigateTo(`/edit/${song.value.id}`)
  }

  const id = route.params.id
  try {

    // load songs from cache
    const v = localStorage.getItem(id)
    if (v) {
      try {
        song.value = JSON.parse(v)
      } catch {
        // oops
      }
    }
    setTimeout(async() => {
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
      console.log(song.value)
      localStorage.setItem(id, JSON.stringify(song.value))
    }, 1)

  } catch (e) {
    console.error('failed to fetch list of songs', e)
  }
  transposeChanged()
</script>
<style setup>
.output {
  font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace !important;
  font-size: 12px !important;
}
@media (width >= 1000px) {
  .newspaper {
  column-count: 2;
  }
}
.lyrics {
  white-space: pre;
  column-span: all;
}
a:link, a:visited, a:hover {
  color: black
}
</style>
<template>
  <h3>{{ song.song }} - <NuxtLink :to="'/#' + encodeURIComponent(song.artist)">{{ song.artist }}</NuxtLink> <v-btn @click="edit" variant="plain" density="compact" icon="mdi-pencil"></v-btn></h3>
  <v-slider v-if="transpositionAvailable" show-ticks="always" step="1" max="12" tick-size="6" v-model="transpose" @update:modelValue="transposeChanged()"></v-slider>
  <div class="newspaper output lyrics" v-html="transposedTab"></div>
</template>
