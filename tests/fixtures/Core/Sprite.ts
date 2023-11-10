import { CanvasNode } from "./CanvasNode";
import { DEFAULT_POSTION } from "./Node2D";

export class Sprite extends CanvasNode {
  private relativePosition: string = DEFAULT_POSTION;

  constructor() {
    super();

    const test = "";

    useHelper();
  }
}

function helper() {
  console.debug("help!");
}

export function useHelper() {
  helper();
}
