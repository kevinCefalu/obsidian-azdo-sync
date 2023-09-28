import * as azdo from "azure-devops-node-api";
import * as azdolim from "azure-devops-node-api/interfaces/LocationsInterfaces";
import * as azdowi from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { Notice } from "obsidian";

export class AzDOClient {
  private _organizationUrl: string;
  private _pat: string;

  private _connection!: azdo.WebApi;
  private _connectionData!: azdolim.ConnectionData;

  constructor(organizationUrl: string, pat: string) {
    this._organizationUrl = organizationUrl;
    this._pat = pat;
  }

  public async connect(silent = true) {
    try {
      const authHandler = azdo.getPersonalAccessTokenHandler(this._pat);
      this._connection = new azdo.WebApi(this._organizationUrl, authHandler);

      this._connection.connect().then((connectionData) => {
        this._connectionData = connectionData;
        console.log("Azure DevOps Connection Data:", this._connectionData);

        if (silent) {
          return;
        }

        const userDisplayName =
          this._connectionData.authenticatedUser?.providerDisplayName;
        new Notice(`Welcome, ${userDisplayName}!`);
      });
    } catch (err) {
      console.error(err);
    }
  }

  public async getProjects() {
    const coreApi = await this._connection.getCoreApi();
    const projects = await coreApi.getProjects();
    console.log("Projects:", projects);
    return projects;
  }

  public async getWorkItemById(id: number, asOf: Date = new Date()) {
    const workItemTrackingApi = await this._connection.getWorkItemTrackingApi();
    const workItem = workItemTrackingApi.getWorkItem(
      id,
      undefined,
      asOf,
      azdowi.WorkItemExpand.All
    );
    console.log("Work Item:", workItem);

    return workItem;
  }
}
