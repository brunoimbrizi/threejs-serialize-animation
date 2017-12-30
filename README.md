# three-serialize-animation
A script that serializes animations in a Three.js (json) file and makes it smaller.

![Sample](https://raw.githubusercontent.com/brunoimbrizi/threejs-serialize-animation/master/example/images/screencapture.gif)
example: original 1,148 KB / serialized 475 KB

## Why
Three.js (json) files containing animations can get quite big. Using the Blender Exporter it is possible to reduce file sizes by turning 'Indent JSON' off, or turning 'Enable precision' on or setting 'File compression' to msgpack.

But there is a way to get even smaller files: to serialize the key values in the `animations` node.

The animation that promped me to write this script contained a skeleton with 23 joints and was 6214 frames long. Discarding the bones and the animations, the exported json would be around 200 KB, but with the animations it was 28,484 KB. 
By serializing the animations the size went down to 12,164 KB.

Some test results with different settings:

* 28,484 kb - precision 6, indent true
* 16,854 kb - precision 6, indent false
* 12,017 kb - precision 3, indent false
* 16,968 kb - msgpack compression
* 7,298 kb - precision 3, serialized

## What
`serializeAnimation.js` copies the values of each keyframe property into a single array.

i.e.
```
"keys":[{
    "time": 0,
    "scl": [1, 1, 1],
    "pos": [0, 0, 0],
    "rot": [1, 2, 3, 4]
},{
    "time": 1,
    "scl": [1, 1, 1],
    "pos": [0, 0, 0],
    "rot": [5, 6, 7, 8]
}
```

Becomes:
```
"keys":[{
    "time": [0, 1]
    "scl": [1, 1, 1, 1, 1, 1],
    "pos": [0, 0, 0, 0, 0, 0],
    "rot": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

## It's a hack
Three.js is not expecting a single key containing all the values. It is necessary to hack it a bit, namely by overriding `AnimationClip.parseAnimation`. This is what `parseAnimation.js` is doing. 

What is curious is that internally the values are already serialized. This happens inside `AnimationClip.parseAnimation`, more precisely when `flattenJSON` is called.

What `parseAnimation.js` does it just to bypass that call and just use the values already serialized in the file.

## How

#### Serialize
```
$ node serializeAnimation.js <input-file.json>
```
// output input-file-serialized.json

#### Parse
```
import * as THREE from 'three';
import { parseAnimation } from 'parseAnimation';

// override
THREE.AnimationClip.parseAnimation = parseAnimation;
```
