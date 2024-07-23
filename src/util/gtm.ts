import { ReactTagManager } from "react-gtm-ts"

export const pushEvent = async (eventName: EVENT_TAG, payload: object = {}) => {
    ReactTagManager.action({
        event: eventName,
        ...payload
    })
}

export enum EVENT_TAG {
    UPLOAD_CLICK = "upload_click",
    UPLOAD_SUCCESS = "upload_success",
    DOWNLOAD_RESULT = "download_result",
    EXIF_DETECTED = "exif_detected"
}