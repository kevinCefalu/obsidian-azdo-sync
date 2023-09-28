import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { App, Modal, Setting } from "obsidian";
import { AzDOClient } from "src/client/AzDOClient";
import { IAzDOSyncSettings } from "src/settings/IAzDOSyncSettings";

export class EnterWorkItemIdModal extends Modal {
  settings: IAzDOSyncSettings;
  client!: AzDOClient;
  result: string | undefined;
  onSubmit: (result: WorkItem | undefined) => void;

  constructor(
    app: App,
    settings: IAzDOSyncSettings,
    onSubmit: (result: WorkItem | undefined) => void
  ) {
    super(app);
    this.settings = settings;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h3", {
      text: "What is the ID of the work item you would like to sync?",
    });

    new Setting(contentEl)
      .setName("Work Item ID")
      .setDesc("Enter the ID of the work item you would like to sync.")
      .addText((text) =>
        text
          .setPlaceholder(
            "Enter the ID of the work item you would like to sync."
          )
          .onChange((value) => {
            this.result = value;
          })
      );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Submit")
        .setCta()
        .onClick(async () => {
          this.close();

          this.client = new AzDOClient(
            this.settings.organizationUrl,
            this.settings.pat
          );

          await this.client.connect();

          const workItem = await this.client.getWorkItemById(
            Number(this.result)
          );

          this.onSubmit(workItem);
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
