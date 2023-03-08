import {
  render as _render,
  renderHook as _renderHook
} from '@testing-library/react'
import { createAPIs } from '.'
import type { ApiVariables } from '.'
import type { RenderHookOptions } from '@testing-library/react'

export const Api = createAPIs({
  USERS: '/users'
})

const RESPONSES = {
  '/users': [
    {
      id: 1,
      name: 'Foo'
    },
    {
      id: 2,
      name: 'Bar'
    }
  ]
}

export const fetch = jest.fn()

function fetcher<T>(api: string, variables: ApiVariables) {
  fetch(api, variables)
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => resolve(RESPONSES[api as keyof typeof RESPONSES] as T), 50);
  })
}

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Api.Provider config={{ fetcher }}>
    {children}
  </Api.Provider>
)

export function render(...args: Parameters<typeof _render>) {
  return _render(args[0], {
    ...args[1],
    wrapper: Wrapper
  })
}

export function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options: RenderHookOptions<Props> = {}
) {
  return _renderHook<Result, Props>(render, {
    ...options,
    wrapper: Wrapper
  })
}