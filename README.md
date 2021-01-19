# MCHoster
## Basic Package For Starting A Minecraft Server From A Node Project

# Getting Started
First Create A New Folder Anywhere and create a new text file in the folder called eula.txt and put the following in inside.
```
eula = true
```

# Example Code
```js
var mchoster = require("mchoster");

data = {
    name:'ServerName',
    gamemode: 'gamemode',
    version:'1.14.4',
    difficulty: 'easy',
    rconPass: 'password',
    maxPlayers: 5,
    whiteList: true
}

mchoster.launchServer("C:\\Users\\User\\Desktop\\Test",data);
```

## Versions
All Release Versions are supported.
To Keep Server updated to latest version input latest into the version field.
If you put a plus infront of a version e.g 1.16+ it will keep it to the latest of 1.16 so that would load 1.16.3.

