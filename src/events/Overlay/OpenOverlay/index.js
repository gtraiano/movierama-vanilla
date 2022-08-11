export const eventName = 'openoverlay'

export const dispatchOpenOverlay = () => {
    dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchOpenOverlay
}