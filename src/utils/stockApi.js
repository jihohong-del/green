/**
 * USD/KRW 환율 페칭 유틸리티 (Yahoo Finance 기반)
 */
export const fetchExchangeRate = async () => {
    try {
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v8/finance/chart/USDKRW=X?interval=1m&range=1d`
        )}&timestamp=${Date.now()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Exchange rate fetch failed');
        const data = await response.json();
        const parsedData = JSON.parse(data.contents);

        const meta = parsedData?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice || meta?.previousClose;

        if (price) {
            return price;
        }
        return 1350; // 최종 실패 시 기본값
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 1350;
    }
};

/**
 * 실시간 주가 페칭 유틸리티 (국내 및 해외 지원)
 */
export const fetchStockPrice = async (inputCode) => {
    if (!inputCode) return null;
    const code = inputCode.trim().toUpperCase();

    const isKoreanStock = /^[0-9]{6}$/.test(code);

    try {
        let url;
        if (isKoreanStock) {
            // 네이버 증권 국내 주식 API (QUERY 기반 대안)
            url = `https://api.allorigins.win/get?url=${encodeURIComponent(
                `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${code}`
            )}&timestamp=${Date.now()}`;
        } else {
            // 야후 파이낸스 해외 주식
            url = `https://api.allorigins.win/get?url=${encodeURIComponent(
                `https://query1.finance.yahoo.com/v8/finance/chart/${code}?interval=1m&range=1d`
            )}&timestamp=${Date.now()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Proxy server error');

        const data = await response.json();
        if (!data.contents) throw new Error('No data received from proxy');

        const parsedData = JSON.parse(data.contents);

        if (isKoreanStock) {
            // Naver SERVICE_ITEM API 응답 구조: parsedData.result.areas[0].datas[0]
            const stockData = parsedData?.result?.areas?.[0]?.datas?.[0] ||
                parsedData?.resultData?.serviceItem?.[0] ||
                parsedData?.result?.list?.[0];

            if (stockData) {
                return {
                    price: parseFloat(stockData.nv || stockData.nowPrice || stockData.closePrice || 0),
                    name: stockData.nm || stockData.itemCode || stockData.stockName || code,
                    code: code,
                    currency: 'KRW'
                };
            }
        } else {
            // 야후 파이낸스 파싱
            const result = parsedData?.chart?.result?.[0];
            if (result) {
                const meta = result.meta;
                return {
                    price: meta.regularMarketPrice || meta.previousClose,
                    name: meta.symbol || code,
                    code: code,
                    currency: meta.currency || 'USD'
                };
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching price for ${code}:`, error);
        return null;
    }
};

/**
 * 여러 종목의 주가를 병렬로 업데이트 (환율 적용 포함)
 */
export const fetchMultipleStockPrices = async (stocks) => {
    const exchangeRate = await fetchExchangeRate();

    const fetchPromises = stocks
        .filter(s => s.code)
        .map(s => fetchStockPrice(s.code));

    const results = await Promise.all(fetchPromises);

    return {
        updatedStocks: results.filter(r => r !== null),
        exchangeRate
    };
};
