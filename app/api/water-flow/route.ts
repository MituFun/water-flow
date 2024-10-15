import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Read data from TXT file
    const dataPath = path.join(process.cwd(), 'Data.txt')
    const fileContent = fs.readFileSync(dataPath, 'utf8')

    // Parse the data
    const lines = fileContent.split('\n')
    const data = lines.map(line => {
        const [timestamp, flow] = line.split(' ')
        return { timestamp, flow: parseFloat(flow) }
    })

    // Filter data based on date range
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.timestamp)
        return (!start || itemDate >= new Date(start)) && (!end || itemDate <= new Date(end))
    })

    return NextResponse.json(filteredData)
}