import{D as gn,j as W,d as jn,q as Z,m as qn,J as Xn,o as L,c as A,v as b,t as B,g as le,x as ce,y as lt,a as d,s as Xe,p as de,F as Re,r as Ue,h as Yn,C as Ft,A as ct,z as Jn,B as Qn,n as Ye}from"./index-Cssks6iG.js";import{I as Kn,g as wt,x as Ut,y as We,z as Zn,t as bt,J as yn,V as G,K as eo,N as vt,U as wn,T as bn,X as gt,e as ee,Y as Ze,Z as to,_ as Sn,$ as no,S as oo,P as so,W as io,O as ao,C as ro,A as lo,D as co,H as uo,G as Je,q as sn,f as Qe,a0 as fo,a1 as po,F as mo,u as ho,a as Fe,b as $e,c as Ke,d as Oe,M as Ge,R as dt,B as It,h as vo,i as go,o as an,p as yo,m as ut,a2 as wo,a3 as bo,n as So,a4 as rn,a5 as zt,a6 as xo,l as Mo,E as Co,Q as ko,k as _o,w as To,a7 as ln,a8 as cn,a9 as Eo,aa as Po,ab as dn,r as Lo,s as Ao,v as Fo,j as Io}from"./useAirspaceOverlay-CsBggmPs.js";import{u as zo}from"./replay-Du0je50Z.js";import{g as Bo,a as Do}from"./aircraft-type-6dkJCo94.js";import{f as Ro}from"./sortie-CS-4qunK.js";import{_ as Uo}from"./_plugin-vue_export-helper-DlAUqK2U.js";const un=new bt,ft=new G;class xn extends Kn{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const a=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],u=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],m=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(m),this.setAttribute("position",new wt(a,3)),this.setAttribute("uv",new wt(u,2))}applyMatrix4(a){const u=this.attributes.instanceStart,m=this.attributes.instanceEnd;return u!==void 0&&(u.applyMatrix4(a),m.applyMatrix4(a),u.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(a){let u;a instanceof Float32Array?u=a:Array.isArray(a)&&(u=new Float32Array(a));const m=new Ut(u,6,1);return this.setAttribute("instanceStart",new We(m,3,0)),this.setAttribute("instanceEnd",new We(m,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(a){let u;a instanceof Float32Array?u=a:Array.isArray(a)&&(u=new Float32Array(a));const m=new Ut(u,6,1);return this.setAttribute("instanceColorStart",new We(m,3,0)),this.setAttribute("instanceColorEnd",new We(m,3,3)),this}fromWireframeGeometry(a){return this.setPositions(a.attributes.position.array),this}fromEdgesGeometry(a){return this.setPositions(a.attributes.position.array),this}fromMesh(a){return this.fromWireframeGeometry(new Zn(a.geometry)),this}fromLineSegments(a){const u=a.geometry;return this.setPositions(u.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bt);const a=this.attributes.instanceStart,u=this.attributes.instanceEnd;a!==void 0&&u!==void 0&&(this.boundingBox.setFromBufferAttribute(a),un.setFromBufferAttribute(u),this.boundingBox.union(un))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yn),this.boundingBox===null&&this.computeBoundingBox();const a=this.attributes.instanceStart,u=this.attributes.instanceEnd;if(a!==void 0&&u!==void 0){const m=this.boundingSphere.center;this.boundingBox.getCenter(m);let p=0;for(let s=0,y=a.count;s<y;s++)ft.fromBufferAttribute(a,s),p=Math.max(p,m.distanceToSquared(ft)),ft.fromBufferAttribute(u,s),p=Math.max(p,m.distanceToSquared(ft));this.boundingSphere.radius=Math.sqrt(p),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(a){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(a)}}gt.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new bn(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};vt.line={uniforms:wn.merge([gt.common,gt.fog,gt.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class $t extends eo{static get type(){return"LineMaterial"}constructor(a){super({uniforms:wn.clone(vt.line.uniforms),vertexShader:vt.line.vertexShader,fragmentShader:vt.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(a)}get color(){return this.uniforms.diffuse.value}set color(a){this.uniforms.diffuse.value=a}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(a){a===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(a){this.uniforms.linewidth&&(this.uniforms.linewidth.value=a)}get dashed(){return"USE_DASH"in this.defines}set dashed(a){a===!0!==this.dashed&&(this.needsUpdate=!0),a===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(a){this.uniforms.dashScale.value=a}get dashSize(){return this.uniforms.dashSize.value}set dashSize(a){this.uniforms.dashSize.value=a}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(a){this.uniforms.dashOffset.value=a}get gapSize(){return this.uniforms.gapSize.value}set gapSize(a){this.uniforms.gapSize.value=a}get opacity(){return this.uniforms.opacity.value}set opacity(a){this.uniforms&&(this.uniforms.opacity.value=a)}get resolution(){return this.uniforms.resolution.value}set resolution(a){this.uniforms.resolution.value.copy(a)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(a){this.defines&&(a===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),a===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const Bt=new Ze,fn=new G,pn=new G,J=new Ze,Q=new Ze,ge=new Ze,Dt=new G,Rt=new Sn,K=new to,mn=new G,pt=new bt,mt=new yn,ye=new Ze;let we,Ie;function hn(F,a,u){return ye.set(0,0,-a,1).applyMatrix4(F.projectionMatrix),ye.multiplyScalar(1/ye.w),ye.x=Ie/u.width,ye.y=Ie/u.height,ye.applyMatrix4(F.projectionMatrixInverse),ye.multiplyScalar(1/ye.w),Math.abs(Math.max(ye.x,ye.y))}function $o(F,a){const u=F.matrixWorld,m=F.geometry,p=m.attributes.instanceStart,s=m.attributes.instanceEnd,y=Math.min(m.instanceCount,p.count);for(let _=0,V=y;_<V;_++){K.start.fromBufferAttribute(p,_),K.end.fromBufferAttribute(s,_),K.applyMatrix4(u);const O=new G,te=new G;we.distanceSqToSegment(K.start,K.end,te,O),te.distanceTo(O)<Ie*.5&&a.push({point:te,pointOnLine:O,distance:we.origin.distanceTo(te),object:F,face:null,faceIndex:_,uv:null,uv1:null})}}function Oo(F,a,u){const m=a.projectionMatrix,s=F.material.resolution,y=F.matrixWorld,_=F.geometry,V=_.attributes.instanceStart,O=_.attributes.instanceEnd,te=Math.min(_.instanceCount,V.count),$=-a.near;we.at(1,ge),ge.w=1,ge.applyMatrix4(a.matrixWorldInverse),ge.applyMatrix4(m),ge.multiplyScalar(1/ge.w),ge.x*=s.x/2,ge.y*=s.y/2,ge.z=0,Dt.copy(ge),Rt.multiplyMatrices(a.matrixWorldInverse,y);for(let ne=0,Ve=te;ne<Ve;ne++){if(J.fromBufferAttribute(V,ne),Q.fromBufferAttribute(O,ne),J.w=1,Q.w=1,J.applyMatrix4(Rt),Q.applyMatrix4(Rt),J.z>$&&Q.z>$)continue;if(J.z>$){const h=J.z-Q.z,g=(J.z-$)/h;J.lerp(Q,g)}else if(Q.z>$){const h=Q.z-J.z,g=(Q.z-$)/h;Q.lerp(J,g)}J.applyMatrix4(m),Q.applyMatrix4(m),J.multiplyScalar(1/J.w),Q.multiplyScalar(1/Q.w),J.x*=s.x/2,J.y*=s.y/2,Q.x*=s.x/2,Q.y*=s.y/2,K.start.copy(J),K.start.z=0,K.end.copy(Q),K.end.z=0;const ze=K.closestPointToPointParameter(Dt,!0);K.at(ze,mn);const xe=no.lerp(J.z,Q.z,ze),S=xe>=-1&&xe<=1,k=Dt.distanceTo(mn)<Ie*.5;if(S&&k){K.start.fromBufferAttribute(V,ne),K.end.fromBufferAttribute(O,ne),K.start.applyMatrix4(y),K.end.applyMatrix4(y);const h=new G,g=new G;we.distanceSqToSegment(K.start,K.end,g,h),u.push({point:g,pointOnLine:h,distance:we.origin.distanceTo(g),object:F,face:null,faceIndex:ne,uv:null,uv1:null})}}}class Go extends ee{constructor(a=new xn,u=new $t({color:Math.random()*16777215})){super(a,u),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const a=this.geometry,u=a.attributes.instanceStart,m=a.attributes.instanceEnd,p=new Float32Array(2*u.count);for(let y=0,_=0,V=u.count;y<V;y++,_+=2)fn.fromBufferAttribute(u,y),pn.fromBufferAttribute(m,y),p[_]=_===0?0:p[_-1],p[_+1]=p[_]+fn.distanceTo(pn);const s=new Ut(p,2,1);return a.setAttribute("instanceDistanceStart",new We(s,1,0)),a.setAttribute("instanceDistanceEnd",new We(s,1,1)),this}raycast(a,u){const m=this.material.worldUnits,p=a.camera;p===null&&!m&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=a.params.Line2!==void 0&&a.params.Line2.threshold||0;we=a.ray;const y=this.matrixWorld,_=this.geometry,V=this.material;Ie=V.linewidth+s,_.boundingSphere===null&&_.computeBoundingSphere(),mt.copy(_.boundingSphere).applyMatrix4(y);let O;if(m)O=Ie*.5;else{const $=Math.max(p.near,mt.distanceToPoint(we.origin));O=hn(p,$,V.resolution)}if(mt.radius+=O,we.intersectsSphere(mt)===!1)return;_.boundingBox===null&&_.computeBoundingBox(),pt.copy(_.boundingBox).applyMatrix4(y);let te;if(m)te=Ie*.5;else{const $=Math.max(p.near,pt.distanceToPoint(we.origin));te=hn(p,$,V.resolution)}pt.expandByScalar(te),we.intersectsBox(pt)!==!1&&(m?$o(this,u):Oo(this,p,u))}onBeforeRender(a){const u=this.material.uniforms;u&&u.resolution&&(a.getViewport(Bt),this.material.uniforms.resolution.value.set(Bt.z,Bt.w))}}class yt extends xn{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(a){const u=a.length-3,m=new Float32Array(2*u);for(let p=0;p<u;p+=3)m[2*p]=a[p],m[2*p+1]=a[p+1],m[2*p+2]=a[p+2],m[2*p+3]=a[p+3],m[2*p+4]=a[p+4],m[2*p+5]=a[p+5];return super.setPositions(m),this}setColors(a){const u=a.length-3,m=new Float32Array(2*u);for(let p=0;p<u;p+=3)m[2*p]=a[p],m[2*p+1]=a[p+1],m[2*p+2]=a[p+2],m[2*p+3]=a[p+3],m[2*p+4]=a[p+4],m[2*p+5]=a[p+5];return super.setColors(m),this}fromLine(a){const u=a.geometry;return this.setPositions(u.attributes.position.array),this}}class Wo extends Go{constructor(a=new yt,u=new $t({color:Math.random()*16777215})){super(a,u),this.isLine2=!0,this.type="Line2"}}function Vo(){const F=W({active:!1,roomId:"",roomName:"",viewerCount:0}),a=gn({fps:60,maxBitrateMbps:16,codec:"auto",shareTimeline:!0,shareActions:!0,shareFlightInfo:!0,laserEnabled:!1});let u=null,m=null;const p=new Map,s={iceServers:[{urls:"stun:stun.l.google.com:19302"}],iceCandidatePoolSize:10};function y(){const S=[{id:"auto",label:"自动",supported:!0}];if(typeof RTCRtpSender>"u"||!RTCRtpSender.getCapabilities)return S.push({id:"h264",label:"H.264",supported:!1},{id:"vp9",label:"VP9",supported:!1},{id:"av1",label:"AV1 (超清)",supported:!1}),S;const k=RTCRtpSender.getCapabilities("video"),h=k?k.codecs.map(g=>g.mimeType.toLowerCase()):[];return S.push({id:"h264",label:"H.264",supported:h.some(g=>g.includes("h264"))},{id:"vp9",label:"VP9",supported:h.some(g=>g.includes("vp9"))},{id:"av1",label:"AV1 (超清)",supported:h.some(g=>g.includes("av1"))}),S}function _(S){var N;if(a.codec==="auto"||typeof RTCRtpSender>"u"||!RTCRtpSender.getCapabilities)return;const k=RTCRtpSender.getCapabilities("video");if(!k)return;const g={h264:"video/H264",vp9:"video/VP9",av1:"video/AV1"}[a.codec];if(!g)return;const Me=k.codecs.filter(D=>D.mimeType===g),be=k.codecs.filter(D=>D.mimeType!==g);if(Me.length===0)return;const ke=S.getTransceivers();for(const D of ke)if(((N=D.sender.track)==null?void 0:N.kind)==="video")try{D.setCodecPreferences([...Me,...be])}catch{}}function V(){const S=window.location;return`${S.protocol==="https:"?"wss:":"ws:"}//${S.host}/ws/streaming`}function O(S){u&&u.readyState===WebSocket.OPEN&&u.send(JSON.stringify(S))}function te(S){const k=JSON.stringify(S);for(const h of p.values())if(h.syncDc&&h.syncDc.readyState==="open")try{h.syncDc.send(k)}catch{}}async function $(S){const k=S.getSenders().find(h=>{var g;return((g=h.track)==null?void 0:g.kind)==="video"});if(k)try{const h=k.getParameters();(!h.encodings||h.encodings.length===0)&&(h.encodings=[{}]),h.encodings[0].maxBitrate=a.maxBitrateMbps*1e6,await k.setParameters(h),console.log(`[Streaming] Bitrate set to ${a.maxBitrateMbps} Mbps`)}catch(h){console.error("[Streaming] Failed to set bitrate:",h)}}function ne(S,k){if(F.value.active)return;if(console.log(`[Streaming] Starting with config: ${a.fps}fps, ${a.maxBitrateMbps}Mbps, codec: ${a.codec}`),m=S.captureStream(a.fps),!m||m.getVideoTracks().length===0){console.error("[Streaming] Failed to capture canvas stream");return}const g=m.getVideoTracks()[0].getSettings();console.log(`[Streaming] Video track: ${g.width}x${g.height} @ ${g.frameRate}fps`),u=new WebSocket(V()),u.onopen=()=>O({type:"create-room",name:k}),u.onmessage=Me=>{try{Ve(JSON.parse(Me.data))}catch{}},u.onclose=()=>{F.value.active&&xe()},u.onerror=()=>{xe()}}async function Ve(S){var k;switch(S.type){case"room-created":F.value={active:!0,roomId:S.roomId,roomName:S.name,viewerCount:0};break;case"viewer-joined":{const h=S.viewerId;F.value.viewerCount++;const g=new RTCPeerConnection(s);if(m)for(const N of m.getTracks())g.addTrack(N,m);g.onicecandidate=N=>{N.candidate?(console.log("[Streaming] ICE candidate:",N.candidate.type,N.candidate.protocol,N.candidate.address),O({type:"ice",viewerId:h,candidate:N.candidate})):console.log("[Streaming] ICE gathering complete for viewer",h)},g.oniceconnectionstatechange=()=>{console.log("[Streaming] ICE state for viewer",h,":",g.iceConnectionState),(g.iceConnectionState==="failed"||g.iceConnectionState==="disconnected")&&(console.error("[Streaming] ICE failed for viewer",h),Ne(h)),g.iceConnectionState==="connected"&&console.log("[Streaming] ICE connected for viewer",h)},g.onconnectionstatechange=()=>{console.log("[Streaming] Connection state for viewer",h,":",g.connectionState),g.connectionState==="connected"&&$(g)};const Me=g.createDataChannel("sync",{ordered:!1,maxRetransmits:0});g.ondatachannel=N=>{const D=p.get(h);D&&(D.inputDc=N.channel)},p.set(h,{pc:g,syncDc:Me,inputDc:null}),_(g);const be=await g.createOffer();await g.setLocalDescription(be);const ke=g.getSenders().find(N=>{var D;return((D=N.track)==null?void 0:D.kind)==="video"});if(ke){const D=(k=ke.getParameters().codecs)==null?void 0:k[0];D&&(console.log(`[Streaming] Using codec: ${D.mimeType} (${D.clockRate}Hz)`),a.codec!=="auto"&&(`${a.codec.toUpperCase()}`,D.mimeType.toLowerCase().includes(a.codec)||console.warn(`[Streaming] Requested ${a.codec} but using ${D.mimeType}`)))}O({type:"offer",viewerId:h,sdp:be.sdp});break}case"viewer-left":Ne(S.viewerId),F.value.viewerCount=Math.max(0,F.value.viewerCount-1);break;case"answer":{const h=p.get(S.viewerId);h&&await h.pc.setRemoteDescription(new RTCSessionDescription({type:"answer",sdp:S.sdp}));break}case"ice":{const h=p.get(S.viewerId);if(h&&S.candidate)try{await h.pc.addIceCandidate(new RTCIceCandidate(S.candidate)),console.log("[Streaming] ICE candidate added for viewer",S.viewerId)}catch(g){console.error("[Streaming] Failed to add ICE candidate:",g)}break}}}function Ne(S){var h,g;const k=p.get(S);k&&((h=k.syncDc)==null||h.close(),(g=k.inputDc)==null||g.close(),k.pc.close(),p.delete(S))}function ze(){for(const S of p.values())$(S.pc)}function xe(){var S,k;for(const h of p.values())(S=h.syncDc)==null||S.close(),(k=h.inputDc)==null||k.close(),h.pc.close();p.clear(),O({type:"close-room"}),u&&(u.close(),u=null),m&&(m.getTracks().forEach(h=>h.stop()),m=null),F.value={active:!1,roomId:"",roomName:"",viewerCount:0}}return{state:F,config:a,startStreaming:ne,stopStreaming:xe,broadcast:te,updateBitrate:ze,getCodecCapabilities:y}}const No={key:0,class:"coord-hud"},Ho=["title"],jo={class:"profile-wrapper"},qo={key:2,class:"measure-info"},Xo={key:3,class:"airspace-alert"},Yo={key:4,class:"streaming-badge"},Jo={key:5,class:"stream-btn-group"},Qo={key:6,class:"stream-config"},Ko={class:"scfg-group"},Zo={class:"scfg-group"},es={class:"scfg-group"},ts=["value","disabled"],ns={class:"scfg-check"},os={class:"scfg-check"},ss={class:"scfg-check"},is={class:"scfg-check laser-toggle"},as={key:0,class:"laser-hint"},rs={class:"brightness-ctrl"},ls={key:0,class:"brightness-slider"},cs={class:"bs-val"},ds={key:8,class:"cockpit-hud"},us={class:"hud-glass"},fs={class:"hud-hdg-strip"},ps={class:"hdg-window"},ms={key:0,class:"hdg-num"},hs={class:"hdg-readout"},vs={class:"pb-l"},gs={class:"pb-r"},ys={class:"hud-spd-tape"},ws={class:"tape-box"},bs={class:"tick-num"},Ss={class:"tape-pointer tape-ptr-r"},xs={class:"ptr-val"},Ms={class:"hud-alt-tape"},Cs={class:"tape-box"},ks={class:"tick-num-r"},_s={class:"tape-pointer tape-ptr-l"},Ts={class:"ptr-val"},Es={class:"hud-bl"},Ps={key:0,class:"hud-mach"},Ls={class:"hud-br"},As={class:"hud-aoa2"},Fs=50,Is=5e3,ht=1110,vn=300,zs=60,Bs=15,Ds=jn({__name:"Scene3D",setup(F,{expose:a}){const u=W(),m=W(),p=W(),s=zo(),y=Vo(),_=W(!1),V=W(!1),O=gn({x:0,y:0}),te=W(y.getCodecCapabilities()),$=W(100),ne=W(!1),Ve=Ye(()=>{const n=[];for(let e=-90;e<=90;e+=5)n.push(e);return n}),Ne=Ye(()=>{const n=s.currentFrame;if(!n)return{display:"none"};const e=-n.aoa*5;return{transform:`translate(calc(-50% + ${n.sideslip*3}px), calc(-50% + ${e}px))`}}),ze=Ye(()=>{var o;const n=((o=s.currentFrame)==null?void 0:o.speed)??0,e=Math.round(n/20)*20,t=[];for(let i=e-100;i<=e+100;i+=20)i>=0&&t.push(i);return t}),xe=Ye(()=>{var o;const n=((o=s.currentFrame)==null?void 0:o.alt)??0,e=Math.round(n/200)*200,t=[];for(let i=e-2e3;i<=e+2e3;i+=200)t.push(i);return t}),S=Ye(()=>{const n=[],e={0:"N",90:"E",180:"S",270:"W"};for(let t=-180;t<=540;t+=10){const o=(t%360+360)%360,i=e[o];n.push({deg:t,label:i||String(o),cardinal:!!i})}return n});let k=null;function h(){var e,t,o,i;let n=null;if(s.sceneTheme==="cesiumMap"&&q&&!q.isDestroyed()?n=q.canvas:U&&(n=U.domElement),n){const l=s.currentFile?`${s.currentFile} 回放推流`:"飞行回放推流";y.startStreaming(n,l),Dn(),k=setInterval(Me,200),(e=u.value)==null||e.addEventListener("mousedown",ke),(t=u.value)==null||t.addEventListener("mousemove",N),(o=u.value)==null||o.addEventListener("mouseup",D),(i=u.value)==null||i.addEventListener("mouseleave",D)}}function g(){var n,e,t,o;k&&(clearInterval(k),k=null),Rn(),(n=u.value)==null||n.removeEventListener("mousedown",ke),(e=u.value)==null||e.removeEventListener("mousemove",N),(t=u.value)==null||t.removeEventListener("mouseup",D),(o=u.value)==null||o.removeEventListener("mouseleave",D),V.value=!1,_.value=!1,y.stopStreaming()}function Me(){if(!y.state.value.active)return;const n={type:"state"};if(y.config.shareTimeline&&(n.timeline={currentTime:s.currentTime,duration:s.duration,playing:s.playing,speed:s.playbackSpeed,progress:s.progress}),y.config.shareFlightInfo&&s.currentFrame){const e=s.currentFrame;n.flight={speed:e.speed,mach:e.mach,alt:e.alt,heading:e.heading,pitch:e.pitch,roll:e.roll,aoa:e.aoa,g_load:e.g_load,t:e.t}}y.config.shareActions&&s.actions.length>0&&(n.actions=s.actions.map(e=>({name:e.name,start:e.start_time,end:e.end_time,rule_id:e.rule_id})),n.currentTime=s.currentTime),y.broadcast(n)}let be=!1;function ke(n){!y.config.laserEnabled||n.button!==0||n.target.closest(".stream-config, .streaming-badge, .minimap-wrapper, .profile-wrapper")||(be=!0,Ot(n))}function N(n){!be||!y.config.laserEnabled||Ot(n)}function D(){be&&(be=!1,V.value=!1,y.broadcast({type:"laser",active:!1}))}function Ot(n){var i;const e=(i=u.value)==null?void 0:i.getBoundingClientRect();if(!e)return;const t=n.clientX-e.left,o=n.clientY-e.top;O.x=t,O.y=o,V.value=!0,y.broadcast({type:"laser",active:!0,x:t/e.width,y:o/e.height})}const St=W(""),et=W("");let me=null;const xt=W(null),Gt=W({}),Wt=W(""),tt=W(!1),Be=W(!1);let w,E,U,M,H,ae,re,Mt,Vt,Y,j,ue,I,he=[],Ce=null,nt=null,ve=null,fe=!1,_e=null,ot=null;const Ct=To();let oe=null,pe=null,Te=null,q=null,Ee=null;const He=W(0),Pe=W(0);let kt=0,Le=!1;const Se=W(null);function Mn(n){let e=null;for(const t of n)if(t.speed===0&&t.mach===0)e=t.alt;else if(e!==null)return console.log(`地面检测: 起飞前地面高度=${e}m`),e;return console.log("地面检测: 未找到起飞点"),e}let st=0;function De(n,e,t){const o=(n-He.value)*ht*Math.cos(Pe.value*Math.PI/180),i=-(e-Pe.value)*ht,l=t===0&&Se.value!==null?Se.value:t,c=Se.value!==null?Se.value:kt,r=(l-c+vn)/100;return st<3&&(console.log(`toScenePos #${st}: alt=${t}, actualAlt=${l}, groundLevel=${Se.value}, offset=${vn}, y=${r}`),st++),new G(o,r,i)}function Cn(){const n=u.value,e=n.clientWidth,t=n.clientHeight;w=new oo,E=new so(60,e/t,.1,1e4),E.position.set(30,40,60),E.lookAt(0,0,0),U=new io({antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),U.setSize(e,t),U.setPixelRatio(window.devicePixelRatio),n.appendChild(U.domElement),H=new ao(E,U.domElement),H.enableDamping=!0,H.dampingFactor=.1,H.minDistance=2,H.maxDistance=1e5,H.maxPolarAngle=Math.PI*.85,re=new ro,re.setSize(e,t),re.domElement.style.position="absolute",re.domElement.style.top="0",re.domElement.style.left="0",re.domElement.style.pointerEvents="none",n.appendChild(re.domElement),j=new lo(4482730,.6),w.add(j),ue=new co(16777215,1),ue.position.set(100,200,100),w.add(ue),I=new uo(8956671,3355426,.4),w.add(I),Y=new Je,Y.name="__themeGroup",w.add(Y),Nt(s.sceneTheme),_e=sn(),M=_e.group,w.add(M);const o=document.createElement("canvas");o.width=64,o.height=64;const i=o.getContext("2d");i.beginPath(),i.arc(32,32,28,0,Math.PI*2),i.fillStyle="#ff4444",i.fill(),i.lineWidth=4,i.strokeStyle="#ffffff",i.stroke();const l=new Qe(o),c=new fo({map:l,depthTest:!1});Te=new po(c),Te.visible=!1,w.add(Te);const r=new yt,f=new $t({color:6333946,linewidth:3,transparent:!0,opacity:.9,vertexColors:!0,worldUnits:!1,alphaToCoverage:!0});f.resolution.set(window.innerWidth,window.innerHeight),ae=new Wo(r,f),ae.frustumCulled=!1,w.add(ae),Vt=new Mo,oe=new mo(E,U.domElement),pe=ho(w,He,Pe)}function Nt(n){for(;Y.children.length>0;){const t=Y.children[0];if(Y.remove(t),t.geometry&&t.geometry.dispose(),t.material){const o=t.material;Array.isArray(o)?o.forEach(i=>i.dispose()):o.dispose()}}const e=w.getObjectByName("__starsPoints");switch(e&&(w.remove(e),e.geometry&&e.geometry.dispose()),n){case"cesiumMap":An();return;case"darkGrid":Ht();break;case"satellite":_n();break;case"daylight":Tn();break;case"military":En();break;case"space":Pn();break;case"minimal":Ln();break;case"darkSky":kn();break;default:Ht()}Tt()}function Ht(){w.background=new Fe(658967),w.fog=new $e(658967,500,3e3),j.color.set(4482730),j.intensity=.6,ue.intensity=1,I.color.set(8956671),I.groundColor.set(3355426),I.intensity=.4;const n=new Ke(2e3,200,1713988,1120814);Y.add(n);const e=new Oe(4e3,4e3),t=new Ge({color:856343,transparent:!0,opacity:.8}),o=new ee(e,t);o.rotation.x=-Math.PI/2,o.position.y=0,Y.add(o)}function kn(){const n=document.createElement("canvas");n.width=2,n.height=256;const e=n.getContext("2d"),t=e.createLinearGradient(0,0,0,256);t.addColorStop(0,"#0a1628"),t.addColorStop(.3,"#132244"),t.addColorStop(.7,"#1a3366"),t.addColorStop(1,"#0e1a2e"),e.fillStyle=t,e.fillRect(0,0,2,256);const o=new Qe(n);w.background=o,w.fog=new $e(924206,500,3e3),j.color.set(4482730),j.intensity=.6,ue.intensity=1,I.color.set(8956671),I.groundColor.set(3355426),I.intensity=.4;const i=new Ke(2e3,200,1713988,1120814);Y.add(i);const l=new Oe(4e3,4e3),c=new Ge({color:856343,transparent:!0,opacity:.8}),r=new ee(l,c);r.rotation.x=-Math.PI/2,r.position.y=0,Y.add(r)}function _n(){w.background=new Fe(1714714),w.fog=new $e(1714714,800,3500),j.color.set(5601109),j.intensity=.7,ue.intensity=1,I.color.set(8956552),I.groundColor.set(3359778),I.intensity=.5;const n=document.createElement("canvas");n.width=512,n.height=512;const e=n.getContext("2d");e.fillStyle="#2d5a2d",e.fillRect(0,0,512,512);const t=qt(42);for(let r=0;r<120;r++){const f=t()*512,v=t()*512,C=20+t()*60,x=20+t()*60,T=Math.floor(40+t()*60),P=Math.floor(30+t()*50);e.fillStyle=t()>.4?`rgb(${P}, ${T+30}, ${P})`:`rgb(${P+60}, ${P+40}, ${P})`,e.fillRect(f,v,C,x)}e.strokeStyle="#3a6088",e.lineWidth=3,e.beginPath(),e.moveTo(0,200),e.bezierCurveTo(150,180,300,250,512,220),e.stroke(),e.beginPath(),e.moveTo(256,0),e.bezierCurveTo(240,150,280,350,260,512),e.stroke(),e.strokeStyle="#666655",e.lineWidth=2;for(let r=0;r<4;r++)e.beginPath(),e.moveTo(t()*512,t()*512),e.lineTo(t()*512,t()*512),e.stroke();const o=new Qe(n);o.wrapS=dt,o.wrapT=dt,o.repeat.set(20,20);const i=new Oe(4e3,4e3),l=new Ge({map:o}),c=new ee(i,l);c.rotation.x=-Math.PI/2,c.position.y=0,Y.add(c)}function Tn(){const n=document.createElement("canvas");n.width=2,n.height=256;const e=n.getContext("2d"),t=e.createLinearGradient(0,0,0,256);t.addColorStop(0,"#4a90d9"),t.addColorStop(.4,"#87CEEB"),t.addColorStop(.8,"#c8dfe8"),t.addColorStop(1,"#e0e8f0"),e.fillStyle=t,e.fillRect(0,0,2,256);const o=new Qe(n);w.background=o,w.fog=new $e(13164520,600,3500),j.color.set(8956620),j.intensity=.8,ue.intensity=1.2,I.color.set(8900331),I.groundColor.set(3833146),I.intensity=.6;const i=new Oe(4e3,4e3),l=new Ge({color:3833146}),c=new ee(i,l);c.rotation.x=-Math.PI/2,c.position.y=0,Y.add(c);const r=new Ke(2e3,200,5614165,4491332);r.material.transparent=!0,r.material.opacity=.3,Y.add(r)}function En(){w.background=new Fe(9141595),w.fog=new $e(9141595,500,3e3),j.color.set(8943445),j.intensity=.6,ue.intensity=.9,I.color.set(11180390),I.groundColor.set(5588019),I.intensity=.4;const n=document.createElement("canvas");n.width=512,n.height=512;const e=n.getContext("2d");e.fillStyle="#c2b280",e.fillRect(0,0,512,512),e.strokeStyle="#8b6914",e.lineWidth=1.5;for(let r=0;r<8;r++){const f=180+r*20,v=200+r*15,C=40+r*25,x=30+r*20;e.beginPath(),e.ellipse(f,v,C,x,.3,0,Math.PI*2),e.stroke()}for(let r=0;r<6;r++)e.beginPath(),e.ellipse(380,350,20+r*18,15+r*14,-.2,0,Math.PI*2),e.stroke();e.strokeStyle="#6b5910",e.lineWidth=.5;for(let r=0;r<512;r+=64)e.beginPath(),e.moveTo(0,r),e.lineTo(512,r),e.stroke();const t=new Qe(n);t.wrapS=dt,t.wrapT=dt,t.repeat.set(20,20);const o=new Oe(4e3,4e3),i=new Ge({map:t}),l=new ee(o,i);l.rotation.x=-Math.PI/2,l.position.y=0,Y.add(l);const c=new Ke(2e3,100,2968109,2968109);c.material.transparent=!0,c.material.opacity=.5,Y.add(c)}function Pn(){w.background=new Fe(8),w.fog=new $e(8,2e3,8e3),j.color.set(2236996),j.intensity=.3,ue.intensity=.6,I.color.set(1118515),I.groundColor.set(0),I.intensity=.2;const n=2e3,e=new Float32Array(n*3),t=qt(7);for(let c=0;c<n;c++){const r=t()*Math.PI*2,f=Math.acos(2*t()-1),v=3e3+t()*1e3;e[c*3]=v*Math.sin(f)*Math.cos(r),e[c*3+1]=v*Math.sin(f)*Math.sin(r),e[c*3+2]=v*Math.cos(f)}const o=new It;o.setAttribute("position",new wt(e,3));const i=new vo({color:16777215,size:2,transparent:!0,opacity:.8,sizeAttenuation:!1}),l=new go(o,i);l.name="__starsPoints",w.add(l)}function Ln(){w.background=new Fe(13684944),w.fog=null,j.color.set(16777215),j.intensity=.8,ue.intensity=1.5,I.color.set(16777215),I.groundColor.set(13421772),I.intensity=.5;const n=new Oe(4e3,4e3),e=new Ge({color:15658734}),t=new ee(n,e);t.rotation.x=-Math.PI/2,t.position.y=0,Y.add(t);const o=new Ke(2e3,200,12303291,14540253);Y.add(o)}function _t(n){const e=-n.z/ht+Pe.value,t=n.x/(ht*Math.cos(Pe.value*Math.PI/180))+He.value,o=n.y*100+kt;return{lon:t,lat:e,alt:o}}function An(){Tt();const n=u.value;w.background=null,w.fog=null,j.color.set(16777215),j.intensity=1,ue.intensity=1.2,I.color.set(16777215),I.groundColor.set(8947848),I.intensity=.6,Ee=document.createElement("div"),Ee.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;",n.insertBefore(Ee,n.firstChild),U.domElement.style.position="absolute",U.domElement.style.zIndex="1",re.domElement.style.zIndex="2";const e=s.customTileUrl,t={animation:!1,shouldAnimate:!0,homeButton:!1,fullscreenButton:!1,baseLayerPicker:!1,geocoder:!1,timeline:!1,sceneModePicker:!1,infoBox:!1,selectionIndicator:!1,navigationHelpButton:!1,requestRenderMode:!0,scene3DOnly:!0,shadows:!1,imageryProvider:!1,terrainProvider:new Cesium.EllipsoidTerrainProvider({}),creditContainer:document.createElement("div")};q=new Cesium.Viewer(Ee,t);const o=s.customTerrainUrl;if(o){const l=new Cesium.Resource({url:"/api/terrain-proxy/",queryParameters:{base:o}});Cesium.CesiumTerrainProvider.fromUrl(l,{requestVertexNormals:!0}).then(c=>{q&&(q.terrainProvider=c)}).catch(c=>{console.warn("[地形] CesiumTerrainProvider 加载失败，使用默认椭球体:",c)})}else if(s.activeTerrainId){const l=new Cesium.GeographicTilingScheme;q.terrainProvider=new Cesium.CustomHeightmapTerrainProvider({width:32,height:32,tilingScheme:l,callback:(c,r,f)=>{const v=l.tileXYToRectangle(c,r,f),C=`/api/terrain/${s.activeTerrainId}/heights?west=${Cesium.Math.toDegrees(v.west)}&south=${Cesium.Math.toDegrees(v.south)}&east=${Cesium.Math.toDegrees(v.east)}&north=${Cesium.Math.toDegrees(v.north)}&width=32&height=32`;return fetch(C).then(x=>x.json()).then(x=>new Float32Array(x.heights))}})}if(e){const l=`/api/tile-proxy/{z}/{x}/{reverseY}.png?base=${encodeURIComponent(e)}`,c=new Cesium.UrlTemplateImageryProvider({url:l,maximumLevel:18,minimumLevel:0});q.imageryLayers.addImageryProvider(c)}const i=q.scene;i.screenSpaceCameraController.enableRotate=!1,i.screenSpaceCameraController.enableTranslate=!1,i.screenSpaceCameraController.enableZoom=!1,i.screenSpaceCameraController.enableTilt=!1,i.screenSpaceCameraController.enableLook=!1,i.skyBox=void 0,i.sun=void 0,i.moon=void 0,i.skyAtmosphere=void 0,jt()}function Tt(){q&&(q.destroy(),q=null),Ee&&(Ee.remove(),Ee=null),U&&(U.domElement.style.position="",U.domElement.style.zIndex=""),re&&(re.domElement.style.zIndex="")}function jt(){if(!q||q.isDestroyed()||!Le)return;const n=_t(E.position),e=_t(H.target),t=e.lon>=0?"E":"W",o=e.lat>=0?"N":"S";St.value=`${t}${Math.abs(e.lon).toFixed(3)}° ${o}${Math.abs(e.lat).toFixed(3)}° H${e.alt.toFixed(0)}m`;const i=Cesium.Cartesian3.fromDegrees(n.lon,n.lat,n.alt),l=Cesium.Cartesian3.fromDegrees(e.lon,e.lat,e.alt),c=Cesium.Cartesian3.subtract(l,i,new Cesium.Cartesian3);Cesium.Cartesian3.normalize(c,c);const r=Cesium.Cartesian3.normalize(i,new Cesium.Cartesian3);q.camera.setView({destination:i,orientation:{direction:c,up:r}})}function qt(n){let e=n|0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Xt(){const n=new Je,e=new ln({color:16737792,emissive:16724736,emissiveIntensity:.6,flatShading:!0}),t=new ln({color:16772608,emissive:16755200,emissiveIntensity:.8,flatShading:!0}),o=new ee(new cn(.4,4,8),e);o.rotation.x=-Math.PI/2,o.position.z=-.5,n.add(o);const i=new ee(new cn(.2,1.5,6),t);i.rotation.x=-Math.PI/2,i.position.z=-3,n.add(i);const l=new Eo;l.moveTo(0,0),l.lineTo(3.5,-1.2),l.lineTo(3.5,-1.5),l.lineTo(.2,-.5),l.lineTo(-.2,-.5),l.lineTo(-3.5,-1.5),l.lineTo(-3.5,-1.2),l.lineTo(0,0);const c=new Po(l,{depth:.06,bevelEnabled:!1}),r=new ee(c,e);r.rotation.x=-Math.PI/2,r.position.set(0,0,0),n.add(r);const f=new dn(.06,1.2,.8),v=new ee(f,t);v.position.set(0,.6,1.5),n.add(v);const C=new dn(1.8,.06,.6),x=new ee(C,e);return x.position.set(0,.1,1.5),n.add(x),n.scale.set(2,2,2),n}function Et(){M&&M.traverse(n=>{if(n.geometry&&n.geometry.dispose(),n.material){const e=n.material;Array.isArray(e)?e.forEach(t=>t.dispose()):e.dispose()}})}async function Fn(n,e){const t=Do(n);M&&(Et(),w.remove(M));try{const o=await new Promise((f,v)=>{new Lo().load(t,x=>{f(x.scene)},void 0,x=>{new Ao().load(t,P=>f(P),void 0,v)})}),l=new bt().setFromObject(o).getCenter(new G);for(const f of o.children)f.position.x-=l.x,f.position.y-=l.y,f.position.z-=l.z;o.updateMatrixWorld(!0);let c=!1;const r=o.getObjectByName("Gear_Front")||o.getObjectByName("LandingGear_Front");if(r){const f=new G;r.getWorldPosition(f),c=f.z>.5}else{const f=o.getObjectByName("Rudder")||o.getObjectByName("Elevator_L");if(f){const v=new G;f.getWorldPosition(v),c=v.z<-.5}}c&&(o.rotation.y=Math.PI),M=new Je,M.add(o),M.scale.set(e.scale,e.scale,e.scale),fe=!0,ve=e,_e=null,ot=Fo(o),w.add(M)}catch(o){console.warn("自定义模型加载失败，使用默认模型:",o),_e=sn(),M=_e.group,fe=!1,ve=null,ot=null,Ct.reset(),w.add(M)}nt=n}let Pt=0;new G;const Yt=new Co(0,0,0,"YXZ"),Jt=new ko;function Qt(){const n=s.currentFrame;if(!n)return;Le||(He.value=n.lon,Pe.value=n.lat,Le=!0);const e=De(n.lon,n.lat,n.alt),t=Math.PI/180,o=fe&&ve?ve.heading_offset:0,i=fe&&ve?ve.pitch_offset:0,l=fe&&ve?ve.roll_offset:0,c=-(n.heading+o)*t,r=(n.pitch+i)*t,f=-(n.roll+l)*t;if(Yt.set(r,c,f,"YXZ"),Jt.setFromEuler(Yt),M.position.copy(e),M.quaternion.copy(Jt),fe&&ot){const x=s.currentSwitch,T=Ct.computeState(n,x,Pt);Io(ot,T)}else if(_e&&!fe){const x=s.currentSwitch,T=Ct.computeState(n,x,Pt);_o(_e,T)}if(s.startFromTakeoff&&n.t<s.flightStartTime){Ce=null;return}let v=!0;if(Ce){const x=e.distanceTo(Ce);x>Fs?(he=[],Ce=null):x<.001&&(v=!1)}v&&(he.push(e.x,e.y,e.z),he.length>s.trailLength*3&&(he=he.slice(-s.trailLength*3))),Ce=e.clone();const C=he.length/3;if(C>=2){const x=new yt;x.setPositions(he);const T=[];for(let P=0;P<C;P++){const se=.2+.8*(P/(C-1));T.push(.37*se,.63*se,.98*se)}x.setColors(T),ae.geometry.dispose(),ae.geometry=x,ae.computeLineDistances()}}function it(){const n=w.getObjectByName("overviewTrail");if(n&&w.remove(n),!s.overviewTrailVisible)return;const e=s.visibleOverviewFrames;if(e.length<2)return;if(!Le){const r=e.find(f=>f.lon!==0||f.lat!==0);r&&(He.value=r.lon,Pe.value=r.lat,Le=!0)}const t=e.filter(r=>r.lon!==0||r.lat!==0);if(t.length<2)return;const o=[];for(let r=1;r<t.length;r++){const f=De(t[r-1].lon,t[r-1].lat,t[r-1].alt),v=De(t[r].lon,t[r].lat,t[r].alt);f.distanceTo(v)>100||o.push(f.x,f.y,f.z,v.x,v.y,v.z)}const i=new It;i.setAttribute("position",new wt(o,3));const l=new an({color:1981023,transparent:!0,opacity:.4}),c=new yo(i,l);c.name="overviewTrail",w.add(c)}function at(){const n=[];w.traverse(e=>{e.name.startsWith("actionMarker_")&&n.push(e)}),n.forEach(e=>{e.traverse(t=>{t instanceof ut&&t.element.remove()}),w.remove(e)})}function In(){je="",rt()}let je="";function zn(){const n=s.currentTime,t=s.filteredActions.filter(o=>{const i=(o.start_time+o.end_time)/2;return Math.abs(i-n)<=zs});return t.sort((o,i)=>{const l=(o.start_time+o.end_time)/2,c=(i.start_time+i.end_time)/2;return Math.abs(l-s.currentTime)-Math.abs(c-s.currentTime)}),t.slice(0,Bs)}function rt(){if(!Le)return;const n=s.overviewFrames;if(n.length===0)return;const e=s.showAllMarkerLabels,t=s.currentTime,o=e?s.filteredActions:zn(),i=(e?"A":"D")+"|"+o.map(l=>`${l.rule_id}_${l.start_time}`).join("|");if(i!==je){je=i,at();for(const l of o){const c=n.reduce((T,P)=>Math.abs(P.t-l.start_time)<Math.abs(T.t-l.start_time)?P:T),f=new Fe(s.getActionColor(l.rule_id)).getHex(),v=De(c.lon,c.lat,c.alt),C=(l.start_time+l.end_time)/2,x=e||Math.abs(C-t)<=20;Bn(v,l.rule_id,x?l.name:"",f,`start_${l.start_time}`)}}}function Bn(n,e,t,o,i){const l=new Je;l.name=`actionMarker_${e}_${i}`;const c=new xo(.1,.1,3,6),r=new zt({color:o,transparent:!0,opacity:.8}),f=new ee(c,r);f.position.y=1.5,l.add(f);const v=new rn(.5,8,8),C=new zt({color:o}),x=new ee(v,C);if(x.position.y=3.2,l.add(x),t){const T="#"+new Fe(o).getHexString(),P=document.createElement("div");P.style.cssText=`
      background: rgba(0,0,0,0.75);
      color: ${T};
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      border: 1px solid ${T};
    `,P.textContent=`${e}. ${t}`;const z=new ut(P);z.position.set(0,4.5,0),l.add(z)}l.position.copy(n),w.add(l)}let Kt=0,qe=null;function Dn(){if(qe)return;cancelAnimationFrame(Mt);const n=y.config.fps||60;qe=setInterval(()=>{Zt()},1e3/n)}function Rn(){qe&&(clearInterval(qe),qe=null),Lt()}function Zt(){const n=Vt.getDelta();Pt=n,s.tick(n),Qt();const e=s.cameraMode==="roam",t=s.cameraMode==="cockpit";if(t&&s.currentFrame){const i=s.currentFrame;if(i.lon!==0||i.lat!==0){const l=new G(0,0,-1).applyQuaternion(M.quaternion),c=new G(0,1,0).applyQuaternion(M.quaternion);E.position.copy(M.position).addScaledVector(c,.3);const r=E.position.clone().addScaledVector(l,100),f=new Sn().lookAt(E.position,r,c);E.quaternion.setFromRotationMatrix(f),E.fov!==80&&(E.fov=80,E.updateProjectionMatrix()),M.visible=!1}}else if(s.cameraFollow&&s.currentFrame&&!e){const i=s.currentFrame;if(i.lon!==0||i.lat!==0){const l=new G(0,0,-1).applyQuaternion(M.quaternion);E.position.copy(M.position).addScaledVector(l,-60).setY(M.position.y+20),H.target.copy(M.position)}}const o=E.position.distanceTo(H.target);if(Te&&!t){const i=o>Is,l=M.position.lengthSq()>0;if(Te.visible=i&&l,M.visible=!i,i&&l){Te.position.copy(M.position);const c=o*.03;Te.scale.set(c,c,1)}}if(++Kt%30===0&&(rt(),Gn(),Vn()),o<100?(E.near=.1,E.far=1e4):o<5e3?(E.near=1,E.far=5e4):(E.near=o*.01,E.far=o*5),E.updateProjectionMatrix(),e&&oe?oe.update(n):t||H.update(),jt(),pe&&pe.showAirspaces.value&&s.currentFrame&&Kt%30===0){const i=s.currentFrame;pe.updateProximity(i.lon,i.lat,i.alt)}U.render(w,E),re.render(w,E)}function Lt(){Mt=requestAnimationFrame(Lt),Zt()}function Un(){if(!U)return;U.render(w,E);const n=U.domElement.toDataURL("image/png"),e=document.createElement("a");e.href=n;const t=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);e.download=`replay_${t}.png`,e.click()}function en(n){if(!s.measureMode)return;const t=u.value.getBoundingClientRect(),o=new bn((n.clientX-t.left)/t.width*2-1,-((n.clientY-t.top)/t.height)*2+1),i=new wo;i.setFromCamera(o,E);const l=M?M.position.y:0,c=new bo(new G(0,1,0),-l),r=new G;if(i.ray.intersectPlane(c,r),!r)return;const f=_t(r);s.measurePoints.push(f),s.measurePoints.length>=2&&(tn(),s.measureMode=!1)}function tn(){At();const n=s.measurePoints;if(n.length<2)return;const e=n[0],t=n[1],o=De(e.lon,e.lat,e.alt),i=De(t.lon,t.lat,t.alt);me=new Je,me.name="__measureGroup";const l=new It().setFromPoints([o,i]),c=new an({color:16729156,linewidth:2});me.add(new So(l,c));for(const P of[o,i]){const z=new rn(.6,8,8),se=new zt({color:16729156}),ie=new ee(z,se);ie.position.copy(P),me.add(ie)}const r=$n(e.lat,e.lon,t.lat,t.lon),f=On(e.lat,e.lon,t.lat,t.lon),v=r>=1?`${r.toFixed(2)} km`:`${(r*1e3).toFixed(0)} m`;et.value=`距离: ${v}  方位: ${f.toFixed(1)}°`;const C=o.clone().lerp(i,.5),x=document.createElement("div");x.style.cssText="background:rgba(0,0,0,0.8);color:#ff6666;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;border:1px solid #ff4444;",x.textContent=`${v} / ${f.toFixed(1)}°`;const T=new ut(x);T.position.copy(C).add(new G(0,2,0)),me.add(T),w.add(me)}function At(){me&&(me.traverse(n=>{n instanceof ut&&n.element.remove()}),w.remove(me),me=null),et.value=""}function $n(n,e,t,o){const l=(t-n)*Math.PI/180,c=(o-e)*Math.PI/180,r=Math.sin(l/2)**2+Math.cos(n*Math.PI/180)*Math.cos(t*Math.PI/180)*Math.sin(c/2)**2;return 6371*2*Math.atan2(Math.sqrt(r),Math.sqrt(1-r))}function On(n,e,t,o){const i=(o-e)*Math.PI/180,l=n*Math.PI/180,c=t*Math.PI/180,r=Math.sin(i)*Math.cos(c),f=Math.cos(l)*Math.sin(c)-Math.sin(l)*Math.cos(c)*Math.cos(i);return(Math.atan2(r,f)*180/Math.PI+360)%360}function Gn(){const n=m.value;if(!n)return;const e=s.overviewFrames;if(e.length<2)return;const t=n.getContext("2d"),o=n.width,i=n.height;let l=1/0,c=-1/0,r=1/0,f=-1/0;const v=e.filter(R=>R.lon!==0||R.lat!==0);if(v.length<2)return;for(const R of v)R.lon<l&&(l=R.lon),R.lon>c&&(c=R.lon),R.lat<r&&(r=R.lat),R.lat>f&&(f=R.lat);const C=c-l||.01,x=f-r||.01,T=.05;l-=C*T,c+=C*T,r-=x*T,f+=x*T;const P=R=>(R-l)/(c-l)*(o-10)+5,z=R=>(1-(R-r)/(f-r))*(i-10)+5;t.clearRect(0,0,o,i),t.fillStyle="rgba(10, 14, 23, 0.85)",t.fillRect(0,0,o,i),t.strokeStyle="#1e293b",t.lineWidth=1,t.strokeRect(0,0,o,i),t.beginPath(),t.strokeStyle="#3b82f6",t.lineWidth=1.5;let se=!1;for(const R of v){const Ae=P(R.lon),X=z(R.lat);se?t.lineTo(Ae,X):(t.moveTo(Ae,X),se=!0)}t.stroke();const ie=s.currentFrame;if(ie&&(ie.lon!==0||ie.lat!==0)){const R=P(ie.lon),Ae=z(ie.lat);t.beginPath(),t.arc(R,Ae,4,0,Math.PI*2),t.fillStyle="#ef4444",t.fill(),t.strokeStyle="#fff",t.lineWidth=1,t.stroke()}}function Wn(n){const e=m.value;if(!e)return;const o=s.overviewFrames.filter(X=>X.lon!==0||X.lat!==0);if(o.length<2)return;const i=e.getBoundingClientRect(),l=n.clientX-i.left,c=n.clientY-i.top;let r=1/0,f=-1/0,v=1/0,C=-1/0;for(const X of o)X.lon<r&&(r=X.lon),X.lon>f&&(f=X.lon),X.lat<v&&(v=X.lat),X.lat>C&&(C=X.lat);const x=f-r||.01,T=C-v||.01;r-=x*.05,f+=x*.05,v-=T*.05,C+=T*.05;const P=e.width,z=e.height,se=r+(l-5)/(P-10)*(f-r),ie=C-(c-5)/(z-10)*(C-v);let R=o[0],Ae=1/0;for(const X of o){const on=(X.lon-se)**2+(X.lat-ie)**2;on<Ae&&(Ae=on,R=X)}s.seek(R.t)}function Vn(){const n=p.value;if(!n)return;const e=s.overviewFrames;if(e.length<2)return;const t=n.getContext("2d"),o=n.width,i=n.height;let l=1/0,c=-1/0;for(const z of e)z.alt>0&&(z.alt<l&&(l=z.alt),z.alt>c&&(c=z.alt));if(l>=c)return;l=Math.max(0,l-100),c+=100;const r=e[0].t,v=e[e.length-1].t-r||1,C=z=>(z-r)/v*(o-4)+2,x=z=>i-4-(z-l)/(c-l)*(i-8);t.clearRect(0,0,o,i),t.fillStyle="rgba(10, 14, 23, 0.85)",t.fillRect(0,0,o,i),t.strokeStyle="#1e293b",t.lineWidth=1,t.strokeRect(0,0,o,i),t.beginPath(),t.strokeStyle="#10b981",t.lineWidth=1.5;let T=!1;for(const z of e){if(z.alt<=0)continue;const se=C(z.t),ie=x(z.alt);T?t.lineTo(se,ie):(t.moveTo(se,ie),T=!0)}t.stroke(),T&&(t.lineTo(C(e[e.length-1].t),i-4),t.lineTo(C(e[0].t),i-4),t.closePath(),t.fillStyle="rgba(16, 185, 129, 0.1)",t.fill());const P=C(s.currentTime);t.beginPath(),t.strokeStyle="#ef4444",t.lineWidth=1.5,t.moveTo(P,2),t.lineTo(P,i-2),t.stroke(),t.fillStyle="#64748b",t.font="9px monospace",t.textAlign="left",t.fillText(`${c.toFixed(0)}m`,4,12),t.fillText(`${l.toFixed(0)}m`,4,i-4)}function Nn(n){const e=p.value;if(!e)return;const t=s.overviewFrames;if(t.length<2)return;const o=e.getBoundingClientRect(),i=n.clientX-o.left,l=e.width,c=t[0].t,r=t[t.length-1].t,f=c+(i-2)/(l-4)*(r-c);let v=t[0];for(const C of t)Math.abs(C.t-f)<Math.abs(v.t-f)&&(v=C);xt.value=v.t,Wt.value=`t=${v.t.toFixed(1)}s  H=${v.alt.toFixed(0)}m`,Gt.value={left:`${n.clientX-o.left+(o.left-u.value.getBoundingClientRect().left)}px`,bottom:`${u.value.clientHeight-(o.top-u.value.getBoundingClientRect().top)+4}px`}}function Hn(n){const e=p.value;if(!e)return;const t=s.overviewFrames;if(t.length<2)return;const o=e.getBoundingClientRect(),i=n.clientX-o.left,l=e.width,c=t[0].t,r=t[t.length-1].t,f=c+(i-2)/(l-4)*(r-c);s.seek(Math.max(c,Math.min(r,f)))}a({takeScreenshot:Un,airspaceOverlay:pe});function nn(){const n=u.value;if(!n)return;const e=n.clientWidth,t=n.clientHeight;E.aspect=e/t,E.updateProjectionMatrix(),U.setSize(e,t),re.setSize(e,t),ae&&ae.material.resolution.set(e,t),q&&!q.isDestroyed()&&q.resize()}return Z(()=>s.visibleOverviewFrames,it),Z(()=>s.overviewTrailVisible,it),Z(()=>s.trailVisible,n=>{ae&&(ae.visible=n)}),Z($,n=>{if(!u.value)return;const e=n===100?"":`brightness(${n/100})`;u.value.querySelectorAll("canvas").forEach(t=>{t.style.filter=e})}),Z(()=>s.filteredActions,()=>{je="",at(),rt()}),Z(()=>s.showAllMarkerLabels,()=>{je="",at(),rt()}),Z(()=>s.sceneTheme,n=>{Nt(n)}),Z(()=>s.currentFile,()=>{he=[],Ce=null,Le=!1,kt=0}),Z(()=>s.currentTime,(n,e)=>{Math.abs(n-e)>2&&(he=[],Ce=null)}),Z(()=>s.currentSortieId,async n=>{if(!n){fe&&(Et(),w.remove(M),M=Xt(),w.add(M),fe=!1,ve=null,nt=null);return}try{const e=await Ro(n),t=await Bo(e.aircraft_type_id);if(t.model_file){if(nt===t.id)return;const o=t.model_config?JSON.parse(t.model_config):{scale:1,heading_offset:0,pitch_offset:0,roll_offset:0};await Fn(t.id,o)}else fe&&(Et(),w.remove(M),M=Xt(),w.add(M),fe=!1,ve=null,nt=null)}catch(e){console.warn("加载机型模型信息失败:",e)}},{immediate:!0}),Z(()=>s.startFromTakeoff,()=>{he=[],Ce=null,ae.geometry.dispose(),ae.geometry=new yt}),Z(()=>s.overviewFrames.length,()=>{console.log(`watch触发: overviewFrames.length=${s.overviewFrames.length}`),s.overviewFrames.length>0&&(Se.value=Mn(s.overviewFrames),console.log(`地面检测结果: ${Se.value}`),Se.value!==null&&(console.log(`检测到地面高度: ${Se.value}m MSL`),st=0,it(),Qt()))},{immediate:!0}),Z(()=>s.zoomToAircraftSignal,()=>{if(!M)return;const n=M.position.clone();H.target.copy(n),E.position.set(n.x,n.y+30,n.z+40),H.update()}),Z(()=>s.cameraMode,n=>{n==="roam"?(H.enabled=!1,oe&&(oe.syncFromCamera(),oe.enabled=!0),M.visible=!0):n==="cockpit"?(H.enabled=!1,oe&&(oe.enabled=!1),M.visible=!1):(oe&&(oe.enabled=!1),H.enabled=!0,H.enableRotate=!0,H.enablePan=n!=="follow",M.visible=!0)}),Z(()=>s.measureMode,n=>{n&&(s.measurePoints=[],At())}),Z(()=>s.measurePoints.length,()=>{s.measurePoints.length>=2&&tn()}),qn(()=>{Cn(),Lt(),window.addEventListener("resize",nn),U.domElement.addEventListener("click",en),s.visibleOverviewFrames.length>0&&it(),s.filteredActions.length>0&&In()}),Xn(()=>{cancelAnimationFrame(Mt),window.removeEventListener("resize",nn),U&&U.domElement.removeEventListener("click",en),at(),At(),Tt(),oe==null||oe.dispose(),pe==null||pe.dispose(),H.dispose(),U.dispose()}),(n,e)=>(L(),A("div",{ref_key:"containerRef",ref:u,class:"scene3d"},[b(s).sceneTheme==="cesiumMap"&&St.value?(L(),A("div",No,B(St.value),1)):le("",!0),ce(d("div",{class:Xe(["minimap-wrapper",{"minimap-collapsed":Be.value}])},[d("button",{class:"minimap-toggle",onClick:e[0]||(e[0]=t=>Be.value=!Be.value),title:Be.value?"展开地图":"收起地图"},B(Be.value?"◻":"▾"),9,Ho),ce(d("canvas",{ref_key:"minimapRef",ref:m,class:"minimap",width:"140",height:"140",onClick:Wn},null,512),[[lt,!Be.value]])],2),[[lt,b(s).overviewFrames.length>0]]),ce(d("div",jo,[d("div",{class:"profile-toggle",onClick:e[1]||(e[1]=t=>tt.value=!tt.value)},B(tt.value?"▼ 高度":"▲ 高度"),1),ce(d("canvas",{ref_key:"profileRef",ref:p,class:"altitude-profile",width:"400",height:"80",onMousemove:Nn,onMouseleave:e[2]||(e[2]=t=>xt.value=null),onClick:Hn},null,544),[[lt,tt.value]])],512),[[lt,b(s).overviewFrames.length>0]]),xt.value!==null?(L(),A("div",{key:1,class:"profile-tooltip",style:de(Gt.value)},B(Wt.value),5)):le("",!0),et.value?(L(),A("div",qo,B(et.value),1)):le("",!0),b(pe)&&b(pe).proximityAlerts.value.length>0?(L(),A("div",Xo,[(L(!0),A(Re,null,Ue(b(pe).proximityAlerts.value,t=>(L(),A("div",{key:t.airspaceId,class:"alert-item"}," ⚠ "+B(t.airspaceName)+" ("+B(t.type)+") ",1))),128))])):le("",!0),b(y).state.value.active?(L(),A("div",Yo,[e[16]||(e[16]=d("span",{class:"stream-dot"},null,-1)),Yn(" 推流中 · "+B(b(y).state.value.viewerCount)+" 人观看 ",1),d("button",{class:"stream-stop",onClick:g},"停止"),d("button",{class:"stream-cfg-btn",onClick:e[3]||(e[3]=t=>_.value=!_.value)},"设置")])):(L(),A("div",Jo,[d("button",{class:"stream-btn",onClick:h,title:"开始像素推流"},"推流"),d("button",{class:"stream-cfg-btn",onClick:e[4]||(e[4]=t=>_.value=!_.value),title:"推流设置"},"⚙")])),_.value?(L(),A("div",Qo,[e[26]||(e[26]=d("div",{class:"scfg-title"},"推流设置",-1)),d("div",Ko,[e[18]||(e[18]=d("label",null,"画质",-1)),ce(d("select",{"onUpdate:modelValue":e[5]||(e[5]=t=>b(y).config.maxBitrateMbps=t),onChange:e[6]||(e[6]=t=>b(y).updateBitrate())},[...e[17]||(e[17]=[d("option",{value:4},"流畅 4Mbps",-1),d("option",{value:8},"高清 8Mbps",-1),d("option",{value:16},"超清 16Mbps",-1),d("option",{value:30},"极清 30Mbps",-1),d("option",{value:50},"无损 50Mbps",-1),d("option",{value:80},"专业 80Mbps",-1)])],544),[[Ft,b(y).config.maxBitrateMbps,void 0,{number:!0}]])]),d("div",Zo,[e[20]||(e[20]=d("label",null,"帧率",-1)),ce(d("select",{"onUpdate:modelValue":e[7]||(e[7]=t=>b(y).config.fps=t)},[...e[19]||(e[19]=[d("option",{value:30},"30fps",-1),d("option",{value:60},"60fps",-1)])],512),[[Ft,b(y).config.fps,void 0,{number:!0}]])]),d("div",es,[e[21]||(e[21]=d("label",null,"编码",-1)),ce(d("select",{"onUpdate:modelValue":e[8]||(e[8]=t=>b(y).config.codec=t)},[(L(!0),A(Re,null,Ue(te.value,t=>(L(),A("option",{key:t.id,value:t.id,disabled:!t.supported},B(t.label)+B(t.supported?"":" (不支持)"),9,ts))),128))],512),[[Ft,b(y).config.codec]])]),e[27]||(e[27]=d("div",{class:"scfg-divider"},null,-1)),e[28]||(e[28]=d("div",{class:"scfg-title"},"共享内容",-1)),d("label",ns,[ce(d("input",{type:"checkbox","onUpdate:modelValue":e[9]||(e[9]=t=>b(y).config.shareTimeline=t)},null,512),[[ct,b(y).config.shareTimeline]]),e[22]||(e[22]=d("span",null,"时间轴",-1))]),d("label",os,[ce(d("input",{type:"checkbox","onUpdate:modelValue":e[10]||(e[10]=t=>b(y).config.shareActions=t)},null,512),[[ct,b(y).config.shareActions]]),e[23]||(e[23]=d("span",null,"动作识别结果",-1))]),d("label",ss,[ce(d("input",{type:"checkbox","onUpdate:modelValue":e[11]||(e[11]=t=>b(y).config.shareFlightInfo=t)},null,512),[[ct,b(y).config.shareFlightInfo]]),e[24]||(e[24]=d("span",null,"飞行状态参数",-1))]),e[29]||(e[29]=d("div",{class:"scfg-divider"},null,-1)),d("label",is,[ce(d("input",{type:"checkbox","onUpdate:modelValue":e[12]||(e[12]=t=>b(y).config.laserEnabled=t)},null,512),[[ct,b(y).config.laserEnabled]]),e[25]||(e[25]=d("span",null,"激光笔",-1)),b(y).config.laserEnabled?(L(),A("span",as,"按住左键指示")):le("",!0)])])):le("",!0),V.value?(L(),A("div",{key:7,class:"laser-dot",style:de({left:O.x+"px",top:O.y+"px"})},[...e[30]||(e[30]=[d("span",{class:"laser-ring"},null,-1)])],4)):le("",!0),d("div",rs,[d("button",{class:"brightness-btn",onClick:e[13]||(e[13]=t=>ne.value=!ne.value),title:"亮度调节"},"☀"),ne.value?(L(),A("div",ls,[e[31]||(e[31]=d("span",{class:"bs-label"},"亮度",-1)),ce(d("input",{type:"range",min:"50",max:"200",step:"5","onUpdate:modelValue":e[14]||(e[14]=t=>$.value=t)},null,512),[[Jn,$.value,void 0,{number:!0}]]),d("span",cs,B($.value)+"%",1),$.value!==100?(L(),A("button",{key:0,class:"bs-reset",onClick:e[15]||(e[15]=t=>$.value=100)},"重置")):le("",!0)])):le("",!0)]),b(s).cameraMode==="cockpit"&&b(s).currentFrame?(L(),A("div",ds,[d("div",us,[d("div",fs,[d("div",ps,[d("div",{class:"hdg-tape",style:de({transform:`translateX(${-b(s).currentFrame.heading*2.2}px)`})},[(L(!0),A(Re,null,Ue(S.value,t=>(L(),A("div",{key:t.deg,class:Xe(["hdg-tick",{major:t.cardinal}]),style:de({left:t.deg*2.2+"px"})},[t.deg%10===0?(L(),A("span",ms,B(t.label),1)):le("",!0)],6))),128))],4)]),e[32]||(e[32]=d("div",{class:"hdg-caret"},"▽",-1)),d("div",hs,B(String(Math.round(b(s).currentFrame.heading)%360).padStart(3,"0"))+"°",1)]),d("div",{class:"hud-pitch-ladder",style:de({transform:`rotate(${-b(s).currentFrame.roll}deg)`})},[d("div",{class:"pitch-scroll",style:de({transform:`translateY(${b(s).currentFrame.pitch*5}px)`})},[(L(!0),A(Re,null,Ue(Ve.value,t=>(L(),A("div",{key:t,class:Xe(["pitch-bar",{neg:t<0,zero:t===0}]),style:de({top:`calc(50% - ${t*5}px)`})},[d("span",vs,B(t!==0?Math.abs(t):""),1),d("span",gs,B(t!==0?Math.abs(t):""),1)],6))),128))],4)],4),e[36]||(e[36]=d("div",{class:"hud-waterline"},[d("div",{class:"wl-wing wl-l"}),d("div",{class:"wl-dot"}),d("div",{class:"wl-wing wl-r"})],-1)),d("div",{class:"hud-fpm",style:de(Ne.value)},[...e[33]||(e[33]=[Qn('<svg width="28" height="28" viewBox="0 0 28 28" data-v-8d8c8ad1><circle cx="14" cy="14" r="6" fill="none" stroke="#00ff41" stroke-width="1.5" data-v-8d8c8ad1></circle><line x1="0" y1="14" x2="8" y2="14" stroke="#00ff41" stroke-width="1.5" data-v-8d8c8ad1></line><line x1="20" y1="14" x2="28" y2="14" stroke="#00ff41" stroke-width="1.5" data-v-8d8c8ad1></line><line x1="14" y1="0" x2="14" y2="8" stroke="#00ff41" stroke-width="1.5" data-v-8d8c8ad1></line></svg>',1)])],4),d("div",ys,[d("div",ws,[d("div",{class:"tape-scroll",style:de({transform:`translateY(${b(s).currentFrame.speed*.8}px)`})},[(L(!0),A(Re,null,Ue(ze.value,t=>(L(),A("div",{key:t,class:"tape-tick",style:de({top:`calc(50% - ${t*.8}px)`})},[d("span",bs,B(t),1),e[34]||(e[34]=d("span",{class:"tick-line"},null,-1))],4))),128))],4)]),d("div",Ss,[d("span",xs,B(Math.round(b(s).currentFrame.speed)),1)])]),d("div",Ms,[d("div",Cs,[d("div",{class:"tape-scroll",style:de({transform:`translateY(${b(s).currentFrame.alt*.06}px)`})},[(L(!0),A(Re,null,Ue(xe.value,t=>(L(),A("div",{key:t,class:"tape-tick",style:de({top:`calc(50% - ${t*.06}px)`})},[e[35]||(e[35]=d("span",{class:"tick-line-r"},null,-1)),d("span",ks,B(t),1)],4))),128))],4)]),d("div",_s,[d("span",Ts,B(Math.round(b(s).currentFrame.alt)),1)])]),d("div",Es,[d("div",{class:Xe(["hud-g",{gwarn:b(s).currentFrame.g_load>5||b(s).currentFrame.g_load<-1}])},B(b(s).currentFrame.g_load.toFixed(1))+" G ",3),b(s).currentFrame.mach>.3?(L(),A("div",Ps," M "+B(b(s).currentFrame.mach.toFixed(2)),1)):le("",!0)]),d("div",Ls,[d("div",As," AOA "+B(b(s).currentFrame.aoa.toFixed(1)),1),d("div",{class:Xe(["hud-vs",{vsup:b(s).currentFrame.vario>2,vsdn:b(s).currentFrame.vario<-2}])},B(b(s).currentFrame.vario>0?"+":"")+B(Math.round(b(s).currentFrame.vario))+" M/S ",3)])])])):le("",!0)],512))}}),Vs=Uo(Ds,[["__scopeId","data-v-8d8c8ad1"]]);export{Vs as S};
