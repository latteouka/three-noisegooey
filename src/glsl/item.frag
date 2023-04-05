#include snoise3d.glsl;

uniform float u_time;
uniform float u_radius;
uniform float u_insideRadius;
uniform float u_cursorRadius;
uniform vec4 u_resolution;
uniform vec4 u_cover;
uniform vec2 u_mouse;
uniform vec2 u_intersect;
uniform sampler2D u_texture;

varying vec3 v_pos;
varying vec2 v_uv;

void main(void) {
  float time = u_time * 0.0001;

  vec2 coverUv = (v_uv - vec2(0.5)) * u_cover.zw + vec2(0.5);
  vec2 newUv = (v_uv - vec2(0.5)) * u_resolution.zw + vec2(0.5);
  vec2 mouse = (u_mouse - vec2(0.5)) * u_resolution.zw + vec2(0.5);
  vec2 intersect = (u_intersect - vec2(0.5)) * u_resolution.zw + vec2(0.5);

  float offx = v_uv.x + sin(v_uv.y + u_time * 0.1);
  float offy = v_uv.y - u_time * 0.1 - cos(u_time * 0.01) * 0.01;
  float n = snoise(vec3(offx, offy, u_time * 0.1) * 5.0) * 0.5 - 1.0;

  // radius
  float mouseDistance = length(newUv - mouse);
  float intersectDistance = length(newUv - intersect);

  // inside blob(mouse position)
  float inside = smoothstep(0.2 * u_insideRadius, 0.0, mouseDistance) * 4.0;
  float insideMask = smoothstep(0.4, 0.5, n + inside);

  // cursor blob(intersect position)
  // bigger edge smaller center
  float mouseRadius = u_cursorRadius * (1.0 + smoothstep(0.15, 0.45, distance(intersect, vec2(0.5))));
  float smoothMouse = smoothstep(0.1 * mouseRadius, 0.0, intersectDistance) * 4.0;
  float finalMask = smoothstep(0.4, 0.5, n + smoothMouse);

  // background blob
  float backgroundRadius = 0.5 * u_radius;
  float dis = length(newUv - vec2(0.5));
  float backgroundBlob = smoothstep(backgroundRadius, 0.0, dis) * 4.0;
  float backgroundMask = smoothstep(0.4, 0.5, n + backgroundBlob);

  vec4 blob = vec4(vec3(0.973, 0.812, 0.812), 1.0);
  vec4 color = texture2D(u_texture, coverUv);

  vec4 finalImage = color * backgroundMask;

  // vec4 final = mix(finalImage, blob, insideMask);
  vec4 final2 = mix(finalImage, blob, finalMask);

	// gl_FragColor = vec4(vec3(smoothMouse), 1.);
	gl_FragColor = final2;

  // gl_FragColor = color;
}
