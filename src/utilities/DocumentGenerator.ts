import { App, TFile } from "obsidian";
import { IAzDOSyncSettings } from "src/settings/IAzDOSyncSettings";

export class DocumentGenerator {
  constructor(app: App, settings: IAzDOSyncSettings) {}
}

export class VaultHelper {
  public static createFolders(path: string): void {
    if (app.vault.getAbstractFileByPath(path) == null) {
      app.vault.createFolder(path).catch((err) => console.log(err));
    }
  }

  public static createFoldersFromList(paths: string[]): void {
    paths.forEach((path) => this.createFolders(path));
  }

  public static getFileByTaskId(path: string, id: string): TFile | undefined {
    const files = app.vault.getMarkdownFiles();

    const projectPath = path.slice(0, path.lastIndexOf("/")); // Remove the specific sprint since files can be in old sprints

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i].path;
      if (filePath.startsWith(projectPath) && filePath.contains(id)) {
        return files[i];
      }
    }

    return undefined;
  }

  public static formatTaskFilename(type: string, id: string): string {
    return `${type} - ${id}`;
  }

  public static createTaskNotes(
    path: string,
    tasks: Array<Task>,
    template: string
  ): Promise<TFile>[] {
    const promisesToCreateNotes: Promise<TFile>[] = [];

    tasks.forEach((task) => {
      if (this.getFileByTaskId(path, task.id) == undefined) {
        promisesToCreateNotes.push(this.createTaskNote(path, task, template));
      }
    });

    return promisesToCreateNotes;
  }

  private static async createTaskNote(
    path: string,
    task: Task,
    template: string
  ): Promise<TFile> {
    const filename = VaultHelper.formatTaskFilename(task.type, task.id);
    const filepath = path + `/${filename}.md`;

    let content = template
      .replace(/{{TASK_ID}}/g, task.id)
      .replace(/{{TASK_TITLE}}/g, task.title)
      .replace(/{{TASK_STATE}}/g, task.state)
      .replace(/{{TASK_TYPE}}/g, task.type.replace(/ /g, ""))
      .replace(/{{TASK_ASSIGNEDTO}}/g, task.assignedTo)
      .replace(/{{TASK_LINK}}/g, task.link);

    if (task.desc != null) {
      content = content.replace(/{{TASK_DESCRIPTION}}/g, task.desc);
    } else {
      content = content.replace(/{{TASK_DESCRIPTION}}/g, "");
    }

    return app.vault.create(filepath, content);
  }
}
