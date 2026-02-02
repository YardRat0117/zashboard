const getLatencyFromUrlAPI = (url: string): Promise<number> => {
    return new Promise<number>((resolve) => {
        const startTime = performance.now()
        const img = document.createElement('img')
        img.src = url + '?_=' + new Date().getTime()
        img.style.display = 'none'
        img.onload = (): void => {
            const endTime = performance.now()
            img.remove()

            resolve(endTime - startTime)
        }
        img.onerror = (): void => {
            img.remove()

            resolve(0)
        }

        document.body.appendChild(img)
    })
}

export const getGoogleLatencyAPI = (): Promise<number> => {
    return getLatencyFromUrlAPI('https://www.google.com/favicon.ico')
}

export const getCloudflareLatencyAPI = (): Promise<number> => {
    return getLatencyFromUrlAPI('https://www.cloudflare.com/favicon.ico')
}

export const getGithubLatencyAPI = (): Promise<number> => {
    return getLatencyFromUrlAPI('https://github.githubassets.com/favicon.ico')
}

export const getDockerLatencyAPI = (): Promise<number> => {
    return getLatencyFromUrlAPI('https://www.docker.com/favicon.ico')
}
