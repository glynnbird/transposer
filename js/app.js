Vue.use(VueMaterial.default)

// single-pass replace
const multiReplace = (str, replacements) => {
  let j
  for(j in replacements) {
    str = str.replace(replacements[j][0], '__TOK' + j + '__')
  }
  for(j in replacements) {
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
const TAB_LINE_REGEXP = new RegExp('^[ABCDEFGmbmajsusdim#97654/ ]+$')
const CHORD_REGEXP = new RegExp('([ABCDEFGmbmajsusdim#7654]+)', 'g')
const NOTE_REGEXP = new RegExp('^([ABCDEFG][#♭b]?)')
const notesSharp = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const notesFlat = ['A', 'B♭', 'B', 'C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭']
const notesFlatAlt = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab']

// PouchDB database
const db = new PouchDB('tabs')

// Vue.js App
var app = new Vue({
  el: '#app',
  data: {
    mode: 'tablist',
    tabs: [],
    singletab: {},
    transpose: 0,
    newtab: {
      artist: '',
      song: '',
      tab: ''
    },
    edittab: {
      doc: {},
      i: 0
    }
  },
  methods: {
    copyToClipboard: function () {
      cc(this.output.replace(/<b>/mg,'').replace(/<\/b>/mg,''))
    },
    newTab: function () {
      console.log('newtab')
      this.newtab.artist = ''
      this.newtab.song = ''
      this.newtab.tab = ''
      this.mode = 'newtabform'
    },
    newTabSubmit: async function () {
      console.log('submit', this.newtab)
      const response = await db.post(this.newtab)
      console.log(response)
      const obj = {}
      Object.assign(obj, this.newtab)
      obj._id = response.id
      obj._rev = response.rev
      this.tabs.push(obj)
      this.mode = 'tablist'
    },
    home: function () {
      this.mode = 'tablist'
    },
    deleteTab: async function (id) {
      for(var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          await db.remove(id, this.tabs[i]._rev)
          Vue.delete(this.tabs, i)
          break
        }
      }
    },
    editTab: function(id) {
      for(var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          this.edittab.doc = this.tabs[i]
          this.edittab.i = i
          this.mode = 'edittabform'
          break
        }
      }
    },
    editTabSubmit: async function() {
      const response = await db.put(this.edittab.doc)
      this.edittab.doc._rev = response.rev
      this.tabs[this.edittab.i]._rev = response.rev
      this.mode = 'tablist'
    },
    viewTab: function(id){
      for(var i in this.tabs) {
        if (this.tabs[i]._id === id) {
          this.singletab = this.tabs[i]
          this.mode = 'singletab'
          break
        }
      }
    }
  },
  mounted: async function () {
    console.log('mounted - loading all tabs')
    const allDocs = await db.allDocs({ include_docs: true })
    console.log(allDocs)
    for(var i in allDocs.rows) {
      this.tabs.push(allDocs.rows[i].doc)
    }
  },
  computed: {
    output: function() {
      if (!this.singletab && !this.singletab.tab) {
        return ''
      }
      const markdown =  this.singletab.tab.split('\n').map((l) => {
        // if this line only contains chords and spaces (not just spaces)
        if (l.match(TAB_LINE_REGEXP) && l.trim().length !== 0) {
          // find the chords on this line
          const matches = l.match(CHORD_REGEXP)
          const replacements = []
          console.log('matches', matches, matches.length)
          for(var i in matches) {
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
