export const eventName = 'infinitescroll';

export const dispatchInfiniteScroll = () => {
    document.body.dispatchEvent(new Event(eventName))
}

export default {
    eventName,
    dispatchInfiniteScroll
}