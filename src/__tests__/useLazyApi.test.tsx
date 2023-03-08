import { waitFor } from '@testing-library/react'
import { fetch, Api, renderHook } from '../test-utils'
import type { UseApiOptions } from '..'

describe('useLazyApi', () => {
  afterEach(() => {
   jest.clearAllMocks()
  })

  it('lazy fetch data', async () => {
    const { result } = renderHook(() => Api.useLazyApi('USERS'))

    expect(result.current[1].loading).toBeFalsy()
    expect(result.current[1].data).toBeUndefined()
    expect(result.current[1].data).toBeUndefined()

    waitFor(() => result.current[0]())
    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(result.current[1].loading).toBeTruthy()

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result.current[1].loading).toBeFalsy()
    expect(result.current[1].error).toBeNull()
    expect(result.current[1].data).toEqual([
      {
        id: 1,
        name: 'Foo'
      },
      {
        id: 2,
        name: 'Bar'
      }
    ])
  })

  it("fetch data with variables", async () => {
    const { result } = renderHook((opts: UseApiOptions<any, any, any>) => Api.useLazyApi('USERS', opts), {
      initialProps: { variables: { query: { limit: 10 } } }
    })

    await waitFor(() => result.current[0]())

    expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 10 } })

    await waitFor(() => result.current[0]({ variables: { query: { limit: 20 } } }))

    expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 20 } })
  })

  it("callback events", async () => {
    const onFetch = jest.fn()
    const onCompleted = jest.fn()
    const { result } = renderHook(() => Api.useLazyApi('USERS', {
      onFetch,
      onCompleted
    }))

    await waitFor(() => result.current[0]())

    expect(onFetch).toHaveBeenCalledTimes(1)
    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(onCompleted).toHaveBeenCalledWith({
      data: [
        {
          id: 1,
          name: 'Foo'
        },
        {
          id: 2,
          name: 'Bar'
        }
      ],
      error: null
    })
  })
})