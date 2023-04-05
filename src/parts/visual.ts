import * as THREE from "three";
import { Func } from "../core/func";
import { Canvas } from "../webgl/canvas";
import { Object3D } from "three/src/core/Object3D";
import { Update } from "../libs/update";
import { Item } from "./Item";
import { MousePointer } from "../core/mousePointer";

export class Visual extends Canvas {
  private _con: Object3D;

  private _item: Item;
  private _ray = new THREE.Raycaster();
  private _hovered: { [key: string]: any } = {};
  private _intersects: any;

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    this._item = new Item();

    this._con.add(this._item);

    this._resize();
  }

  protected _update(): void {
    super._update();

    this.intersect();

    if (this.isNowRenderFrame()) {
      this._render();
    }
  }

  protected intersect() {
    /// without this vec2 calculation raycasting will be wrong
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = MousePointer.instance.x - rect.left;
    const y = MousePointer.instance.y - rect.top;
    this._ray.setFromCamera(
      {
        x: (x / this.el.clientWidth) * 2 - 1,
        y: (y / this.el.clientHeight) * -2 + 1,
      },
      this.cameraPers
    );
    ///

    this._intersects = this._ray.intersectObjects(
      this.mainScene.children,
      true
    );

    // hover
    this._intersects.forEach((hit: any) => {
      this._item.material.uniforms.u_intersect.value = hit.uv;
      if (!this._hovered[hit.object.uuid]) {
        this._hovered[hit.object.uuid] = hit;
      } else {
        if (hit.object.onHover) hit.object.onHover();
      }
    });

    // object and leave
    Object.keys(this._hovered).forEach((key) => {
      const hit = this._intersects.find((hit: any) => hit.object.uuid === key);
      if (hit === undefined) {
        const hoveredItem = this._hovered[key];
        if (hoveredItem.object.onTouchLeave) hoveredItem.object.onTouchLeave();
        delete this._hovered[key];
      }
    });
  }

  private _render(): void {
    this.renderer.setClearColor("#000", 1);
    this.renderer.render(this.mainScene, this.cameraPers);
  }

  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0;
  }

  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 90;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
