export const eventName = 'openoverlay'

export const dispatchOpenOverlay = () => {
    document.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchOpenOverlay
}