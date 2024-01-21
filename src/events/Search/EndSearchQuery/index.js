export const eventName = 'endsearchquery';

export const dispatchEndSearchQuery = () => {
    document.body.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchEndSearchQuery
}