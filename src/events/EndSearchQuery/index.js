export const eventName = 'endsearchquery';

export const dispatchEndSearchQuery = () => {
    dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchEndSearchQuery
}