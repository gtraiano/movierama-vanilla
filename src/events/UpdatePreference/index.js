export const eventName = 'update';

export const dispatchUpdatePreference = name => {
    document.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: name
        }
    ))
}

export default {
    eventName,
    dispatchUpdatePreference
}