import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import AzDOSyncPlugin from "../main";
import { AzDOClient } from "src/client/AzDOClient";

export class AzDOSyncSettingsTab extends PluginSettingTab {
  plugin: AzDOSyncPlugin;
  client!: AzDOClient;

  constructor(app: App, plugin: AzDOSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl, plugin } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Azure DevOps" });

    this.addOrganizationUrlSetting(containerEl, plugin);

    this.addPersonalAccessTokenSetting(containerEl, plugin);

    this.addVerifyConnectionButton(containerEl, plugin);
  }

  private addOrganizationUrlSetting(
    containerEl: HTMLElement,
    plugin: AzDOSyncPlugin
  ) {
    new Setting(containerEl)
      .setName("AzDO Organization URL")
      .setDesc("Organization name for Azure DevOps.")
      .addText((text) =>
        text
          .setPlaceholder("https://dev.azure.com/MyOrganization")
          .setValue(plugin.settings.organizationUrl)
          .onChange(async (value) => {
            plugin.settings.organizationUrl = value;
            await plugin.saveSettings();
          })
      );
  }

  private addPersonalAccessTokenSetting(
    containerEl: HTMLElement,
    plugin: AzDOSyncPlugin
  ) {
    new Setting(containerEl)
      .setName("AzDO PAT")
      .setDesc("Personal Access Token for Azure DevOps.")
      .addText((text) =>
        text
          .setPlaceholder("Enter your personal access token here.")
          .setValue(plugin.settings.pat)
          .onChange(async (value) => {
            plugin.settings.pat = value;
            await plugin.saveSettings();
          })
      );
  }

  private addVerifyConnectionButton(
    containerEl: HTMLElement,
    plugin: AzDOSyncPlugin
  ) {
    new Setting(containerEl)
      .setName("Verify your connection")
      .setDesc("Click this button to verify your connection to Azure DevOps.")
      .addButton((btn) =>
        btn
          .setIcon("shield-question")
          .setTooltip("Click to verify connection to Azure DevOps.")
          .setCta()
          .onClick(async () => {
            await plugin.saveSettings();

            this.client = new AzDOClient(
              plugin.settings.organizationUrl,
              plugin.settings.pat
            );

            await this.client.connect(false);

            btn.setIcon("check");

            this.addGetProjectsButton(containerEl, plugin);
          })
      );
  }

  private addGetProjectsButton(
    containerEl: HTMLElement,
    plugin: AzDOSyncPlugin
  ) {
    // only add the button if it doesn't already exist
    if (containerEl.querySelector(".get-projects-btn") !== null) {
      return;
    }
    new Setting(containerEl).addButton((btn) =>
      btn
        .setButtonText("Get Projects")
        .setTooltip(
          "Get a list of projects from Azure DevOps, so you can select which ones to sync"
        )
        .setCta()
        .setClass("get-projects-btn")
        .onClick(async () => {
          const projects = await this.client.getProjects();
          new Notice(`Found ${projects.length} projects.`);

          // display the project names in a table
          const table = containerEl.createEl("table");

          const thead = table.createTHead();
          const headerRow = thead.insertRow();
          headerRow.insertCell().innerText = "Name";
          headerRow.insertCell().innerText = "Sync?";

          const tbody = table.createTBody();
          projects.forEach((project) => {
            const row = tbody.insertRow();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            row.insertCell().innerText = project.name!;
            row.insertCell().innerHTML = `<input type="checkbox" />`;
          });
        })
    );
  }
}
