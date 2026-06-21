import { describe, expect, it } from "vitest";
import { generateInsights } from "./insights";
import { getPreset } from "./actions";
import type { LoggedAction } from "./types";

function log(...ids: string[]): LoggedAction[] {
  return ids.map((id, i) => {
    const preset = getPreset(id);
    if (!preset) throw new Error(`unknown preset ${id}`);
    return { ...preset, uid: `u${i}`, loggedAt: i };
  });
}

describe("generateInsights", () => {
  it("prompts the user to log something on an empty day", () => {
    const insights = generateInsights([]);
    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe("empty");
    expect(insights[0].tone).toBe("info");
  });

  it("celebrates a net-positive (net <= 0) day", () => {
    const insights = generateInsights(log("tree", "cycle"));
    const net = insights.find((i) => i.id === "net");
    expect(net?.tone).toBe("good");
  });

  it("warns hard on a heavy day and names the top emitting category", () => {
    const insights = generateInsights(log("flight"));
    const net = insights.find((i) => i.id === "net");
    const top = insights.find((i) => i.id === "top");
    expect(net?.tone).toBe("warning"); // net > 10
    expect(top?.text).toContain("Transport");
  });

  it("acknowledges savings when the user made greener choices", () => {
    const insights = generateInsights(log("beef", "cycle"));
    const saved = insights.find((i) => i.id === "saved");
    expect(saved?.tone).toBe("good");
  });

  it("omits the savings tip when nothing was saved", () => {
    const insights = generateInsights(log("beef"));
    expect(insights.find((i) => i.id === "saved")).toBeUndefined();
  });
});
