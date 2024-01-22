export const eventName = 'modeupdate';

export const dispatchModeUpdate = mode => {
    document.dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: mode
        }
    ))
}

export default {
    eventName,
    dispatchModeUpdate
}