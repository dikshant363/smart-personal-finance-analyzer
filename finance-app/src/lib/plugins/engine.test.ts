import { describe, it, expect, vi } from "vitest";
import { PluginRegistry, PluginManifest } from "./engine";

describe("Plugin Registry", () => {
  it("enforces boundary scopes and performs runtime context modifications", () => {
    const registry = new PluginRegistry();

    const manifest: PluginManifest = {
      id: "ai-prompt-decorator",
      name: "AI Prompt Decorator",
      version: "1.0.0",
      description: "Appends transaction stats to AI prompt context",
      permissions: ["ai:prompts"],
      entryPoint: "https://plugins.local/ai.js",
    };

    const registered = registry.registerPlugin(manifest);
    expect(registered).toBe(true);

    // Should not execute until enabled
    expect(registry.hasPermission("ai-prompt-decorator", "ai:prompts")).toBe(false);

    registry.enablePlugin("ai-prompt-decorator");
    expect(registry.hasPermission("ai-prompt-decorator", "ai:prompts")).toBe(true);

    // Trigger hooks context modification execution
    const runner = vi.fn().mockImplementation((plugin, ctx: string) => {
      return `${ctx} (Enhanced by ${plugin.name})`;
    });

    const finalPrompt = registry.executeHook<string>(
      "ai:prompts",
      "onPreparePrompt",
      "Hello copilot",
      runner
    );

    expect(runner).toHaveBeenCalledTimes(1);
    expect(finalPrompt).toBe("Hello copilot (Enhanced by AI Prompt Decorator)");
  });
});
