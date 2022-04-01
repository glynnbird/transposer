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

// copy to Clipboard helper
const cc = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

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

// constants
const TAB_LINE_REGEXP = new RegExp('^[ABCDEFGmbmajsusdim#976542/ ]+$')
const CHORD_REGEXP = new RegExp('([ABCDEFGmbmajsusdim#76542]+)', 'g')
const NOTE_REGEXP = new RegExp('^([ABCDEFG][#♭b]?)')
const notesSharp = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const notesFlat = ['A', 'B♭', 'B', 'C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭']
const notesFlatAlt = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab']

// PouchDB database
const db = new PouchDB('tabs')

// Vue.js App
var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    mode: 'tablist',
    url: '',
    sync: null,
    tabs: [],
    singletab: {},
    transpose: 0,
    transposeItems: [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    newtab: {
      artist: '',
      song: '',
      tab: ''
    },
    edittab: {
      doc: {},
      i: 0
    },
    search: '',
    shuffleList: [],
    shufflePos: 0,
    selectedArtist: null
  },
  methods: {
    clearSearch: function () {
      this.selectedArtist = null
    },
    quickSearch: function (str) {
      this.search = str
      this.mode = 'tablist'
      window.scrollTo(0, 0)
    },
    copyToClipboard: function () {
      cc(this.output.replace(/<b>/mg, '').replace(/<\/b>/mg, ''))
    },
    startReplication: async function () {
      try {
        const doc = await db.get('_local/config')
        if (doc.url) {
          this.url = doc.url
          if (this.sync) {
            this.sync.cancel()
          }
          this.sync = db.sync(doc.url)
          this.sync.on('change', function (info) {
            if (info.direction === 'pull') {
              for (var i in info.change.docs) {
                var c = info.change.docs[i]
                let found = false
                for (var j in app.tabs) {
                  if (app.tabs[j]._id === c._id) {
                    if (c._deleted) {
                      Vue.delete(app.tabs, j)
                    } else {
                      Vue.set(app.tabs, j, c)
                    }
                    found = true
                    break
                  }
                }
                if (!found) {
                  app.tabs.push(c)
                  this.mode = 'tablist'
                }
              }
            }
          })
        }
      } catch (e) {
        console.log('No config found')
      }
    },
    settings: function () {
      this.mode = 'settings'
    },
    shuffleArray: function (array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array
    },
    primeShuffle: function () {
      const len = this.tabs.length
      const arr = []
      for (let i = 0; i < len; i++) {
        arr.push(i)
      }
      this.shuffleArray(arr)
      this.shuffleList = arr
      this.shufflePos = 0
    },
    shuffle: function () {
      if (this.shuffleList.length !== this.tabs.length) {
        this.primeShuffle()
      }
      this.viewTab(this.tabs[this.shuffleList[this.shufflePos]]._id)
      this.shufflePos++
      if (this.shufflePos >= this.tabs.length) {
        this.shufflePos = 0
      }
    },
    settingsSubmit: async function () {
      if (this.url) {
        const obj = {
          _id: '_local/config',
          url: this.url
        }
        const response = await db.put(obj)
        await this.startReplication()
      }
      this.mode = 'tablist'
    },
    newTab: function () {
      this.newtab.artist = ''
      this.newtab.song = ''
      this.newtab.tab = ''
      this.mode = 'newtabform'
    },
    newTabSubmit: async function () {
      if (this.newtab.song && this.newtab.artist && this.newtab.tab) {
        const response = await db.post(this.newtab)
        const obj = {}
        Object.assign(obj, this.newtab)
        obj._id = response.id
        obj._rev = response.rev
        this.tabs.push(obj)
        this.mode = 'tablist'
      }
    },
    home: function () {
      this.mode = 'tablist'
      this.search = ''
      this.selectedArtist = ''
      window.scrollTo(0, 0)
    },
    deleteTab: async function (id) {
      for (var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          await db.remove(id, this.tabs[i]._rev)
          Vue.delete(this.tabs, i)
          this.mode = 'tablist'
          break
        }
      }
    },
    editTab: function (id) {
      for (var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          this.edittab.doc = this.tabs[i]
          this.edittab.i = i
          this.mode = 'edittabform'
          break
        }
      }
    },
    editTabSubmit: async function () {
      const response = await db.put(this.edittab.doc)
      this.edittab.doc._rev = response.rev
      this.tabs[this.edittab.i]._rev = response.rev
      this.mode = 'tablist'
    },
    viewTab: function (id) {
      for (var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          this.singletab = this.tabs[i]
          this.mode = 'singletab'
          break
        }
      }
      window.scrollTo(0, 0)
    }
  },
  mounted: async function () {
    const allDocs = await db.allDocs({ include_docs: true })
    for (var i in allDocs.rows) {
      this.tabs.push(allDocs.rows[i].doc)
    }
    this.startReplication()
  },
  computed: {
    artistList: function () {
      let retval = []
      for (var i in this.tabs) {
        const t = this.tabs[i]
        if (t.artist && !retval.includes(t.artist)) {
          retval.push(t.artist)
        }
      }
      return retval.sort()
    },
    filteredTabs: function () {
      let retval = []
      if (!this.search || this.search.trim() === '') {
        retval = this.tabs
      } else {
        const s = this.search.toLowerCase().trim()
        for (var i in this.tabs) {
          const t = this.tabs[i]
          if (t.artist.toLowerCase().includes(s) || t.song.toLowerCase().includes(s)) {
            retval.push(t)
          }
        }
      }
      const sorter = function (a, b) {
        if (!a.artist || !b.artist) {
          return 0
        }
        const A = a.artist.toLowerCase().replace(/^the /, '') + a.song.toLowerCase()
        const B = b.artist.toLowerCase().replace(/^the /, '') + b.song.toLowerCase()
        if (A < B) {
          return -1
        } else if (A === B) {
          return 0
        } else {
          return 1
        }
      }
      return retval.sort(sorter)
    },
    output: function () {
      if (!this.singletab && !this.singletab.tab) {
        return ''
      }
      const markdown = this.singletab.tab.split('\n').map((l) => {
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
                n2 = notesSharp[transform(i1, this.transpose)]
              } else if (i2 > -1) {
                n2 = notesFlat[transform(i2, this.transpose)]
              } else if (i3 > -1) {
                n2 = notesFlatAlt[transform(i3, this.transpose)]
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
      return markdown
    }
  }
})
