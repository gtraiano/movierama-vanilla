export const eventName = 'initializedApp'

export const dispatchInitializedApp = () => {
    document.dispatchEvent(new Event('initializedApp'))
}

export default {
    eventName,
    dispatchInitializedApp
}