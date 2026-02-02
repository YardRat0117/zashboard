export interface IPInfo {
    ip: string
    country: string
    region: string
    city: string
    asn: string
    org: string
}

// Local
export const getLocalIPInfo = async (): Promise<IPInfo> => {
    const response = await fetch('https://myip.ipip.net/json?t=' + Date.now())
    const result = (await response.json()) as {
        ret: string
        data: {
            ip: string
            location: string[]
        }
    }

    const [country, region, city, _, org] = result.data.location

    return {
        ip: result.data.ip,
        country: country || '',
        region: region || '',
        city: city || '',
        asn: '',
        org: org || '',
    }
}

// Global
export const getGlobalIPInfo = async (): Promise<IPInfo> => {
    const response = await fetch('https://ipapi.co/json/')
    const result = (await response.json()) as {
        ip: string
        country: string
        region: string
        city: string
        org: string
        asn: string
    }

    return {
        ip: result.ip,
        country: result.country,
        region: result.region,
        city: result.city,
        org: result.org,
        asn: result.asn,
    }
}

// Lookup
export const getIPInfo = async (ip: string | undefined): Promise<IPInfo> => {
    if (!ip) throw new Error('IP address is required')

    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const result = (await response.json()) as {
        ip: string
        country: string
        region: string
        city: string
        org: string
        asn: string
    }

    return {
        ip: result.ip,
        country: result.country,
        region: result.region,
        city: result.city,
        org: result.org,
        asn: result.asn,
    }
}
