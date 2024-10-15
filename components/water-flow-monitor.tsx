"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    zoomPlugin
)

const MAX_DATA_POINTS = 100

export function WaterFlowMonitorComponent() {
    const [data, setData] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [thresholdPeriod, setThresholdPeriod] = useState('7')
    const chartRef = useRef(null)

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/water-flow?start=${startDate}&end=${endDate}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }
            const jsonData = await response.json()
            setData(jsonData)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const calculateThreshold = (data) => {
        const period = parseInt(thresholdPeriod)
        const totalFlow = data.slice(-period).reduce((sum, point) => sum + point.flow, 0)
        return totalFlow / period
    }

    const resampleData = (data, maxPoints) => {
        if (data.length <= maxPoints) return data

        const step = Math.ceil(data.length / maxPoints)
        return data.filter((_, index) => index % step === 0).slice(0, maxPoints)
    }

    const sampledData = resampleData(data, MAX_DATA_POINTS)

    const chartData = {
        datasets: [
            {
                label: '用水量',
                data: sampledData.map(point => ({ x: new Date(point.timestamp), y: point.flow })),
                borderColor: 'black',
                tension: 0.1
            },
            {
                label: '平均值',
                data: sampledData.map(point => ({ x: new Date(point.timestamp), y: calculateThreshold(sampledData) })),
                borderColor: 'red',
                borderDash: [5, 5]
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '用水量监测',
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x',
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                },
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            },
            y: {
                beginAtZero: true
            }
        }
    }

    const handleZoom = () => {
        if (chartRef.current) {
            const chart = chartRef.current;
            const newUnit = determineTimeUnit(chart.scales.x.min, chart.scales.x.max)
            chart.options.scales.x.time.unit = newUnit
            chart.update()
        }
    }

    const determineTimeUnit = (start, end) => {
        const diff = end - start
        if (diff < 86400000) return 'hour'
        if (diff < 2592000000) return 'day'
        if (diff < 31536000000) return 'month'
        return 'year'
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-background">
            <Card className="w-[95vw] h-[95vh] max-w-[1200px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle>用水量监测</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                            className="flex-grow"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                            className="flex-grow"
                        />
                        <Select value={thresholdPeriod} onValueChange={setThresholdPeriod}>
                            <SelectTrigger className="flex-grow">
                                <SelectValue placeholder="Threshold Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 天均值</SelectItem>
                                <SelectItem value="14">14 天均值</SelectItem>
                                <SelectItem value="30">30 天均值</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-grow relative">
                        <Line ref={chartRef} data={chartData} options={options} onZoom={handleZoom} />
                    </div>
                    <div className="mt-2 text-right text-sm text-muted-foreground">
                        Developed by <a href="https://www.mitufun.top" className="text-primary hover:underline">MituFun</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}