export const eventName = 'closeoverlay'

export const dispatchCloseOverlay = () => {
    document.body.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchCloseOverlay
}