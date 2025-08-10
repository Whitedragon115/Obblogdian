import { BaseSetting } from "./base-setting";

export class InfoSettings extends BaseSetting {
    render(containerEl: HTMLElement): void {
        
        containerEl.createEl('hr');

        const versionInfo = containerEl.createEl('div');
        versionInfo.style.marginTop = '20px';
        versionInfo.style.padding = '10px';
        versionInfo.style.backgroundColor = 'var(--background-secondary)';
        versionInfo.style.borderRadius = '5px';
        
        const linkContainer = versionInfo.createEl('small');
        linkContainer.style.textAlign = 'center';
        linkContainer.createEl('span', { text: 'Obblogdian Plugin v1.0.1, ' });
        
        linkContainer.createEl('a', { 
            text: 'GitHub',
            href: 'https://github.com/Whitedragon115/Obblogdian'
        });
    }
}
