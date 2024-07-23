import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasDimension, FrameConfiguration, ImageExif } from './App.types'
import { EVENT_TAG, pushEvent } from './util/gtm'
import ExifReader from 'exifreader'
import './App.css'

const defaultFrameConfiguration: FrameConfiguration = {
  padding: 16,
  title: "",
  titleSize: 24,
  description: "description",
  descriptionSize: 16,
}

const defaultExif: ImageExif = {
  aperture: 0,
  deviceName: "",
  focalLength: 0,
  iso: 0,
  shutterSpeed: ""
}

const FRAME_MIN_WIDTH = 800

const getImageExif = async (image: HTMLImageElement): Promise<ImageExif> => {
  const tags = await ExifReader.load(image.src)
  const focalLength = tags.FocalLength?.description
  return Promise.resolve({
    aperture: Number(tags.ApertureValue?.description) || 0,
    deviceName: tags.Model?.description || "",
    focalLength: Number(focalLength?.split("")[0]) || 0,
    iso: Number(tags.ISOSpeedRatings?.value) || 0,
    shutterSpeed: tags.ShutterSpeedValue?.description || "",
  })
}

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>()
  const [frameConfiguration] = useState<FrameConfiguration>(defaultFrameConfiguration)
  const [exif, setExif] = useState<ImageExif>(defaultExif)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exifFormRef = useRef<HTMLFormElement>(null)

  const canvasDimensions = useMemo<CanvasDimension | null>(() => {
    if (!image) return null

    return {
      width: Math.max(FRAME_MIN_WIDTH, image.width),
      height: image.height,
    }
  }, [image])

  const handleDownloadImage = () => {
    if (!canvasRef.current) return

    pushEvent(EVENT_TAG.DOWNLOAD_RESULT)
    const dataURL = canvasRef.current.toDataURL("image/png")
    const link = document.createElement('a');
    link.download = "result";
    link.href = dataURL;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }

  const handleFormSubmit = (form: React.FormEvent<HTMLFormElement>) => {
    form.preventDefault()

    const formData = new FormData(form.target as HTMLFormElement)
    const inputs = Object.fromEntries(formData)
    const newExif = Object.keys(exif).reduce((prev, curr) => ({ ...prev, [curr]: inputs[curr] }), {})
    setExif(newExif as ImageExif)
  }

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!event || !event.target || !event.target.files) {
      return
    }

    const reader = new FileReader()
    reader.onload = async e => {
      if (!e.target?.result) return
      const image = new Image()
      image.onload = () => {
        setImage(image)
      }
      image.src = e.target.result as string
      pushEvent(EVENT_TAG.UPLOAD_SUCCESS)
    }
    reader.readAsDataURL(event.target.files[0])
  }

  useEffect(() => {
    if (!image) return

    getImageExif(image).then(res => {
      setExif(res)
      for (const attr of Object.entries(res)) {
        const input = exifFormRef.current?.elements.namedItem(attr[0]) as HTMLInputElement
        input.value = attr[1] as string
      }
    })
  }, [image])

  useEffect(() => {
    if (!image || !canvasDimensions || !exif) return
    if (!canvasRef || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { padding, titleSize } = frameConfiguration
    const normalizedPadding = padding * canvasDimensions.width * 0.0016
    const normalizedTitleSize = titleSize * canvasDimensions.width * 0.0014;
    const normalizedFooterSize = titleSize * canvasDimensions.width * 0.0012;

    const prefixFontConfig = `400 ${normalizedTitleSize}px Roboto`
    const titleFontConfig = `bold ${normalizedTitleSize}px Roboto`

    ctx.font = prefixFontConfig
    const prefixDimens = ctx.measureText("Shot on ")

    ctx.font = titleFontConfig
    const titleDimens = ctx.measureText(exif.deviceName)

    const additionalHeight = 2 * normalizedPadding // up and bottom padding
      + 2 * normalizedPadding // before and after text padding
      + normalizedPadding // padding between text
      + normalizedTitleSize
      + normalizedFooterSize

    const imageScale = canvasDimensions.width / image.width
    const imageWidth = image.width * imageScale
    const imageHeight = image.height * imageScale

    canvas.width = 2 * normalizedPadding + canvasDimensions.width
    canvas.height = imageHeight + additionalHeight

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, normalizedPadding, normalizedPadding, imageWidth, imageHeight)

    const textX = (canvasDimensions.width - (prefixDimens.width + titleDimens.width)) / 2
    const textY = imageHeight + 2 * normalizedPadding + normalizedTitleSize

    ctx.fillStyle = "#666"
    ctx.font = prefixFontConfig
    ctx.fillText("Shot on", textX, textY)

    ctx.fillStyle = "black"
    ctx.font = titleFontConfig
    ctx.fillText(exif.deviceName, textX + prefixDimens.width, textY)

    ctx.fillStyle = "#666"
    ctx.font = `400 ${normalizedFooterSize}px Roboto`
    const footerText = `${exif.focalLength}mm f/${exif.aperture} ${exif.shutterSpeed}s ISO${exif.iso}`
    const footerWidth = ctx.measureText(footerText).width
    ctx.fillText(footerText, (canvasDimensions.width - footerWidth) / 2, imageHeight + 2 * normalizedPadding + normalizedPadding + normalizedTitleSize + normalizedPadding)
  }, [image, canvasDimensions, frameConfiguration, exif])

  return (
    <>
      <main>
        <h1>Polaro It!</h1>
        {image ? (
          <>
            <canvas ref={canvasRef} onClick={() => setImage(null)} />
            <div className='exif-form'>
              <form ref={exifFormRef} onSubmit={handleFormSubmit}>
                <input name="deviceName" type='text' placeholder='Device Name' />
                <input name="focalLength" type='number' placeholder='Focal Length' />
                <input name="aperture" type='number' step=".1" placeholder='Aperture' />
                <input name="shutterSpeed" type='text' placeholder='Shutter Speed' />
                <input name="iso" type='number' placeholder='ISO' />
                <button type='submit'>Apply</button>
              </form>
            </div>
            <button className='btn-download' onClick={handleDownloadImage}>Download</button>
          </>
        ) : (
          <div className='uploader'>
            <label htmlFor="file-upload" className="upload-btn">
              <input
                id="file-upload"
                type="file"
                style={{ display: 'none' }}
                accept='image/*'
                onClick={() => pushEvent(EVENT_TAG.UPLOAD_CLICK)}
                onChange={handleUploadImage} />
              <span className="upload-icon">&#x1F4F7;</span>
              Upload a photo
            </label>
          </div>
        )}
      </main>
      <footer>
        <p>Made with ❤️ Wanna buy me a coffee?</p>
        <p>
          <a href="https://saweria.co/ibrahimsyah">Saweria</a>
        </p>
      </footer>
    </>
  )
}

export default App
