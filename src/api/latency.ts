const getLatencyFromUrlAPI = (url: string) => {
    return new Promise<number>((resolve) => {
        const startTime = performance.now()
        const img = document.createElement('img')
        img.src = url + '?_=' + new Date().getTime()
        img.style.display = 'none'
        img.onload = () => {
            const endTime = performance.now()
            img.remove()

            resolve(endTime - startTime)
        }
        img.onerror = () => {
            img.remove()

            resolve(0)
        }

        document.body.appendChild(img)
    })
}

export const getGoogleLatencyAPI = () => {
    return getLatencyFromUrlAPI('https://www.google.com/favicon.ico')
}

export const getCloudflareLatencyAPI = () => {
    return getLatencyFromUrlAPI('https://www.cloudflare.com/favicon.ico')
}

export const getGithubLatencyAPI = () => {
    return getLatencyFromUrlAPI('https://github.githubassets.com/favicon.ico')
}

export const getDockerLatencyAPI = () => {
    return getLatencyFromUrlAPI('https://www.docker.com/favicon.ico')
}
