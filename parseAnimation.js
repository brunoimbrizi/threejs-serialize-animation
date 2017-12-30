var THREE = window.THREE || require('three');

var parseAnimation = function ( animation, bones ) {

	if ( ! animation ) {

		console.error( 'THREE.AnimationClip: No animation in JSONLoader data.' );
		return null;

	}

	var addNonemptyTrack = function ( trackType, trackName, animationKeys, propertyName, destTracks ) {

		// only return track if there are actually keys.
		if ( animationKeys.length !== 0 ) {

			var times = [];
			var values = [];

			// COMMENTED OUT LINE BELOW FROM ORIGINAL THREE.AnimationClip
			// AnimationUtils.flattenJSON( animationKeys, times, values, propertyName );

			// AND ADDED THE NEXT TWO LINES
			times = animationKeys[0].time;
			values = animationKeys[0][propertyName];

			// empty keys are filtered out, so check again
			if ( times.length !== 0 ) {

				destTracks.push( new trackType( trackName, times, values ) );

			}

		}

	};

	var tracks = [];

	var clipName = animation.name || 'default';
	// automatic length determination in AnimationClip.
	var duration = animation.length || - 1;
	var fps = animation.fps || 30;

	var hierarchyTracks = animation.hierarchy || [];

	for ( var h = 0; h < hierarchyTracks.length; h ++ ) {

		var animationKeys = hierarchyTracks[ h ].keys;

		// skip empty tracks
		if ( ! animationKeys || animationKeys.length === 0 ) continue;

		// process morph targets
		if ( animationKeys[ 0 ].morphTargets ) {

			// figure out all morph targets used in this track
			var morphTargetNames = {};

			for ( var k = 0; k < animationKeys.length; k ++ ) {

				if ( animationKeys[ k ].morphTargets ) {

					for ( var m = 0; m < animationKeys[ k ].morphTargets.length; m ++ ) {

						morphTargetNames[ animationKeys[ k ].morphTargets[ m ] ] = - 1;

					}

				}

			}

			// create a track for each morph target with all zero
			// morphTargetInfluences except for the keys in which
			// the morphTarget is named.
			for ( var morphTargetName in morphTargetNames ) {

				var times = [];
				var values = [];

				for ( var m = 0; m !== animationKeys[ k ].morphTargets.length; ++ m ) {

					var animationKey = animationKeys[ k ];

					times.push( animationKey.time );
					values.push( ( animationKey.morphTarget === morphTargetName ) ? 1 : 0 );

				}

				tracks.push( new NumberKeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', times, values ) );

			}

			duration = morphTargetNames.length * ( fps || 1.0 );

		} else {

			// ...assume skeletal animation

			var boneName = '.bones[' + bones[ h ].name + ']';

			addNonemptyTrack(
				THREE.VectorKeyframeTrack, boneName + '.position',
				animationKeys, 'pos', tracks );

			addNonemptyTrack(
				THREE.QuaternionKeyframeTrack, boneName + '.quaternion',
				animationKeys, 'rot', tracks );

			addNonemptyTrack(
				THREE.VectorKeyframeTrack, boneName + '.scale',
				animationKeys, 'scl', tracks );

		}

	}

	if ( tracks.length === 0 ) {

		return null;

	}

	var clip = new THREE.AnimationClip( clipName, duration, tracks );

	return clip;

};

window.module = window.module || {};
module.exports = { parseAnimation: parseAnimation };
