export const eventName = 'filtertag';

export const dispatchFilterTag = tag => {
    document.body.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: {
                name: tag.name,
                label: tag.label,
                value: tag.value
            }
        }
    ))
}

export default {
    eventName,
    dispatchFilterTag
}