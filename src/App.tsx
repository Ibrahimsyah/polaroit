import React, { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { CanvasDimension, FrameConfiguration, ImageExif } from './App.types'

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

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>()
  const [frameConfiguration] = useState<FrameConfiguration>(defaultFrameConfiguration)
  const [exif, setExif] = useState<ImageExif>(defaultExif)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasDimensions = useMemo<CanvasDimension | null>(() => {
    if (!image) return null

    return {
      width: Math.max(FRAME_MIN_WIDTH, image.width),
      height: image.height,
    }
  }, [image]) 

  const handleDownloadImage = () => {
    if (!canvasRef.current) return
    const dataURL = canvasRef.current.toDataURL("image/png")
    const link = document.createElement('a');
    link.download = "result";
    link.href = dataURL;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLFormElement>): void => {
    if (!event.target) return
    setExif(prev => ({
      ...prev as ImageExif,
      [event.target.name]: event.target.value
    }))
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
    }
    reader.readAsDataURL(event.target.files[0])
  }

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
    <div id='main'>
      <h1>Polaro It!</h1>
      {image ? (
        <>
          <canvas ref={canvasRef} onClick={() => setImage(null)} />
          <div className='exif-form'>
            <form onChange={handleFormChange}>
              <input name="deviceName" type='text' placeholder='Device Name'/>
              <input name="focalLength" type='number'  placeholder='Focal Length'/>
              <input name="aperture" type='number' step=".1" placeholder='Aperture'/>
              <input name="shutterSpeed" type='text' placeholder='Shutter Speed'/>
              <input name="iso" type='number' placeholder='ISO'/>
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
              onChange={handleUploadImage} />
            <span className="upload-icon">&#x1F4F7;</span>
            Upload a photo
          </label>
        </div>
      )}
    </div>
  )
}

export default App
