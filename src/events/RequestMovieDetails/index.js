export const eventName = 'requstmoviedetails';

export const dispatchRequestMovieDetails = id => {
    dispatchEvent(new CustomEvent(
        eventName,
        {
            bubbles: true,
            detail: id
        }
    ))
}

export default {
    eventName,
    dispatchRequestMovieDetails
}