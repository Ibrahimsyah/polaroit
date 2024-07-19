import React, { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import exif from 'exifreader'
import { CanvasDimension, FrameConfiguration } from './App.types'

const defaultFrameConfiguration: FrameConfiguration = {
  padding: 16,
  title: "",
  titleSize: 24,
  description: "description",
  descriptionSize: 16,
}

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>()
  const [frameConfiguration] = useState<FrameConfiguration>(defaultFrameConfiguration)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasDimensions = useMemo<CanvasDimension | null>(() => {
    if (!image) return null
    return {
      width: image.width + 2 * 16,
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

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!event || !event.target || !event.target.files) {
      return
    }

    const reader = new FileReader()
    reader.onload = async e => {
      if (!e.target?.result) return
      const image = new Image()
      const tags = await exif.load(e.target.result)
      console.log(tags)
      image.onload = () => {
        setImage(image)
      }
      image.src = e.target.result as string
    }
    reader.readAsDataURL(event.target.files[0])
  }

  useEffect(() => {
    if (!image || !canvasDimensions) return
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
    const titleDimens = ctx.measureText("Samsung Galaxy A54")

    const additionalHeight = 2 * normalizedPadding // up and bottom padding
      + 2 * normalizedPadding // before and after text padding
      + normalizedPadding // padding between text
      + normalizedTitleSize
      + normalizedFooterSize

    canvas.width = 2 * normalizedPadding + image.width
    canvas.height = image.height + additionalHeight

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, normalizedPadding, normalizedPadding, image.width, image.height)

    const textX = (canvasDimensions.width - (prefixDimens.width + titleDimens.width)) / 2
    const textY = image.height + 2 * normalizedPadding + normalizedTitleSize

    ctx.fillStyle = "#666"
    ctx.font = prefixFontConfig
    ctx.fillText("Shot on", textX, textY)

    ctx.fillStyle = "black"
    ctx.font = titleFontConfig
    ctx.fillText("Samsung Galaxy A54", textX + prefixDimens.width, textY)

    ctx.fillStyle = "#666"
    ctx.font = `400 ${normalizedFooterSize}px Roboto`
    const footerWidth = ctx.measureText("38mm f/2.2 1/400s ISO200").width
    ctx.fillText("38mm f/2.2 1/400s ISO200", (canvasDimensions.width - footerWidth) / 2, image.height + 2 * normalizedPadding + normalizedPadding + normalizedTitleSize + normalizedPadding)
  }, [image, canvasDimensions, frameConfiguration])

  return (
    <div id='main'>
      <h1>Polaroit!</h1>
      {image ? (
        <>
          <canvas ref={canvasRef} onClick={() => setImage(null)} />
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
            Upload Photo
          </label>
        </div>
      )}
    </div>
  )
}

export default App
