import {test, expect} from "bun:test";
import {intToAlpha} from "../src/utils";

test("inToAlpha", () => {
    expect(intToAlpha(0)).toBe("a");
    expect(intToAlpha(25)).toBe("z");
    expect(intToAlpha(26)).toBe("A");
    expect(intToAlpha(52)).toBe("aa");
    expect(intToAlpha(2704)).toBe("Za");
    expect(intToAlpha(8934)).toBe("cpQ");

})