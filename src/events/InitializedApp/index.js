export const eventName = 'initializedApp'

export const dispatchInitializedApp = () => {
    document.body.dispatchEvent(new Event('initializedApp'))
}

export default {
    eventName,
    dispatchInitializedApp
}