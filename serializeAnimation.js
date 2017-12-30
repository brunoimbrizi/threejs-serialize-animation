const fs = require('fs');

const args = process.argv.slice(2);
const input = args[0];
const indexDot = input.lastIndexOf('.');
const fileName = (indexDot > -1) ? input.substr(0, indexDot) : input;
const fileExt = (indexDot > -1) ? input.substr(indexDot) : '.json';

fs.readFile(input, 'utf8', function (err, data) {
	if (err) return console.log(err);

	const serialized = getSerializedAnimations(data);
	const output = `${fileName}-serialized${fileExt}`;

	fs.writeFile(output, serialized, (err) => {  
		if (err) throw err;
		console.log(`Saved as ${output}`);
	});
});

const getSerializedAnimations = (input) => {
	const json = JSON.parse(input);

	const obj = {};
	obj.animations = [];
	if (json.bones) obj.bones = json.bones;
	if (json.colors) obj.colors = json.colors;
	if (json.faces) obj.faces = json.faces;
	if (json.influencesPerVertex) obj.influencesPerVertex = json.influencesPerVertex;
	if (json.metadata) obj.metadata = json.metadata;
	if (json.morphTargets) obj.morphTargets = json.morphTargets;
	if (json.normals) obj.normals = json.normals;
	if (json.skinIndices) obj.skinIndices = json.skinIndices;
	if (json.skinWeights) obj.skinWeights = json.skinWeights;
	if (json.uvs) obj.uvs = json.uvs;
	if (json.vertices) obj.vertices = json.vertices;

	let aLength = 0;
	if (json.animations) aLength = json.animations.length;
	else if (json.animation) aLength = 1;

	for (let i = 0; i < aLength; i++) {
		const animation = json.animations ? json.animations[i] : json.animation;

		const nAnimation = {};
		nAnimation.length = animation.length;
		nAnimation.name = animation.name;
		nAnimation.fps = animation.fps;
		nAnimation.hierarchy = [];

		for (let j = 0; j < animation.hierarchy.length; j++) {
			const hierarchy = animation.hierarchy[j];
			const length = hierarchy.keys.length;

			const time = new Array(length * 1);
			const scl = new Array(length * 3);
			const pos = new Array(length * 3);
			const rot = new Array(length * 4);

			for (let k = 0; k < length; k++) {
				const key = hierarchy.keys[k];

				time[k] = key.time;
		
				scl[k * 3 + 0] = key.scl ? key.scl[0] : scl[(k - 1) * 3 + 0];
				scl[k * 3 + 1] = key.scl ? key.scl[1] : scl[(k - 1) * 3 + 1];
				scl[k * 3 + 2] = key.scl ? key.scl[2] : scl[(k - 1) * 3 + 2];
				
				pos[k * 3 + 0] = key.pos ? key.pos[0] : pos[(k - 1) * 3 + 0];
				pos[k * 3 + 1] = key.pos ? key.pos[1] : pos[(k - 1) * 3 + 1];
				pos[k * 3 + 2] = key.pos ? key.pos[2] : pos[(k - 1) * 3 + 2];

				rot[k * 4 + 0] = key.rot ? key.rot[0] : rot[(k - 1) * 4 + 0];
				rot[k * 4 + 1] = key.rot ? key.rot[1] : rot[(k - 1) * 4 + 1];
				rot[k * 4 + 2] = key.rot ? key.rot[2] : rot[(k - 1) * 4 + 2];
				rot[k * 4 + 3] = key.rot ? key.rot[3] : rot[(k - 1) * 4 + 3];
			}

			const nHierarchy = {};
			nHierarchy.parent = hierarchy.parent;
			nHierarchy.keys = [];

			const nKeys = {};
			nKeys.time = time;
			nKeys.scl = scl;
			nKeys.pos = pos;
			nKeys.rot = rot;
			nHierarchy.keys.push(nKeys);

			nAnimation.hierarchy.push(nHierarchy);
		}

		obj.animations.push(nAnimation);
	}

	return JSON.stringify(obj);
};
