export const eventName = 'requstmoviedetails';

export const dispatchRequestMovieDetails = id => {
    document.dispatchEvent(new CustomEvent(
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