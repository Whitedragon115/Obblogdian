import { Notice } from "obsidian";
import * as request from "request";
import { MyPluginSettings } from "./settings";

export interface ApiResponse {
    status: string;
    link?: string;
    serverLink?: string;
    message?: string;
}

export class ApiClient {
    constructor(private readonly settings: MyPluginSettings) {}

    async sync(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            new Notice("Syncing, Please wait...");

            const option = {
                url: `${this.settings.apiLink}/sync`,
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`
                }
            };

            request.post(option, (err, res, body) => {
                if (err) {
                    new Notice("Sync failed, Please try again later");
                    console.log(err);
                    return reject(err);
                }

                let parsedBody: ApiResponse;
                if (typeof body === "string") {
                    try {
                        parsedBody = JSON.parse(body);
                    } catch (parseErr) {
                        return reject(new Error("Invalid response format"));
                    }
                } else {
                    parsedBody = body;
                }

                if (parsedBody.status === "success") {
                    new Notice("Sync success, All files updated");
                    resolve();
                } else {
                    reject(new Error("Sync unsuccessful"));
                }
            });
        });
    }

    async startServer(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            new Notice("Starting, Please wait...");

            const option = {
                url: `${this.settings.apiLink}/server/start`,
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`
                }
            };

            request.post(option, (err, res, body) => {
                if (err) {
                    new Notice("Server start failed, Please try again later");
                    console.log(err);
                    return reject(err);
                }

                let parsedBody: ApiResponse;
                if (typeof body === "string") {
                    try {
                        parsedBody = JSON.parse(body);
                    } catch (parseErr) {
                        return reject(new Error("Invalid response format"));
                    }
                } else {
                    parsedBody = body;
                }

                if (parsedBody.status === "success" && parsedBody.link) {
                    const noticeMsg = `Server started, View here: ${parsedBody.link}\nLink copied to clipboard`;
                    new Notice(noticeMsg, 3000);
                    resolve(parsedBody.link);
                } else {
                    reject(new Error("Server start failed"));
                }
            });
        });
    }

    async stopServer(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const option = {
                url: `${this.settings.apiLink}/server/close`,
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`
                }
            };

            request.post(option, (err, res, body) => {
                if (err) {
                    new Notice("Server close failed, Please try again later");
                    console.log(err);
                    return reject(err);
                }

                let parsedBody: ApiResponse;
                if (typeof body === "string") {
                    try {
                        parsedBody = JSON.parse(body);
                    } catch (parseErr) {
                        return reject(new Error("Invalid response format"));
                    }
                } else {
                    parsedBody = body;
                }

                if (parsedBody.status === "success") {
                    new Notice("Server closed successfully");
                    resolve();
                } else {
                    reject(new Error("Server close failed"));
                }
            });
        });
    }

    async deploy(keepServer: boolean = false): Promise<string | void> {
        return new Promise<string | void>((resolve, reject) => {
            new Notice("Deploying, Please wait...");

            const option = {
                url: `${this.settings.apiLink}/deploy`,
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`
                },
                json: { keepServer }
            };

            request.post(option, (err, res, body) => {
                if (err) {
                    new Notice("Deploy failed, Please try again later");
                    console.log(err);
                    return reject(err);
                }

                let parsedBody: ApiResponse;
                if (typeof body === "string") {
                    try {
                        parsedBody = JSON.parse(body);
                    } catch (parseErr) {
                        return reject(new Error("Invalid response format"));
                    }
                } else {
                    parsedBody = body;
                }

                if (parsedBody.status === "success") {
                    if (keepServer && parsedBody.serverLink) {
                        const noticeMsg = `Deploy completed, View here: ${parsedBody.serverLink}\nLink copied to clipboard`;
                        new Notice(noticeMsg, 3000);
                        resolve(parsedBody.serverLink);
                    } else {
                        new Notice("Deploy completed");
                        resolve();
                    }
                } else {
                    reject(new Error("Deploy failed"));
                }
            });
        });
    }

    async quickSync(): Promise<void> {
        const option = {
            url: `${this.settings.apiLink}/sync`,
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`
            }
        };

        request.post(option, (err, res, body) => {
            if (err) {
                new Notice("Sync failed, Please try again later");
                console.log(err);
            }
        });
    }
}
