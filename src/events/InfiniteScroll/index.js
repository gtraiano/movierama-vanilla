export const eventName = 'infinitescroll';

export const dispatchInfiniteScroll = () => {
    document.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchInfiniteScroll
}