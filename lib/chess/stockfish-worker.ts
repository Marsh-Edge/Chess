let worker: Worker | null = null
let moveCallback: ((bestMove: string) => void) | null = null
let evalCallback: ((data: { depth: number; score: number; isMate: boolean }) => void) | null = null
let resolveReady: (() => void) | null = null
let rejectReady: ((err: Error) => void) | null = null

const INIT_TIMEOUT = 30000
let initTimer: ReturnType<typeof setTimeout> | null = null
let lastSkillLevel = -1

function handleMessage(data: string) {
  if (data === 'uciok') {
    worker?.postMessage('isready')
  } else if (data === 'readyok') {
    resolveReady?.()
    resolveReady = null
    rejectReady = null
  } else if (data.startsWith('bestmove')) {
    moveCallback?.(data.split(' ')[1])
  } else if (data.startsWith('info')) {
    const depthMatch = data.match(/depth (\d+)/)
    const cpMatch = data.match(/score cp (-?\d+)/)
    const mateMatch = data.match(/score mate (-?\d+)/)
    if (depthMatch && (cpMatch || mateMatch)) {
      const depth = parseInt(depthMatch[1])
      if (cpMatch) {
        evalCallback?.({ depth, score: parseInt(cpMatch[1]), isMate: false })
      } else if (mateMatch) {
        evalCallback?.({ depth, score: parseInt(mateMatch[1]), isMate: true })
      }
    }
  }
}

export function initAI(skillLevel?: number): Promise<void> {
  if (worker) {
    if (skillLevel !== undefined && skillLevel !== lastSkillLevel) {
      worker.postMessage(`setoption name Skill Level value ${skillLevel}`)
      lastSkillLevel = skillLevel
    }
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    try {
      worker = new Worker('/stockfish/stockfish.js')
    } catch (err) {
      reject(new Error(`Failed to create worker: ${err}`))
      return
    }

    worker.onerror = (err) => {
      console.error('[Stockfish] Worker error:', err.message)
      reject(new Error(`Worker error: ${err.message}`))
    }

    worker.onmessage = (e) => {
      handleMessage(e.data)
    }

    resolveReady = () => {
      if (initTimer) clearTimeout(initTimer)
      if (skillLevel !== undefined) {
        worker?.postMessage(`setoption name Skill Level value ${skillLevel}`)
        lastSkillLevel = skillLevel
      }
      resolve()
    }
    rejectReady = (err) => {
      if (initTimer) clearTimeout(initTimer)
      worker?.terminate()
      worker = null
      reject(err)
    }

    initTimer = setTimeout(() => {
      rejectReady?.(new Error('Stockfish init timed out'))
    }, INIT_TIMEOUT)

    worker.postMessage('uci')
  })
}

export function sendCommand(cmd: string) {
  worker?.postMessage(cmd)
}

export function setMoveCallback(cb: (bestMove: string) => void) {
  moveCallback = cb
}

export function setEvalCallback(cb: (data: { depth: number; score: number; isMate: boolean }) => void) {
  evalCallback = cb
}

export function terminate() {
  if (initTimer) clearTimeout(initTimer)
  worker?.terminate()
  worker = null
  moveCallback = null
  evalCallback = null
  resolveReady = null
  rejectReady = null
  lastSkillLevel = -1
}
