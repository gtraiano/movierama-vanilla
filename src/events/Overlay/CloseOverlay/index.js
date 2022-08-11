export const eventName = 'closeoverlay'

export const dispatchCloseOverlay = () => {
    dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchCloseOverlay
}