const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; //  52 chars

export function intToAlpha(int: number): string {
    if (!Number.isInteger(int)) {
        throw new Error("Can only convert integer");
    }

    let output = "", quotient = int;

    do {
        output = ALPHA[quotient % 52] + output;
        quotient = Math.floor(quotient / 52);
    } while (quotient > 52);

    if(quotient > 0) {
        output = ALPHA[quotient - 1] + output;
    }

    return output;
}