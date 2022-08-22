export const generateImageUrls = (baseUrl, baseWidth, sizes, fname, mode = 'x', includeOriginal = true) => {
    /*
        generate url for use in srcset or image-set
        @baseUrl                url base
        @baseSize               target size for image (in pixels)
        @sizes                  available image sizes array (in the pattern of w\d+)
        @fname                  image file name
        @mode                   width or ratio mode
                                'x' => append ratio to baseSize suffix ('x', e.g. 1.5x)
                                'w' => append image width suffix ('w', e.g. 720w)
        @includeOriginal        whether to include original size in list
    */
    fname = fname?.trim()
    if(!fname || !fname.length) return []
    
    mode = mode?.toLowerCase()
    if(!['x', 'w'].includes(mode)) return []
    
    return sizes.flatMap(
        (sz, i, szs) => /^w\d+$/.test(sz)
            ? `${baseUrl}${sz}${fname} ${mode === 'x'? (Number.parseInt(sz.substring(1)) / baseWidth).toFixed(2) : sz.substring(1)}${mode}`
            : includeOriginal
                ? `${baseUrl}${sz}${fname} ${mode === 'x' ? (3 * Number.parseInt(szs[i-1].substring(1)) / baseWidth).toFixed(2) : (3 * Number.parseInt(szs[i-1].substring(1)).toFixed(2))}${mode}` // 3*720
                : []
    )
}