export interface MyPluginSettings {
    apiToken: string;
    apiLink: string;
    blogFolder: string;
    autoUpdate: boolean;
    autoSync: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
    apiToken: '',
    apiLink: '',
    blogFolder: '',
    autoUpdate: true,
    autoSync: false
}
