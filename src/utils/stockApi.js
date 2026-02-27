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
        const proxyFetch = async (targetUrl) => {
            const proxies = [
                (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`,
                (url) => `https://thingproxy.freeboard.io/fetch/${url}` // 백업 프록시
            ];

            for (const getProxyUrl of proxies) {
                try {
                    const response = await fetch(getProxyUrl(targetUrl));
                    if (response.ok) {
                        const data = await response.json();
                        // AllOrigins는 {contents: "..."} 형태, ThingProxy는 직접 데이터 반환
                        const contents = data.contents || JSON.stringify(data);
                        return JSON.parse(contents);
                    }
                } catch (e) {
                    console.warn(`Proxy failed for ${targetUrl}:`, e);
                }
            }
            throw new Error('All proxies failed');
        };

        if (isKoreanStock) {
            // Naver Mobile API 응답 구조: 여러 가능성 체크
            const item = parsedData?.stockItem ||
                parsedData?.totalInfos?.[0] ||
                parsedData?.result?.areas?.[0]?.datas?.[0] ||
                parsedData;

            if (item) {
                // 한글 이름 (UTF-8) - 다양한 필드 확인
                let name = item.stockName || item.nm || item.itemName || code;

                // 만약 이름이 없거나 코드와 같다면 자동완성 API로 보충 시도
                if (!name || name === code) {
                    try {
                        const acUrl = `https://ac.finance.naver.com/ac?q=${code}&q_enc=utf-8&st=1&frm=stock&r_format=json&r_enc=utf-8&r_unicode=1&t_koreng=1`;
                        const acData = await proxyFetch(acUrl);
                        if (acData?.items?.[0]?.[0]?.[0]) {
                            name = acData.items[0][0][0];
                        }
                    } catch (e) {
                        console.warn('Name enhancement failed:', e);
                    }
                }

                // 가격 정보 필드 확인 (nowPrice, dealPrice, closePrice, nv, lastPrice 등)
                const rawPrice = item.nowPrice ||
                    item.dealPrice ||
                    item.closePrice ||
                    item.nv ||
                    item.lastPrice || 0;

                const price = parseFloat(rawPrice.toString().replace(/,/g, ''));

                return {
                    price,
                    name,
                    code: code,
                    currency: 'KRW'
                };
            }
        } else {
            // 야후 파이낸스 해외 주식
            const yahooApiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${code}?interval=1m&range=1d`;
            const parsedData = await proxyFetch(yahooApiUrl);

            const result = parsedData?.chart?.result?.[0];
            if (result) {
                const meta = result.meta;
                return {
                    price: meta.regularMarketPrice || meta.previousClose,
                    name: meta.symbol || code,
                    code: code,
                    currency: (meta.currency || 'USD').toUpperCase()
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
