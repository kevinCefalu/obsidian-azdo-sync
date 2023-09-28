import { Notice, Plugin, TFile } from "obsidian";
import { IAzDOSyncSettings } from "./settings/IAzDOSyncSettings";
import { AzDOSyncSettingsTab } from "./settings/AzDOSyncSettingsTab";
import { EnterWorkItemIdModal } from "./modals/EnterWorkItemIdModal";

const DEFAULT_SETTINGS: Partial<IAzDOSyncSettings> = {
  organizationUrl: "",
  pat: "",
};

export default class AzDOSyncPlugin extends Plugin {
  settings!: IAzDOSyncSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "sync-work-item-single",
      name: "Sync a work item",
      callback: async () => {
        new EnterWorkItemIdModal(this.app, this.settings, (workItem) => {
          new Notice(`Entered work item id: ${workItem?.id}`);
          console.log("Work Item:", workItem);

          const filename = `${workItem?.fields?.["System.WorkItemType"]} - ${workItem?.id}`;
          const filePath = "work/azure-devops/" + filename + ".md";

          // const frontMatterView = {
          // };

          // const output = Mustache.render("{{title}} spends {{calc}}", frontMatterView);

          // read in the template file
          // const template = this.app.vault.getAbstractFileByPath(

          let frontMatter = `---
tags:
- azdoSync/workItems/{{System.WorkItemType}}
- azdoSync/workItems/{{System.State}}
---`;

          for (const key in workItem?.fields) {
            const value = workItem?.fields[key];
            frontMatter = frontMatter.replace(
              `{{${key}}}`,
              value.toString().replace(/ /g, "")
            );
          }

          let content = `
# {{System.Title}}

> Assigned: {{CustomTokens.AssignedTo}}
> Link: {{CustomTokens.WebUrl}}

## Description

{{System.Description}}

## Notes:
<!-- - Create notes list -->

          `;

          for (const key in workItem?.fields) {
            const value = workItem?.fields[key];
            content = content.replace(`{{${key}}}`, value);
          }

          const assignedToUser = workItem?.fields?.["System.AssignedTo"];
          const webUrl = `${this.settings.organizationUrl}/${workItem?.fields?.["System.TeamProject"]}/_workitems/edit/${workItem?.id}`;
          content = content
            .replace(`{{CustomTokens.WebUrl}}`, `[${webUrl}](${webUrl})`)
            .replace(
              `{{CustomTokens.AssignedTo}}`,
              `[${assignedToUser.displayName}](mailto:${assignedToUser.uniqueName})`
            );

          content = frontMatter + content;

          // if the note already exists, update it
          const existingFile = this.app.vault.getAbstractFileByPath(
            filePath
          ) as TFile;
          if (existingFile !== null) {
            this.app.vault.modify(existingFile, content);
          } else {
            this.app.vault.create(filePath, content);
          }
        }).open();
      },
    });

    this.addSettingTab(new AzDOSyncSettingsTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
