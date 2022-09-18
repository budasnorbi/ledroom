class Api {
  baseURL: string
  constructor(baseUrl: string) {
    this.baseURL = baseUrl
  }

  async get<ServerResponse>(
    urlPart: string,
    headers: { [key: string]: string } = { "Content-Type": "application/json" },
    abortController?: AbortController
  ): Promise<ServerResponse | null> {
    const config: RequestInit = {
      method: "GET",
      headers
    }

    if (abortController) {
      config.signal = abortController.signal
    }

    try {
      const response = await fetch(`${this.baseURL}${urlPart}`, config)
      return response.json()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async post<ServerResponse>(
    urlPart: string,
    body: { [key: string]: string | number | {} | [] },
    headers: { [key: string]: string } = { "Content-Type": "application/json" }
  ): Promise<ServerResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}${urlPart}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      })
      return response.json()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async uploadFile<ServerResponse>(
    urlPart: string,
    body: FormData
  ): Promise<ServerResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}${urlPart}`, {
        method: "POST",
        body
      })
      return response.json()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async put<ServerResponse>(
    urlPart: string,
    body?: { [key: string]: string | number | {} | [] },
    headers: { [key: string]: string } = { "Content-Type": "application/json" }
  ): Promise<ServerResponse | null> {
    const config: RequestInit = {
      method: "PUT",
      headers
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseURL}${urlPart}`, config)

      return response.json()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async delete<ServerResponse>(
    urlPart: string,
    headers: { [key: string]: string } = { "Content-Type": "application/json" }
  ): Promise<ServerResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}${urlPart}`, {
        method: "DELETE",
        headers
      })
      return response.json()
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

export default new Api(process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC + "/api")
