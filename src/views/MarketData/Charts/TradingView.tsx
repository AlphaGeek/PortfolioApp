// TradingViewWidget.jsx
import { useEffect, useRef, memo } from 'react';
import Widget from "@/components/Widget/Widget"
import moment from "moment"
import Papa from "papaparse"

function TradingViewWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
            "allow_symbol_change": true,
            "calendar": false,
            "width": 980,
            "height": 610,    
            "details": false,
            "hide_side_toolbar": true,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "hide_volume": false,
            "hotlist": false,
            "interval": "D",
            "locale": "en",
            "save_image": true,
            "style": "1",
            "symbol": "NASDAQ:AAPL",
            "theme": "light",
            "timezone": "Etc/UTC",
            "backgroundColor": "#ffffff",
            "gridColor": "rgba(46, 46, 46, 0.06)",
            "watchlist": [],
            "withdateranges": false,
            "compareSymbols": [],
            "studies": [],
            "autosize": true
        }`;
            if (container.current) {
                container?.current.appendChild(script);
            }

        },
        []
    );

    const chart = (
        <div className="tradingview-widget-container" ref={container} style={{ minHeight: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/NASDAQ-AAPL/" rel="noopener nofollow" target="_blank"><span className="blue-text">AAPL stock chart</span></a><span className="trademark"> by TradingView</span></div>
        </div>
    );

    const settings = [
        {
            label: "Export",
            icon: "pi pi-file-export",
            command: () => {
                if (!chartData) {
                    return
                }
                const formattedData = chartData.map((data) => [
                    moment(data[0]).format("YYYY-MM-DD"),
                    data[1],
                ])
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

    return (
        <Widget
            headerLeft="Price Chart"
            content={chart}
            minWidth="99vw"
            maxWidth="99vw"
            minHeight="100vh"
            maxHeight="100vh"
            settings={settings}
        ></Widget >
    )
}

export default memo(TradingViewWidget);
