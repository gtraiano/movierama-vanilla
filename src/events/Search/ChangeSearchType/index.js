export const eventName = 'searchtypechange';

export const dispatchSearchTypeChange = ({ type }) => {
    document.body.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: { type }
        }
    ))
}

export default {
    eventName,
    dispatchSearchTypeChange
}