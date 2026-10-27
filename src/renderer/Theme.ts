
type Theme = {
    fonts?: {
        default?: {
            family?: string;
            size?: string;
            lineHeight?: string;
            style?: string;
            weight?: string;
        };
        subtitles?: {
            family?: string;
            size?: string;
            color?: string;
            bgColor?: string;
            bgTransparency?: string;
            lineHeight?: string;
        };
        faces?: Array<{
            src: string;
            family?: string;
            format?: string;
            weight?: string;
            style?: string;
        }>;
    };
};


function setVar(name: string, value?: string) {
    if (value != null && value !== "")
        document.documentElement.style.setProperty(name, value);
}

function applyThemeVars(theme: Theme) {
    const f = theme.fonts ?? {};
    setVar("--font-family-default", f.default?.family);
    setVar("--font-size-default", f.default?.size);
    setVar("--line-height-default", f.default?.lineHeight);
    setVar("--font-style-default", f.default?.style);
    setVar("--font-weight-default", f.default?.weight);

    setVar("--font-family-subs", f.subtitles?.family);
    setVar("--font-size-subs", f.subtitles?.size);
    setVar("--font-color-subs", f.subtitles?.color);
    setVar("--font-bg-color-subs", f.subtitles?.bgColor);
    setVar("--font-bg-transparency-subs", f.subtitles?.bgTransparency);
    setVar("--font-line-height-subs", f.subtitles?.lineHeight);
}

async function loadFontFaces(backend:IBackend, fonts?: Theme["fonts"]) {
    if (!fonts?.faces || fonts.faces.length === 0) return;

    // Load each face via FontFace API
    const loads = fonts.faces.map(async (face) => {
        try {
            // Resolve the URL relative to the current document (works with file://)
            const url = new URL(await backend.getResourcePath(face.src)).toString();
            const src = face.format ? `url("${url}") format("${face.format}")` : `url("${url}")`;
            const ff = new FontFace(face.family ?? "ThemedFont", src, {
                weight: face.weight ?? "normal",
                style: face.style ?? "normal"
            });
            const loaded = await ff.load();
            document.fonts.add(loaded);
        } catch (e) {
            // Ignore individual font load failures; baseline CSS remains
            console.warn("Failed to load font face:", face.src, e);
        }
    });

    await Promise.all(loads);
}

export async function loadTheme(backend:IBackend) {

    try {
        const json:any|null = await backend.loadTheme();

        if(json === null){
            console.warn("Failed to load theme in folder resources/daten/theme, use default-css-values in main.css");
            return; //use CSS-default values if theme does not exist
        }

        // Apply variables first so text size/line-height update early
        applyThemeVars(json);

        // Then load and register font faces (non-blocking for initial render)
        await loadFontFaces(backend, json.fonts).catch(() => {});
    } catch {
        console.warn("Failed to load theme in folder resources/daten/theme, use default-css-values in main.css");
    }
}