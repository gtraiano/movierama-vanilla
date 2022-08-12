export const eventName = 'initializedApp'

export const dispatchInitializedApp = () => {
    dispatchEvent(new Event('initializedApp'))
}

export default {
    eventName,
    dispatchInitializedApp
}