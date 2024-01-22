export const eventName = 'searchtypechange';

export const dispatchSearchTypeChange = (type) => {
    document.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: type
        }
    ))
}

export default {
    eventName,
    dispatchSearchTypeChange
}