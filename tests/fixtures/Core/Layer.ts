import { CanvasNode } from "./CanvasNode";
import { Node as BaseNode } from "./Node";
import type { Node2D } from "./Node2D";

export class Layer extends BaseNode {
  private nodes = new Set<CanvasNode>();

  private addChild(node: Node2D) {
    if (node instanceof CanvasNode) {
      console.debug("Adding a canvas");
      this.nodes.add(node);
      return;
    }

    console.debug("Skipping node");
  }
}
