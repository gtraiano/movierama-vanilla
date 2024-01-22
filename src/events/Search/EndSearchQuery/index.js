export const eventName = 'endsearchquery';

export const dispatchEndSearchQuery = () => {
    document.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchEndSearchQuery
}