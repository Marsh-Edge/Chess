export async function getAIMove(fen: string, skillLevel?: number): Promise<string | null> {
  try {
    const { initAI, sendCommand, setMoveCallback } = await import('./stockfish-worker')
    await initAI(skillLevel)

    return new Promise((resolve) => {
      setMoveCallback((bestMove: string) => {
        resolve(bestMove)
      })
      sendCommand(`position fen ${fen}`)
      sendCommand('go depth 10')
    })
  } catch {
    return null
  }
}
