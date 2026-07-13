/**
 * Secure Plugin Architecture Engine
 * Sprint 11.7 — Platform Extensibility & Developer Ecosystem
 *
 * Implements sandbox isolation validation for third-party extensions,
 * managing system permissions and dynamic hooks execution.
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  permissions: PluginPermission[];
  entryPoint: string; // JavaScript source URL or compiled payload reference
}

export type PluginPermission = "read:transactions" | "write:transactions" | "read:budgets" | "ai:prompts";

export interface PluginInstance {
  manifest: PluginManifest;
  isEnabled: boolean;
}

export class PluginRegistry {
  private plugins = new Map<string, PluginInstance>();

  /**
   * Registers a plugin.
   */
  public registerPlugin(manifest: PluginManifest): boolean {
    if (this.plugins.has(manifest.id)) return false;
    
    // Safety verification: Ensure requested permissions are well-defined
    const validPermissions: PluginPermission[] = [
      "read:transactions",
      "write:transactions",
      "read:budgets",
      "ai:prompts",
    ];

    const allValid = manifest.permissions.every((p) => validPermissions.includes(p));
    if (!allValid) return false;

    this.plugins.set(manifest.id, {
      manifest,
      isEnabled: false,
    });
    return true;
  }

  /**
   * Enables plugin execution.
   */
  public enablePlugin(id: string): boolean {
    const instance = this.plugins.get(id);
    if (!instance) return false;
    instance.isEnabled = true;
    return true;
  }

  /**
   * Disables plugin execution.
   */
  public disablePlugin(id: string): boolean {
    const instance = this.plugins.get(id);
    if (!instance) return false;
    instance.isEnabled = false;
    return true;
  }

  /**
   * Checks if a plugin has a specific permission.
   */
  public hasPermission(id: string, permission: PluginPermission): boolean {
    const instance = this.plugins.get(id);
    if (!instance || !instance.isEnabled) return false;
    return instance.manifest.permissions.includes(permission);
  }

  /**
   * Executes a safe hook action across all active plugins.
   */
  public executeHook<T>(
    permission: PluginPermission,
    hookName: string,
    context: T,
    sandboxRunner: (plugin: PluginManifest, ctx: T) => T
  ): T {
    let currentContext = context;

    for (const [_, instance] of this.plugins.entries()) {
      if (instance.isEnabled && instance.manifest.permissions.includes(permission)) {
        try {
          // Sandboxed execution representation
          currentContext = sandboxRunner(instance.manifest, currentContext);
        } catch (err) {
          console.error(`[PluginEngine] Error executing plugin ${instance.manifest.id}:`, err);
        }
      }
    }

    return currentContext;
  }

  public getPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }
}
