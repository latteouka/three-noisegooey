import * as THREE from "three";
import vertex from "../glsl/item.vert";
import fragment from "../glsl/item.frag";
import { MyObject3D } from "../webgl/myObject3D";
import { Update } from "../libs/update";
import { Func } from "../core/func";
import { TexLoader } from "../webgl/texLoader";
import { MousePointer } from "../core/mousePointer";
import gsap from "gsap";

function getResolution(imageHeight: number, imageWidth: number) {
  const imageAspect = imageHeight / imageWidth;
  const width = Func.instance.sw();
  const height = Func.instance.sh();
  let a1, a2;
  if (height / width > imageAspect) {
    a1 = (width / height) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = height / width / imageAspect;
  }

  return { width, height, a1, a2 };
}

export class Item extends MyObject3D {
  mesh: ItemMesh;
  material: THREE.ShaderMaterial;

  constructor() {
    super();

    const { width, height, a1, a2 } = getResolution(1, 1);
    const cover = getResolution(853, 1280);
    const geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        u_time: { value: Update.instance.elapsed },
        u_texture: { value: TexLoader.instance.get("/img/latte.webp") },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_resolution: {
          value: new THREE.Vector4(width, height, a1, a2),
        },
        u_cover: {
          value: new THREE.Vector4(
            cover.width,
            cover.height,
            cover.a1,
            cover.a2
          ),
        },
        u_intersect: {
          value: new THREE.Vector2(0, 0),
        },
        u_radius: {
          value: 1,
        },
        u_insideRadius: {
          value: 1,
        },
        u_cursorRadius: {
          value: 1,
        },
      },
    });

    this.mesh = new ItemMesh(geometry, this.material);
    this.mesh.scale.set(Func.instance.sw() * 0.9, Func.instance.sh() * 0.9, 1);
    this.add(this.mesh);
  }

  protected _update(): void {
    super._update();

    this.rotation.x = 1.0 * MousePointer.instance.normal.y * 0.02;
    this.rotation.y = 1.0 * MousePointer.instance.normal.x * 0.02;

    this.material.uniforms.u_time.value = Update.instance.elapsed;
    this.material.uniforms.u_mouse.value.set(
      (MousePointer.instance.normal.x + 1) / 2,
      (-MousePointer.instance.normal.y + 1) / 2
    );
  }

  protected _resize(): void {
    super._resize();
    this.mesh.scale.set(Func.instance.sw() * 0.9, Func.instance.sh() * 0.9, 1);

    const { width, height, a1, a2 } = getResolution(1, 1);
    const cover = getResolution(853, 1280);
    this.material.uniforms.u_resolution.value.set(width, height, a1, a2);
    this.material.uniforms.u_cover.value.set(
      cover.width,
      cover.height,
      cover.a1,
      cover.a2
    );
  }
}

export class ItemMesh extends THREE.Mesh {
  constructor(geo: THREE.PlaneGeometry, mat: THREE.ShaderMaterial) {
    super(geo, mat);
  }

  onHover() {
    document.body.style.cursor = "pointer";
    const material = this.material as THREE.ShaderMaterial;
    gsap.to(material.uniforms.u_radius, {
      value: 2.8,
      duration: 2,
    });

    gsap.to(material.uniforms.u_insideRadius, {
      value: 1,
      duration: 0.8,
    });

    gsap.to(material.uniforms.u_cursorRadius, {
      value: 1,
      duration: 0.8,
    });
  }

  onClick() {}

  onTouchLeave() {
    document.body.style.cursor = "default";
    const material = this.material as THREE.ShaderMaterial;
    material.uniforms.u_intersect.value = material.uniforms.u_mouse.value;
    gsap.to(material.uniforms.u_radius, {
      value: 1,
      duration: 2,
    });

    gsap.to(material.uniforms.u_insideRadius, {
      value: 0,
      duration: 0.8,
    });

    gsap.to(material.uniforms.u_cursorRadius, {
      value: 0,
      duration: 0.8,
    });
  }
}
