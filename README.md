# transposer

A database of song tabs. It uses Cloudflare's KV to store the lists of tabs. Data is cached locally using LocalStorage.

## Command-line

```sh
# list all songs
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" "https://transposer.glynnbird.com/api/list"
{
  "ok": true,
  "list": [
    {
      "id": "QNJNZ3B7",
      "artist": "Taylor Swift",
      "song": "All too well",
      "hash": "4c94ccb9d2bb1b735828d71796312f76"
    }
  ]
}

# get a single song
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"QNJNZ3B7"}' "https://transposer.glynnbird.com/api/get"
{"ok":true,"doc":{"artist":"Taylor Swift","song":"All too well","tab":"C F G","date":"2024-10-14T13:26:51.029Z","hash":"4c94ccb9d2bb1b735828d71796312f76","id":"QNJNZ3B7"}}

# add a song
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"artist":"Taylor Swift","song":"All too well","tab":"C F G"}' "https://transposer.glynnbird.com/api/add"
{"ok":true,"id":"QNJNZ3B7"}
```
