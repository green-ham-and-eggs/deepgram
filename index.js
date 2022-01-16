const fs = require('fs')
const YoutubeMp3Downloader = require('youtube-mp3-downloader')
const { Deepgram } = require('@deepgram/sdk')
const ffmpeg = require('ffmpeg-static')

const deepgram = new Deepgram('4d4341e2f93135d72a3198bca2a78fbcb2338e61')
const YD = new YoutubeMp3Downloader({
  ffmpegPath: ffmpeg,
  outputPath: './',
  youtubeVideoQuality: 'highestaudio',
})

// YouTube video ID
YD.download('0arsPXEaIUY')

YD.on('progress', (data) => {
  console.log(data.progress.percentage + '% downloaded')
})

YD.on('finished', async (err, video) => {
  const videoFileName = video.file
  console.log(`Downloaded ${videoFileName}`)

  const file = {
    buffer: fs.readFileSync(videoFileName),
    mimetype: 'audio/mp3',
  }
  const options = {
    punctuate: true,
  }

  const result = await deepgram.transcription
    .preRecorded(file, options)
    .catch((e) => console.log(e))

  // Getting access to the transcript from all the data that comes back
  const transcript = result.results.channels[0].alternatives[0].transcript

  // Create transcript text file
  fs.writeFileSync(
    `${videoFileName}.txt`,
    transcript,
    () => `Wrote ${videoFileName}.txt`
  )

  // Delete mp3 file
  fs.unlinkSync(videoFileName)
})
