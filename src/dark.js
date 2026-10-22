import { FastAverageColor } from 'fast-average-color';

export function extractImageSetUrl(bg) {
    // background-image stacks layers (our scrim gradient comes first), so the
    // image layer must be located anywhere in the value, not prefix-matched
    const imageSet = bg.match(/image-set\((.*)\)/);

    // Case 1: image-set with dppx or x
    if (imageSet) {
        const matches = [...imageSet[1].matchAll(
            /url\(["']?(.*?)["']?\)\s+([\d.]+)(x|dppx)/g
        )];

        if (matches.length) {
            const dpr = window.devicePixelRatio || 1;

            // Normalize values (x and dppx are equivalent)
            const candidates = matches.map(m => ({
                url: m[1],
                scale: parseFloat(m[2])
            }));

            // Pick closest scale to device DPR
            candidates.sort(
                (a, b) => Math.abs(a.scale - dpr) - Math.abs(b.scale - dpr)
            );

            return candidates[0].url;
        }
    }

    // Case 2: already resolved to a plain url(...) (gradients contain no url)
    const url = bg.match(/url\(["']?(.*?)["']?\)/);
    return url ? url[1] : null;
}


const fac = new FastAverageColor();

export const determineFontColor = async (el) => {
    const bg = getComputedStyle(el).backgroundImage;
    const imageUrl = extractImageSetUrl(bg);

    if (!imageUrl) return null;

    try {
        const { r, g, b } = await fac.getColorAsync(imageUrl);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000' : '#fff';
    } catch (e) {
        console.error('Average color failed:', e);
        return null; // unknown: let the theme decide
    }
};
