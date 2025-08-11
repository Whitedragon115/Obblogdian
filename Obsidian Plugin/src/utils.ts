export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timer: NodeJS.Timeout | null = null;
    return function (this: any, ...args: Parameters<T>) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
        }, delay);
    } as T;
}

export function setHidden(): void {
    const hiddenbox = document.querySelectorAll<HTMLElement>(".hidden-box");
    if (!hiddenbox) return;
    hiddenbox.forEach((element) => {
        element.addEventListener("click", () => {
            element.classList.toggle("hiddenblock");
        });
    });

}

export function setTabs(): void {
    const tabs = document.querySelectorAll<HTMLElement>(".tabs .nav-tabs");
    if (!tabs) return;

    tabs.forEach((tab) => {
        const links = tab.querySelectorAll<HTMLAnchorElement>("a");
        links.forEach((link) => {
            link.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                const target = e.target as HTMLElement;
                const parentTab = target.parentElement?.parentElement?.parentElement;
                if (!parentTab) return;

                const activeNav = parentTab.querySelector<HTMLElement>(".nav-tabs .active");
                activeNav?.classList.remove("active");
                target.parentElement?.classList.add("active");

                const activeContent = parentTab.querySelector<HTMLElement>(".tab-content .active");
                activeContent?.classList.remove("active");

                const classList = Array.from(target.classList).filter(
                    (cls) => cls.trim().length > 0
                );
                if (classList.length === 0) return;
                const selector = classList.join(".");

                const newActiveContent = parentTab.querySelector<HTMLElement>(selector);
                newActiveContent?.classList.add("active");

                return false;
            });
        });
    });
}

export function genrandomId(length: number = 8): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}