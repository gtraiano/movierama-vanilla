export const eventName = 'infinitescroll';

export const dispatchInfiniteScroll = () => {
    dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchInfiniteScroll
}