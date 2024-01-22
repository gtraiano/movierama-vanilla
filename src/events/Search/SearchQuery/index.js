export const eventName = 'searchquery';

export const dispatchSearchQuery = ({ query, type }) => {
    document.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: { query, type }
        }
    ))
}

export default {
    eventName,
    dispatchSearchQuery
}