/**
 * USD/KRW 환율 페칭 유틸리티 (Naver & Yahoo Finance 기반)
 */
export const fetchExchangeRate = async () => {
    try {
        // 1. 네이버 증권 기반 실시간 환율 (우선순위 1)
        const naverUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://polling.finance.naver.com/api/realtime?query=SERVICE_MARKETINDEX:FX_USDKRW`
        )}&timestamp=${Date.now()}`;

        const naverResponse = await fetch(naverUrl);
        if (naverResponse.ok) {
            const data = await naverResponse.json();
            const parsed = JSON.parse(data.contents);
            const rate = parsed?.result?.areas?.[0]?.datas?.[0]?.nv;
            if (rate) return rate;
        }

        // 2. 야후 파이낸스 기반 환율 (백업)
        const yahooUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v8/finance/chart/USDKRW=X?interval=1m&range=1d`
        )}&timestamp=${Date.now()}`;

        const yahooResponse = await fetch(yahooUrl);
        if (yahooResponse.ok) {
            const data = await yahooResponse.json();
            const parsed = JSON.parse(data.contents);
            const meta = parsed?.chart?.result?.[0]?.meta;
            const rate = meta?.regularMarketPrice || meta?.previousClose;
            if (rate) return rate;
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
            // 네이버 증권 모바일 API (UTF-8 보장)
            const mobileApiUrl = `https://m.stock.naver.com/api/stock/${code}/integration`;
            url = `https://api.allorigins.win/get?url=${encodeURIComponent(mobileApiUrl)}&timestamp=${Date.now()}`;
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

        let parsedData = JSON.parse(data.contents);

        if (isKoreanStock) {
            // Naver Mobile API 응답 구조
            const stockItem = parsedData?.stockItem;
            if (stockItem) {
                // 한글 이름이 정상적인지 확인 (UTF-8)
                const name = stockItem.stockName || code;
                const price = parseFloat(stockItem.closePrice?.toString().replace(/,/g, '') || 0);

                return {
                    price,
                    name,
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
