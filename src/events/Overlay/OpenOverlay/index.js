export const eventName = 'openoverlay'

export const dispatchOpenOverlay = () => {
    document.body.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchOpenOverlay
}