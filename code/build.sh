#!/bin/bash
npx rolldown --format=es --file=../functions/api/add.js -- add.js
npx rolldown --format=es --file=../functions/api/del.js -- del.js
npx rolldown --format=es --file=../functions/api/get.js -- get.js
npx rolldown --format=es --file=../functions/api/list.js -- list.js

