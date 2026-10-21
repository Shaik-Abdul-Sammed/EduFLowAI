import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const versionData = {
  version: String(Date.now()),
}

const targetPath = path.resolve(__dirname, '../public/version.json')
fs.writeFileSync(targetPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8')
console.log(`[Version Generator] Generated public/version.json: ${versionData.version}`)
