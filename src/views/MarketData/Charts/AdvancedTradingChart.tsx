import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import Widget from "@/components/Widget/Widget"
import Papa from "papaparse"
import moment from "moment"

interface TradingViewChartProps {
    data: CandlestickData<Time>[];
}

function TradingViewChart({ data }: TradingViewChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: '#ffffff' },
                textColor: '#333',
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
        });

        chartInstanceRef.current = chart;

        const candlestickSeries = chart.addSeries(CandlestickSeries);
        candlestickSeries.setData(data);

        // Handle window resize
        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    const chart = <div ref={chartContainerRef} style={{ width: '100%' }} />;

    const settings = [
            {
                label: "Export",
                icon: "pi pi-file-export",
                command: () => {
                    if (!data) {
                        return
                    }
                    console.log("exporting data", data)
                    const formattedData = data.map((d) => [
                        moment(d.time).format("YYYY-MM-DD"),
                        d.open,
                        d.high,
                        d.low,
                        d.close
                    ])
                    formattedData.unshift(["Date", "Open", "High", "Low", "Close"])
                    const csv = Papa.unparse(formattedData)
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url
                    link.setAttribute("download", "data.csv")
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                },
            },
        ]

    return <Widget
          headerLeft="Price Chart"
          content={chart}
          minWidth="33vw"
          maxWidth="33vw"
          minHeight="300px"
          maxHeight="600px"
          settings={settings}
        ></Widget>
}

export default TradingViewChart;