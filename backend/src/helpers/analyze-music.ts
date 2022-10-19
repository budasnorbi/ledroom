import * as MusicTempo from "music-tempo"

const analyzeMusic = (
  context: any,
  songBuffer: Buffer
): Promise<{ bpm: number; beatOffset: number; beatAroundEnd: number }> => {
  return new Promise((res, rej) => {
    context.decodeAudioData(songBuffer, (decodedBuffer) => {
      try {
        let audioData: any = []
        // Take the average of the two channels
        if (decodedBuffer.numberOfChannels == 2) {
          const channel1Data = decodedBuffer.getChannelData(0)
          const channel2Data = decodedBuffer.getChannelData(1)
          const length = channel1Data.length
          for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2
          }
        } else {
          audioData = decodedBuffer.getChannelData(0)
        }
        const musicTempo = new MusicTempo(audioData)
        res({
          bpm: Math.round(musicTempo.tempo),
          beatOffset: musicTempo.beats[0],
          beatAroundEnd: musicTempo.beats[musicTempo.beats.length - 1]
        })
      } catch (error) {
        res({
          bpm: 0,
          beatOffset: 0,
          beatAroundEnd: 0
        })
      }
    })
  })
}

export default analyzeMusic
