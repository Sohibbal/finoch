/**
 * Utilitas pemrosesan audio untuk Whisper Speech Recognition (16.000 Hz Mono Float32).
 */

export const TARGET_SAMPLE_RATE = 16000;

/**
 * Melakukan resampling Float32Array audio ke 16.000 Hz menggunakan interpolasi linier.
 */
export function resampleTo16kHz(
  inputData: Float32Array,
  inputSampleRate: number
): Float32Array {
  if (inputData.length === 0) {
    return new Float32Array(0);
  }

  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return new Float32Array(inputData);
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.round(inputData.length / ratio);
  const result = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const originalPos = i * ratio;
    const index = Math.floor(originalPos);
    const fraction = originalPos - index;

    const currentSample = inputData[index];
    const nextSample =
      index + 1 < inputData.length ? inputData[index + 1] : currentSample;

    result[i] = currentSample * (1 - fraction) + nextSample * fraction;
  }

  return result;
}

/**
 * Melakukan normalisasi amplitudo puncak audio untuk menjaga kejernihan tanpa distorsi/clipping.
 */
export function normalizeAudio(
  inputData: Float32Array,
  targetPeak: number = 0.9
): Float32Array {
  if (inputData.length === 0) {
    return new Float32Array(0);
  }

  let maxPeak = 0;
  for (let i = 0; i < inputData.length; i++) {
    const abs = Math.abs(inputData[i]);
    if (abs > maxPeak) {
      maxPeak = abs;
    }
  }

  if (maxPeak === 0) {
    return new Float32Array(inputData);
  }

  const scale = targetPeak / maxPeak;
  const result = new Float32Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    result[i] = inputData[i] * scale;
  }

  return result;
}

/**
 * Mengecek apakah audio hening (di bawah batas RMS threshold).
 */
export function isAudioSilent(
  inputData: Float32Array,
  threshold: number = 0.01
): boolean {
  if (inputData.length === 0) {
    return true;
  }

  let sumSquares = 0;
  for (let i = 0; i < inputData.length; i++) {
    sumSquares += inputData[i] * inputData[i];
  }

  const rms = Math.sqrt(sumSquares / inputData.length);
  return rms < threshold;
}

/**
 * Memeriksa dukungan peramban terhadap perekam suara MediaRecorder dan memilih format audio terbaik.
 */
export function checkAudioSupport(): { supported: boolean; mimeType: string } {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return { supported: false, mimeType: "" };
  }

  const candidateTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return { supported: true, mimeType: type };
    }
  }

  return { supported: true, mimeType: "" };
}

/**
 * Mengonversi Blob audio yang direkam via MediaRecorder menjadi Float32Array 16kHz mono.
 */
export async function convertAudioBlobTo16kHz(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;

  const audioCtx = new AudioContextClass({ sampleRate: TARGET_SAMPLE_RATE });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Mono channel primer

    // Jika AudioContext tidak mendukung pengaturan sampleRate awal ke 16000:
    if (audioBuffer.sampleRate !== TARGET_SAMPLE_RATE) {
      return resampleTo16kHz(channelData, audioBuffer.sampleRate);
    }

    return channelData;
  } finally {
    audioCtx.close().catch(() => {});
  }
}
