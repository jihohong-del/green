/**
 * USD/KRW 환율 페칭 유틸리티 (네이버 증권 기반)
 */
export const fetchExchangeRate = async () => {
    try {
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://finance.naver.com/marketindex/exchangeDetail.naver?marketindexCd=FX_USDKRW`
        )}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Exchange rate fetch failed');
        const data = await response.json();
        const html = data.contents;

        // 정규식으로 환율 추출 (예: <span class="value">1,345.50</span>)
        const match = html.match(/<span class="value">([\d,.]+)<\/span>/);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        return 1350; // 실패 시 기본값 (근사치)
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 1350;
    }
};

/**
 * 실시간 주가 페칭 유틸리티 (국내 및 해외 지원)
 */
export const fetchStockPrice = async (code) => {
    if (!code) return null;

    const isKoreanStock = /^[0-9]{6}$/.test(code);

    try {
        let url;
        if (isKoreanStock) {
            // 네이버 증권 국내 주식 API
            url = `https://api.allorigins.win/get?url=${encodeURIComponent(
                `https://polling.finance.naver.com/api/realtime/site/stock/get?symbol=${code}`
            )}`;
        } else {
            // 야후 파이낸스 해외 주식
            url = `https://api.allorigins.win/get?url=${encodeURIComponent(
                `https://query1.finance.yahoo.com/v8/finance/chart/${code.toUpperCase()}?interval=1m&range=1d`
            )}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const parsedData = JSON.parse(data.contents);

        if (isKoreanStock) {
            if (parsedData?.result?.areas?.[0]?.datas?.[0]) {
                const stockData = parsedData.result.areas[0].datas[0];
                return {
                    price: parseFloat(stockData.nv),
                    name: stockData.nm,
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
                    price: meta.regularMarketPrice,
                    name: code.toUpperCase(),
                    code: code.toUpperCase(),
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
