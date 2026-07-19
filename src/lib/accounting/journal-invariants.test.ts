import { describe, it, expect } from "vitest";
import {
  assertBalanced,
  assertNotOverApplied,
  isBalanced,
  sumCredits,
  sumDebits,
} from "./journal-invariants";

describe("journal balancing invariant", () => {
  it("accepts an entry whose debits equal credits", () => {
    const lines = [
      { debit: 100, credit: 0 },
      { debit: 0, credit: 100 },
    ];
    expect(isBalanced(lines)).toBe(true);
    expect(() => assertBalanced(lines)).not.toThrow();
    expect(sumDebits(lines)).toBe(100);
    expect(sumCredits(lines)).toBe(100);
  });

  it("accepts multi-line balanced entries", () => {
    const lines = [
      { debit: 60, credit: 0 },
      { debit: 40, credit: 0 },
      { debit: 0, credit: 100 },
    ];
    expect(isBalanced(lines)).toBe(true);
  });

  it("rejects an unbalanced entry", () => {
    const lines = [
      { debit: 100, credit: 0 },
      { debit: 0, credit: 90 },
    ];
    expect(isBalanced(lines)).toBe(false);
    expect(() => assertBalanced(lines)).toThrow(/Unbalanced entry/);
  });

  it("tolerates sub-half-cent rounding noise", () => {
    const lines = [
      { debit: 100.004, credit: 0 },
      { debit: 0, credit: 100 },
    ];
    expect(isBalanced(lines)).toBe(true);
  });
});

describe("posting over-application rejection", () => {
  it("allows applying up to the outstanding balance", () => {
    expect(() => assertNotOverApplied(250, 250)).not.toThrow();
    expect(() => assertNotOverApplied(100, 250)).not.toThrow();
  });

  it("rejects applying more than outstanding", () => {
    expect(() => assertNotOverApplied(300, 250)).toThrow(/Over-application rejected/);
  });
});
