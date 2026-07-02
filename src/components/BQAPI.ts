export default class BQAPIFetcher {
  private static readonly BASE_URL = 'http://192.168.68.202:8080/bqapi/v2.1'
  private status: 'FETCHED' | 'FETCHING' | 'UNUSED' | 'ERROR' = 'UNUSED'
  public resp: unknown = {}
  public meta: unknown = {}
  public issue: unknown = {}

  public getStatus(): 'FETCHED' | 'FETCHING' | 'UNUSED' | 'ERROR' {
    return this.status
  }

  /**
   * Fetches data from a specific endpoint, updates the internal state, and returns the data.
   * @param endpoint - The API path (e.g., "/users/admin")
   * @returns The status of the fetch operation ('FETCHED', 'FETCHING', 'UNUSED', or 'ERROR').
   */
  public async callAPI(
    endpoint: string,
    method: string = 'GET',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any = {},
  ): Promise<BQAPIFetcher> {
    if (!endpoint.startsWith('/')) endpoint = `/${endpoint}` // Ensure the endpoint starts with a slash
    try {
      this.status = 'FETCHING'
      // Append the endpoint parameter to the static base URL
      const targetUrl = `${BQAPIFetcher.BASE_URL}${endpoint}`

      const response = await fetch(targetUrl, {
        method: method,
        body: method == 'GET' ? null : JSON.stringify(body),
      })
      if (!response.ok) {
        this.status = 'ERROR'
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Wait for the JSON parsing to complete
      const temp = await response.json()
      // temp.meta = temp.meta
      // temp.resp = temp.resp
      // temp.issue = temp.issue
      this.meta = temp.meta
      this.resp = temp.resp
      this.issue = temp.issue
      // Update internal state (triggers Vue reactivity updates)
      // this._json.value = data

      // Return the same value to the caller
      this.status = 'FETCHED'
      return this
    } catch (error) {
      this.status = 'ERROR'
      console.error(`Failed to fetch from ${endpoint}:`, error)
      // this._json.value = null
      throw error // Re-throw so the calling code knows it failed
    }
  }
}
