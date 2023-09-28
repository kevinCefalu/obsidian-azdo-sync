import { App, SuggestModal } from "obsidian";
import { IAzDOSyncSettings } from "../IAzDOSyncSettings";
import { AzDOClient } from "src/client/AzDOClient";

interface IProject {
  id?: string;
  name?: string;
}

export class SelectProjectModal extends SuggestModal<IProject> {
  settings: IAzDOSyncSettings;
  client!: AzDOClient;
  ALL_PROJECTS: IProject[] = [];
  onSubmit: (item: IProject) => void;

  constructor(
    app: App,
    settings: IAzDOSyncSettings,
    onSubmit: (item: IProject) => void
  ) {
    super(app);
    this.settings = settings;
    this.onSubmit = onSubmit;
  }

  async setup(): Promise<void> {
    this.client = new AzDOClient(
      this.settings.organizationUrl,
      this.settings.pat
    );

    await this.client.connect();
    this.ALL_PROJECTS = await this.client.getProjects();
  }

  async getSuggestions(query: string): Promise<IProject[]> {
    return this.ALL_PROJECTS.filter((project) =>
      project.name?.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(item: IProject, elem: HTMLElement) {
    elem.createEl("div", { text: item.name?.toString() });
    elem.createEl("small", { text: item.id?.toString() });
  }

  onChooseSuggestion(item: IProject, evt: MouseEvent | KeyboardEvent) {
    console.log("Selected project:", item, evt);
    this.onSubmit(item);
  }
}
