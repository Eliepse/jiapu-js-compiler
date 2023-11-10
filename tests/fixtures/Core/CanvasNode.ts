import { RectangleShape } from "../Shape/RectangleShape";
import type { Shape } from "../Shape/Shape";
import { Node2D } from "./Node2D";

export class CanvasNode extends Node2D {
  private children = new Set<Node2D>();
  private bounding: Shape;

  constructor() {
    super();

    this.bounding = new RectangleShape();
  }

  addChild(entity: Node2D) {
    this.children.add(entity);
  }

  removeChild(entity: Node2D) {
    this.children.delete(entity);
  }
}
