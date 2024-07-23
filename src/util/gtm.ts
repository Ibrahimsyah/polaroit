export const pushEvent = async (eventName: EVENT_TAG, payload: object = {}) => {
    if (typeof window?.dataLayer?.push === 'undefined') {
        console.error("GTM is not set up properly")
        return
    }

    window.dataLayer.push({
        event: eventName,
        ...payload,
    });
}

export enum EVENT_TAG {
    UPLOAD_CLICK = "upload_click",
    UPLOAD_SUCCESS = "upload_success",
    DOWNLOAD_RESULT = "download_result",
    EXIF_DETECTED = "exif_detected"
}