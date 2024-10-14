import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { add } from './lib/db.js'

const generateid = function () {
  //this is a simple randomness generator.. assuming that the probability of 
  // generating the same id twice is tiny
  const chars = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";
  let treeid = "";
  for (var i = 0; i < 8; i++) {
    let nextchar = Math.floor(Math.random() * chars.length);
    treeid = treeid + chars[nextchar];
  }
  return treeid;
}

const hash = async (str) => {
  const msgUint8 = new TextEncoder().encode(str) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

export async function onRequest(context) {
  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()

  // if the mandatiry fields are there
  if (json.artist && json.song && json.tab) {
    // create a time-based key
    const id = generateid()
    const h = await hash(`${json.artist}|${json.song}|${json.tab}`)

    const doc = {
      artist: json.artist,
      song: json.song,
      tab: json.tab,
      date: new Date().toISOString(),
      hash: h
    }
    const metadata = {
      artist: doc.artist,
      song: doc.song,
      hash: h
    }
    const index = {
    }

    // add to KV store
    const response = await add(context.env.KV, { id, doc, metadata, index })

    // send response
    return new Response(JSON.stringify(response), okResponse)
  }
  
  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)

}
