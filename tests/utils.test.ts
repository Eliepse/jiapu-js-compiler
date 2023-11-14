import {describe, expect,  test} from "bun:test";
import {intToAlpha} from "../src/utils";

describe("intToAlpha", () => {
    test("only accepts integers", () => {
        expect(() => intToAlpha(42)).not.toThrow();
        expect(() => intToAlpha(0.3)).toThrow();
        expect(() => intToAlpha(Number.NaN)).toThrow();
    });

    test("convert decimal to base 52 ([a-zA-Z])", () => {
        expect(intToAlpha(0)).toBe("a");
        expect(intToAlpha(25)).toBe("z");
        expect(intToAlpha(26)).toBe("A");
        expect(intToAlpha(52)).toBe("aa");
        expect(intToAlpha(2704)).toBe("Za");
        expect(intToAlpha(8934)).toBe("cpQ");
    });
});

