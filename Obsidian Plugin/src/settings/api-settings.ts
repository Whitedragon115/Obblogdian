import { Setting, Notice, requestUrl } from "obsidian";
import { BaseSetting } from "./base-setting";
import internal from "stream";

export class ApiSettings extends BaseSetting {
    render(containerEl: HTMLElement): void {
        
        new Setting(containerEl)
            .setName('API Token')
            .setDesc('Enter your API token for blog synchronization')
            .addText(text => text
                .setPlaceholder('Enter your API token')
                .setValue(this.tempSettings.apiToken)
                .onChange(async (value) => {
                    this.tempSettings.apiToken = value;
                    this.markUnsavedChanges();
                }))
            .then(setting => {
                setting.controlEl.querySelector('input')?.setAttribute('type', 'password');
            });

        new Setting(containerEl)
            .setName('API Link')
            .setDesc('Enter your API base URL')
            .addText(text => text
                .setPlaceholder('https://your-api-url.com')
                .setValue(this.tempSettings.apiLink)
                .onChange(async (value) => {
                    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                        value = `http://${value}`;
                    }
                    if (value.endsWith('/')) {
                        value = value.slice(0, -1);
                    }
                    const urlregex = /^(http:\/\/|https:\/\/)/;
                    if (value && !urlregex.test(value)) {
                        new Notice('Invalid URL format. Please enter a valid URL.', 5000);
                        return;
                    }
                    this.tempSettings.apiLink = value;
                    this.markUnsavedChanges();
                }));

        new Setting(containerEl)
            .setName('Test API Connection')
            .setDesc('Test your API connection (settings must be saved first)')
            .addButton(button => button
                .setButtonText('Test Connection')
                .onClick(async () => {
                    await this.pingtest();
                }));
    }

    private async pingtest(): Promise<Notice | void> {

        if (this.hasUnsavedChanges) return new Notice('Please save your settings before testing the API connection.', 5000);
        if (!this.plugin.settings.apiLink || !this.plugin.settings.apiToken) return new Notice('Please configure API Link and API Token before testing connection.', 5000);


        try {
            const response = await requestUrl({
                url: `${this.plugin.settings.apiLink}/api/ping`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.plugin.settings.apiToken}`
                },
                body: JSON.stringify({
                    message: "Ping"
                })
            });

            console.log('API ping response:', response.json);
            if (response.json && response.json.status === "success") {
                new Notice('API connection successful!', 3000);
            } else {
                new Notice('API connection failed: Invalid response', 5000);
            }
        } catch (error) {
            console.error('API connection test failed:', error);
            return new Notice('API connection failed: Network error or invalid URL', 5000);
        }
    }
}
