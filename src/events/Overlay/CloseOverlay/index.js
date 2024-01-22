export const eventName = 'closeoverlay'

export const dispatchCloseOverlay = () => {
    document.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchCloseOverlay
}