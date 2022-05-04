const api = {
  // eslint-disable-next-line require-await
  async get(path, data = {}, headers = {}) {
    return this.call(path, data, headers, 'get')
  },

  // eslint-disable-next-line require-await
  async post(path, data = {}, headers = {}) {
    return this.call(path, data, headers, 'post')
  },

  // eslint-disable-next-line require-await
  async delete(path, data = {}, headers = {}) {
    return this.call(path, data, headers, 'delete')
  },

  // eslint-disable-next-line require-await
  async call(path, data = {}, headers = {}, method = 'get') {
    // const loginToken = localStorage.loginToken
    // const loginToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMGFjMzBjYTc1ODAwMjI1NmRlNDMwODUwYTAyY2Y0ZGEwOTE5MDg1NjRkYmUyZGEzZmQyMTY0MGNkZDlhZGFlYTc0MjJjZDVmMTRlYWEwZjMiLCJpYXQiOjE2NDA2NDEzODAuMDg4MTQ5LCJuYmYiOjE2NDA2NDEzODAuMDg4MTU1LCJleHAiOjE2NzIxNzczODAuMDU4NDM4LCJzdWIiOiIyIiwic2NvcGVzIjpbXX0.jAmRFgKTFw0W0Wiwbber8zbwGOKHGobPch6OBmBdRP8JlY_cwIvYALgKiZEs6E4NIWDZrZiZfnM_ohlTgd4dAJQsxwkTQ8VOXLuqR61M0X839FfQDwfjz9TF5lQks9XFFA7U7_wUf8EyaAqOz_Mea5uc3o5f-5o86y1SdTH4GjRKU5aS0O5_-dqNL3pU83E5st6MDaThrnSDrBJSyg7Ci0h8yNEcikxjfuWYdrlrQrFdGnFm0jOOwJMUlaN4dNW2NeORAihKDjF2tKu6mdi8aBfuURIAD3ZZSy4iXV8BRR4bOsPyXQxWblKuX7kleFyMcbe1QFdmyHyCBzsx_RZCVyq5kE2kgv0khnoN7RJwQksXrlZpHijHDTsyl0E4XenqoYl-zTgbiToaIVQR16HI2VAMokKDgAOBEWbYrETfRPrKlv2vVwIl7RXvdrPaIqOkzEbapLmLhDOhfm9_QjuOY8sCx-zGUiNwCz9KzWnixRWJrVcTLPnnphEngqN9mbaty_0r0ogI9eTl6V3yhsEmeavncMY9_zd57L4BLrLEhvXKGbe1XjoyihjCIW_hu85ROkaAlYJyD5WwD4lyHf49_vwR3QO4SB51EBcTwdg5qYscpc2YaZUHOSL5x_yPS-HsuI5Y9dwBEjzlsFnLT9squBDlqNdPWeQ02tbp096f_9A'
    // Default headers
    const defaultHeaders = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${loginToken}`,
    })

    for (const [key, value] of Object.entries(headers)) {
      defaultHeaders.append(key, value)
    }

    const args = {
      headers: defaultHeaders,
      method,
      credentials: 'same-origin',
    }

    let queryParams = ''

    switch (method) {
      case 'get': {
        const formData = new FormData()

        for (const [key, value] of Object.entries(data)) {
          formData.append(key, value)
        }

        // eslint-disable-next-line no-unused-vars
        queryParams = `?${new URLSearchParams(formData).toString()}`
        break
      }
      case 'post':
        args.body = JSON.stringify(data)
        break
    }

    const response = await fetch(
      `/api/${path}`,
      args
    )
    .catch((exception) => {
      console.log(exception)
    })
    return new Promise(function validateCode(resolve, reject) {
      console.log(response)
      response.json().then((result) => {
        /* eslint-disable prefer-promise-reject-errors */
        ~result.code
          ? resolve({
              data: result,
              code: result.code,
              errors: result.errors,
            })
          : reject(result.errors ? { errors: result.errors } : null)
      })
    })
  },
}

export default api
