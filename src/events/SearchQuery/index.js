export const eventName = 'searchquery';

export const dispatchSearchQuery = text => {
    dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: text
        }
    ))
}

export default {
    eventName,
    dispatchSearchQuery
}